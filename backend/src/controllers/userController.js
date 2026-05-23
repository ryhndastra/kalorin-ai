const prisma = require("../config/prisma");
const { calculateUserStatus } = require("../utils/bmiUtils");
const { calculateDailyNeeds } = require("../utils/calculatorUtils");
const { getJakartaDayRange } = require("../utils/dateUtils");
const {
  isBlank,
  hasInvalidNumber,
} = require("../utils/requestValidation");

const createOrUpdateProfile = async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      weight,
      height,
      goal,
      birthdate,
      dailyCalories,
      proteinTarget,
    } = req.body;

    if (isBlank(userId) || isBlank(email)) {
      return res.status(400).json({
        success: false,
        message: "User ID and email are required",
      });
    }

    if (
      hasInvalidNumber(req.body, [
        "weight",
        "height",
        "dailyCalories",
        "proteinTarget",
      ])
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid numeric profile fields",
      });
    }

    if (birthdate && Number.isNaN(new Date(birthdate).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid birthdate",
      });
    }

    // ambil data lama dari db untuk dibandingin (jika ada)
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    // hitung status BMI
    const userStatus =
      weight && height
        ? calculateUserStatus(weight, height)
        : existingProfile?.userStatus || null;

    // logic auto-calculate kebutuhan kalori & protein berdasarkan data terbaru (jika ada perubahan fisik atau goal, dan tidak sedang input manual)
    let finalCalories = dailyCalories;
    let finalProtein = proteinTarget;

    // kondisi bakal jalan kalau:
    // a. user baru (tidak ada existingProfile)
    // b. user lama ganti goal, berat, atau tinggi, dan tidak sedang input kalori manual
    const isPhysicalDataChanged =
      (weight && weight !== existingProfile?.weight) ||
      (height && height !== existingProfile?.height) ||
      (goal && goal !== existingProfile?.goal);

    const isManualInput =
      dailyCalories > 0 && dailyCalories !== existingProfile?.dailyCalories;

    if ((!existingProfile || isPhysicalDataChanged) && !isManualInput) {
      // hitung ulang pake data terbaru (pake data lama sebagai fallback)
      const autoNeeds = calculateDailyNeeds(
        weight || existingProfile?.weight || 0,
        height || existingProfile?.height || 0,
        birthdate || existingProfile?.birthdate,
        goal || existingProfile?.goal || "Stay Healthy",
      );
      finalCalories = autoNeeds.calories;
      finalProtein = autoNeeds.protein;
    }

    const profile = await prisma.profile.upsert({
      where: { userId: userId },
      update: {
        fullName: name,
        ...(weight > 0 && { weight: parseFloat(weight) }),
        ...(height > 0 && { height: parseFloat(height) }),
        ...(goal && { goal: goal }),
        ...(userStatus && { userStatus: userStatus }),
        ...(birthdate && { birthdate: new Date(birthdate) }),

        dailyCalories:
          dailyCalories > 0
            ? parseInt(dailyCalories) // prioritas Input Manual
            : finalCalories > 0
              ? parseInt(finalCalories) // hasil Hitung Otomatis (Jika ada perubahan BB/TB/Goal)
              : existingProfile?.dailyCalories || 2000, // pake data lama di DB (Fallback terakhir 2000)

        proteinTarget:
          proteinTarget > 0
            ? parseInt(proteinTarget)
            : finalProtein > 0
              ? parseInt(finalProtein)
              : existingProfile?.proteinTarget || 100,
      },
      create: {
        userId,
        email,
        fullName: name || "User",
        weight: parseFloat(weight) || 0,
        height: parseFloat(height) || 0,
        goal: goal || "Stay Healthy",
        userStatus: userStatus || "Normal",
        birthdate: birthdate ? new Date(birthdate) : null,
        dailyCalories: parseInt(finalCalories) || 2000,
        proteinTarget: parseInt(finalProtein) || 100,
      },
    });

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error("Error in createOrUpdateProfile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (isBlank(userId)) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profil tidak ditemukan" });
    }

    const { startOfDay, endOfDay } = getJakartaDayRange();

    // hitung statistik makan hari ini
    const mealsToday = await prisma.dailyLog.count({
      where: {
        userId: userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    const nutritionToday = await prisma.dailyLog.aggregate({
      where: {
        userId: userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      _sum: { calories: true, proteins: true, fat: true, carbs: true },
    });

    const stats = nutritionToday._sum;
    const totalCaloriesEaten = stats.calories || 0;
    const dailyGoal = profile.dailyCalories || 2000;

    // kalkulasi BMI & Rentang Ideal
    const weight = profile.weight || 0;
    const heightInMeter = (profile.height || 0) / 100;

    let bmiValue = 0;
    let bmiStatus = "Data tidak lengkap";
    let minIdealWeight = 0;
    let maxIdealWeight = 0;

    if (heightInMeter > 0 && weight > 0) {
      // hitung angka BMI
      bmiValue = weight / (heightInMeter * heightInMeter);

      // menentukan status BMI
      if (bmiValue < 18.5) bmiStatus = "Underweight";
      else if (bmiValue < 25) bmiStatus = "Ideal/Normal";
      else if (bmiValue < 30) bmiStatus = "Overweight";
      else bmiStatus = "Obese";

      // hitung bb Ideal berdasarkan tinggi (rumus BMI standar 18.5 - 24.9)
      minIdealWeight = (18.5 * (heightInMeter * heightInMeter)).toFixed(1);
      maxIdealWeight = (24.9 * (heightInMeter * heightInMeter)).toFixed(1);
    }

    res.json({
      success: true,
      data: {
        ...profile,
        bmi: bmiValue.toFixed(1),
        bmiStatus: bmiStatus, // kategori status (Normal, Overweight, dll)
        idealWeightRange: {
          min: parseFloat(minIdealWeight),
          max: parseFloat(maxIdealWeight),
          label: `${minIdealWeight}kg - ${maxIdealWeight}kg`,
        },
        today_stats: {
          meals_count: mealsToday,
          calories_consumed: totalCaloriesEaten,
          proteins: stats.proteins || 0,
          fat: stats.fat || 0,
          carbs: stats.carbs || 0,
          is_on_track: totalCaloriesEaten <= dailyGoal,
        },
      },
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrUpdateProfile, getProfile };
