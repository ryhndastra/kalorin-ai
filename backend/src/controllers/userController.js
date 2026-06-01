const prisma = require("../config/prisma");
const { calculateUserStatus } = require("../utils/bmiUtils");
const {
  ACTIVITY_FACTORS,
  calculateAge,
  calculateDailyNeeds,
  normalizeActivityLevel,
  normalizeGender,
} = require("../utils/calculatorUtils");
const { getJakartaDayRange } = require("../utils/dateUtils");
const {
  isBlank,
  hasInvalidNumber,
} = require("../utils/requestValidation");
const toBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
};

const PROFILE_LIMITS = {
  minAge: 12,
  maxAge: 100,
  minWeight: 25,
  maxWeight: 300,
  minHeight: 120,
  maxHeight: 250,
};

const sanitizeName = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const createOrUpdateProfile = async (req, res, next) => {
  try {
    const {
      name,
      weight,
      height,
      gender,
      activityLevel,
      isPregnant,
      isBreastfeeding,
      hasMedicalCondition,
      goal,
      birthdate,
      dailyCalories,
      proteinTarget,
    } = req.body;
    const userId = req.user?.uid;
    const email = req.user?.email || req.body.email;
    const tokenDisplayName = sanitizeName(req.user?.name);
    const inputName = sanitizeName(name);

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

    let parsedBirthdate = null;
    if (birthdate) {
      parsedBirthdate = new Date(birthdate);
    }

    if (birthdate && Number.isNaN(parsedBirthdate?.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid birthdate",
      });
    }

    const now = new Date();
    const latestBirthdateInput = birthdate || null;
    const latestBirthdateDate = latestBirthdateInput
      ? new Date(latestBirthdateInput)
      : null;
    if (latestBirthdateDate && latestBirthdateDate > now) {
      return res.status(400).json({
        success: false,
        message: "Birthdate cannot be in the future",
      });
    }

    // ambil data lama dari db untuk dibandingin (jika ada)
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    const normalizedGender = gender
      ? normalizeGender(gender)
      : existingProfile?.gender || null;
    const normalizedActivityLevel = activityLevel
      ? normalizeActivityLevel(activityLevel)
      : existingProfile?.activityLevel || "sedentary";
    const normalizedIsPregnant = toBoolean(
      isPregnant,
      existingProfile?.isPregnant || false,
    );
    const normalizedIsBreastfeeding = toBoolean(
      isBreastfeeding,
      existingProfile?.isBreastfeeding || false,
    );
    const normalizedHasMedicalCondition = toBoolean(
      hasMedicalCondition,
      existingProfile?.hasMedicalCondition || false,
    );

    if (gender && !normalizedGender) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender",
      });
    }

    if (
      activityLevel &&
      !ACTIVITY_FACTORS[String(activityLevel).trim().toLowerCase()]
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity level",
      });
    }

    const numericWeight =
      weight !== undefined && weight !== null ? parseFloat(weight) : null;
    const numericHeight =
      height !== undefined && height !== null ? parseFloat(height) : null;

    if (numericWeight !== null && numericWeight > 0) {
      if (
        numericWeight < PROFILE_LIMITS.minWeight ||
        numericWeight > PROFILE_LIMITS.maxWeight
      ) {
        return res.status(400).json({
          success: false,
          message: `Weight must be between ${PROFILE_LIMITS.minWeight} and ${PROFILE_LIMITS.maxWeight} kg`,
        });
      }
    }

    if (numericHeight !== null && numericHeight > 0) {
      if (
        numericHeight < PROFILE_LIMITS.minHeight ||
        numericHeight > PROFILE_LIMITS.maxHeight
      ) {
        return res.status(400).json({
          success: false,
          message: `Height must be between ${PROFILE_LIMITS.minHeight} and ${PROFILE_LIMITS.maxHeight} cm`,
        });
      }
    }

    const latestBirthdateForAge = birthdate || existingProfile?.birthdate;
    if (latestBirthdateForAge) {
      const age = calculateAge(latestBirthdateForAge);
      if (age < PROFILE_LIMITS.minAge || age > PROFILE_LIMITS.maxAge) {
        return res.status(400).json({
          success: false,
          message: `Age must be between ${PROFILE_LIMITS.minAge} and ${PROFILE_LIMITS.maxAge} years`,
        });
      }
    }

    if (
      normalizedGender === "male" &&
      (normalizedIsPregnant || normalizedIsBreastfeeding)
    ) {
      return res.status(400).json({
        success: false,
        message: "Pregnancy and breastfeeding options are only available for female profiles",
      });
    }

    // hitung status BMI
    const userStatus =
      numericWeight && numericHeight
        ? calculateUserStatus(numericWeight, numericHeight)
        : existingProfile?.userStatus || null;

    // logic auto-calculate kebutuhan kalori & protein berdasarkan data terbaru (jika ada perubahan fisik atau goal, dan tidak sedang input manual)
    let finalCalories = dailyCalories;
    let finalProtein = proteinTarget;

    // kondisi bakal jalan kalau:
    // a. user baru (tidak ada existingProfile)
    // b. user lama ganti goal, berat, atau tinggi, dan tidak sedang input kalori manual
    const isPhysicalDataChanged =
      (numericWeight && numericWeight !== existingProfile?.weight) ||
      (numericHeight && numericHeight !== existingProfile?.height) ||
      (normalizedGender && normalizedGender !== existingProfile?.gender) ||
      (normalizedActivityLevel &&
        normalizedActivityLevel !== existingProfile?.activityLevel) ||
      normalizedIsPregnant !== Boolean(existingProfile?.isPregnant) ||
      normalizedIsBreastfeeding !== Boolean(existingProfile?.isBreastfeeding) ||
      normalizedHasMedicalCondition !==
        Boolean(existingProfile?.hasMedicalCondition) ||
      (goal && goal !== existingProfile?.goal);

    const isManualInput =
      dailyCalories > 0 && dailyCalories !== existingProfile?.dailyCalories;

    const latestBirthdate = birthdate || existingProfile?.birthdate;
    const latestAge = latestBirthdate ? calculateAge(latestBirthdate) : 0;
    const needsManualTargets =
      latestAge > 0 &&
      (latestAge < 18 ||
        normalizedIsPregnant ||
        normalizedIsBreastfeeding ||
        normalizedHasMedicalCondition);

    if ((!existingProfile || isPhysicalDataChanged) && !isManualInput) {
      // hitung ulang pake data terbaru (pake data lama sebagai fallback)
      const autoNeeds = calculateDailyNeeds(
        numericWeight || existingProfile?.weight || 0,
        numericHeight || existingProfile?.height || 0,
        birthdate || existingProfile?.birthdate,
        goal || existingProfile?.goal || "Stay Healthy",
        normalizedGender || existingProfile?.gender,
        normalizedActivityLevel || existingProfile?.activityLevel,
        {
          isPregnant: normalizedIsPregnant,
          isBreastfeeding: normalizedIsBreastfeeding,
          hasMedicalCondition: normalizedHasMedicalCondition,
        },
      );
      finalCalories = autoNeeds.calories;
      finalProtein = autoNeeds.protein;
    }

    const finalName =
      inputName ||
      tokenDisplayName ||
      sanitizeName(existingProfile?.fullName) ||
      "User";

    const profile = await prisma.profile.upsert({
      where: { userId: userId },
      update: {
        ...(finalName && { fullName: finalName }),
        ...(numericWeight > 0 && { weight: numericWeight }),
        ...(numericHeight > 0 && { height: numericHeight }),
        ...(normalizedGender && { gender: normalizedGender }),
        ...(normalizedActivityLevel && {
          activityLevel: normalizedActivityLevel,
        }),
        isPregnant: normalizedIsPregnant,
        isBreastfeeding: normalizedIsBreastfeeding,
        hasMedicalCondition: normalizedHasMedicalCondition,
        ...(goal && { goal: goal }),
        ...(userStatus && { userStatus: userStatus }),
        ...(birthdate && { birthdate: new Date(birthdate) }),

        dailyCalories:
          dailyCalories > 0
            ? parseInt(dailyCalories) // prioritas Input Manual
            : needsManualTargets
              ? existingProfile?.dailyCalories || 2000
            : finalCalories > 0
              ? parseInt(finalCalories) // hasil Hitung Otomatis (Jika ada perubahan BB/TB/Goal)
              : existingProfile?.dailyCalories || 2000, // pake data lama di DB (Fallback terakhir 2000)

        proteinTarget:
          proteinTarget > 0
            ? parseInt(proteinTarget)
            : needsManualTargets
              ? existingProfile?.proteinTarget || 100
            : finalProtein > 0
              ? parseInt(finalProtein)
              : existingProfile?.proteinTarget || 100,
      },
      create: {
        userId,
        email,
        fullName: finalName,
        weight: numericWeight || 0,
        height: numericHeight || 0,
        gender: normalizedGender,
        isPregnant: normalizedIsPregnant,
        isBreastfeeding: normalizedIsBreastfeeding,
        hasMedicalCondition: normalizedHasMedicalCondition,
        activityLevel: normalizedActivityLevel,
        goal: goal || "Stay Healthy",
        userStatus: userStatus || "Normal",
        birthdate: birthdate ? new Date(birthdate) : null,
        dailyCalories: parseInt(finalCalories) || 2000,
        proteinTarget: parseInt(finalProtein) || 100,
      },
    });

    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.uid;

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
    next(error);
  }
};

module.exports = { createOrUpdateProfile, getProfile };
