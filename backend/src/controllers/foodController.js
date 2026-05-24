const { searchExternalFood } = require("../services/externalApiService");
const prisma = require("../config/prisma");
const isDev = process.env.NODE_ENV !== "production";

const getAllFoods = async (req, res, next) => {
  try {
    const foods = await prisma.food.findMany({
      take: 50, // ambil 50 data, takut berat
    });
    res.json({ success: true, data: foods });
  } catch (error) {
    next(error);
  }
};

const getFoodById = async (req, res, next) => {
  try {
    const foodId = Number(req.params.id);

    if (!Number.isInteger(foodId) || foodId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    const food = await prisma.food.findUnique({
      where: { id: foodId },
    });
    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Makanan tidak ditemukan" });
    }
    res.json({ success: true, data: food });
  } catch (error) {
    next(error);
  }
};

const searchFood = async (req, res, next) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res
        .status(400)
        .json({ success: false, message: "Keyword dibutuhkan" });
    }

    // Cari di Database Lokal (Supabase) dulu
    const localFoods = await prisma.food.findMany({
      where: {
        name: {
          contains: keyword,
          mode: "insensitive", // Biar huruf besar/kecil gak ngaruh
        },
      },
      take: 5,
    });

    // Kalau di lokal datanya kosong atau kurang dari 3, panggil API Luar
    let externalFoods = [];
    if (localFoods.length < 3) {
      if (isDev) {
        console.info(
          `Pencarian lokal untuk "${keyword}" sedikit, memanggil API eksternal...`,
        );
      }
      externalFoods = await searchExternalFood(keyword);
    }

    // Gabungkan hasil lokal dan eksternal
    const finalResults = [...localFoods, ...externalFoods];

    return res.status(200).json({
      success: true,
      data: finalResults,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAllFoods, getFoodById, searchFood };
