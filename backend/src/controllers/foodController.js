const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { searchExternalFood } = require("../services/externalApiService");
const prisma = require("../config/prisma");

const getAllFoods = async (req, res) => {
  try {
    const foods = await prisma.food.findMany({
      take: 50, // ambil 50 data, takut berat
    });
    res.json({ success: true, data: foods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFoodById = async (req, res) => {
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
    if (!food)
      return res.status(404).json({ message: "Makanan tidak ditemukan" });
    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const searchFood = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ success: false, message: "Keyword dibutuhkan" });
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
      console.log(`Pencarian lokal untuk "${keyword}" sedikit, memanggil API eksternal...`);
      externalFoods = await searchExternalFood(keyword);
    }

    // Gabungkan hasil lokal dan eksternal
    const finalResults = [...localFoods, ...externalFoods];

    return res.status(200).json({
      success: true,
      data: finalResults,
    });
  } catch (error) {
    console.error("❌ Search Food Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getAllFoods, getFoodById, searchFood };
