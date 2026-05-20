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

module.exports = { getAllFoods, getFoodById };
