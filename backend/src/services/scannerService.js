const axios = require("axios");
const FormData = require("form-data");
const prisma = require("../config/prisma");
const foodAliasMap = require("../utils/foodAliasMap");
const isDev = process.env.NODE_ENV !== "production";
const debugLog = (...args) => {
  if (isDev) console.debug(...args);
};

// SCAN FOOD IMAGE
const scanFoodImage = async (fileBuffer, fileName) => {
  try {
    // FORM DATA
    const formData = new FormData();
    formData.append("file", fileBuffer, fileName);

    // SEND TO AI SERVICE
    const aiResponse = await axios.post(
      "http://127.0.0.1:8000/predict-food",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    const aiData = aiResponse.data;
    debugLog("AI RESPONSE:", aiData);

    // AI FAILED
    if (!aiData.success) {
      return {
        success: false,
        message: aiData.message,
        predicted_food: aiData.predicted_food,
        confidence: aiData.confidence,
      };
    }

    // NORMALIZE AI FOOD
    const normalizedFood = aiData.food.toLowerCase().trim();

    // ALIAS LOOKUP
    const searchFood = foodAliasMap[normalizedFood] || normalizedFood;

    debugLog("SEARCH FOOD:", searchFood);

    // FIND FOOD
    const food = await prisma.food.findFirst({
      where: {
        name: {
          contains: searchFood,
          mode: "insensitive",
        },
      },
    });

    debugLog("FOUND FOOD:", food);

    // FOOD NOT FOUND
    if (!food) {
      return {
        success: false,
        message: "Food detected but nutrition data was not found.",
        food: aiData.food,
      };
    }

    // SUCCESS
    return {
      success: true,
      food: food.name,
      confidence: aiData.confidence,
      calories: food.calories,
      proteins: food.proteins,
      fat: food.fat,
      carbohydrate: food.carbohydrate,
      image: food.image,
    };
  } catch (error) {
    console.error(
      "Scanner service error:",
      error.response?.data || error.message || error,
    );

    return {
      success: false,
      message:
        error.response?.data || error.message || "Failed to scan food image.",
    };
  }
};

module.exports = {
  scanFoodImage,
};
