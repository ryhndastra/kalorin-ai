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
const getQuickInsight = async (req, res, next) => {
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
    return next(error);
  }
};

// FOOD LIST
const getRecommendedFoodList = async (req, res, next) => {
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
    return next(error);
  }
};

// FOOD DETAIL
const getFoodRecommendation = async (req, res, next) => {
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
    return next(error);
  }
};

module.exports = {
  getQuickInsight,
  getRecommendedFoodList,
  getFoodRecommendation,
};
