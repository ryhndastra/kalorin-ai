const { generateInsight } = require("../services/insightService");
const {
  generateRecommendationList,
  generateFoodDetail,
} = require("../services/recommendationService");
const {
  isBlank,
  isPositiveNumber,
} = require("../utils/requestValidation");

// QUICK INSIGHT
const getQuickInsight = async (req, res) => {
  try {
    const { macroContext } = req.body;
    const userId = req.user?.uid;

    if (isBlank(userId)) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const recommendation = await generateInsight(userId, macroContext);

    return res.status(200).json({
      success: true,
      recommendation,
    });
  } catch (error) {
    console.error("❌ Controller Insight Error:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate insight",
    });
  }
};

// FOOD LIST
const getRecommendedFoodList = async (req, res) => {
  try {
    const userId = req.user?.uid;

    if (isBlank(userId)) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const data = await generateRecommendationList(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ Controller Recommendation Error:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate recommendations",
    });
  }
};

// FOOD DETAIL
const getFoodRecommendation = async (req, res) => {
  try {
    const { foodId } = req.body;
    const userId = req.user?.uid;

    if (isBlank(userId) || !isPositiveNumber(foodId)) {
      return res.status(400).json({
        success: false,
        error: "Valid userId and foodId are required",
      });
    }

    const recommendation = await generateFoodDetail(userId, foodId);

    return res.status(200).json({
      success: true,
      recommendation,
    });
  } catch (error) {
    console.error("❌ Controller Food Detail Error:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to get detail recommendation",
    });
  }
};

module.exports = {
  getQuickInsight,
  getRecommendedFoodList,
  getFoodRecommendation,
};
