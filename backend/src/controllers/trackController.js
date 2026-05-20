const prisma = require("../config/prisma");
const {
  getJakartaDayRange,
  formatJakartaWeekday,
} = require("../utils/dateUtils");
const {
  hasInvalidNumber,
  isPositiveNumber,
} = require("../utils/requestValidation");

// ADD MEAL TO DAILY LOG
const addMealLog = async (req, res) => {
  try {
    const {
      userId,
      foodId,
      foodName,
      calories,
      proteins,
      fat,
      carbs,
      quantity = 1,
      mealType = "meal",
    } = req.body;

    // VALIDATION
    if (!userId || !foodName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (
      hasInvalidNumber(req.body, ["calories", "proteins", "fat", "carbs"]) ||
      (!isPositiveNumber(quantity) && quantity !== undefined)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid numeric fields",
      });
    }

    // GET DAY NAME
    const day = formatJakartaWeekday(new Date());

    // CREATE DAILY LOG
    const mealLog = await prisma.dailyLog.create({
      data: {
        userId,
        foodId,
        foodName,
        calories: parseFloat(calories) || 0,
        proteins: parseFloat(proteins) || 0,
        fat: parseFloat(fat) || 0,
        carbs: parseFloat(carbs) || 0,
        quantity: parseFloat(quantity) || 1,
        mealType,
        day: day.toLowerCase(),
      },
    });

    res.json({
      success: true,
      data: mealLog,
    });
  } catch (error) {
    console.error("❌ Error addMealLog:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET DAILY LOGS
const getDailyLogs = async (req, res) => {
  try {
    const { userId, date } = req.query;

    // VALIDATION
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const dayRange = getJakartaDayRange(date);

    if (!dayRange) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const { startOfDay, endOfDay } = dayRange;

    // FETCH LOGS
    const logs = await prisma.dailyLog.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // CALCULATE TOTALS
    const totals = logs.reduce(
      (acc, log) => {
        acc.calories += log.calories || 0;
        acc.proteins += log.proteins || 0;
        acc.fat += log.fat || 0;
        acc.carbs += log.carbs || 0;
        return acc;
      },
      {
        calories: 0,
        proteins: 0,
        fat: 0,
        carbs: 0,
      },
    );

    res.json({
      success: true,
      data: {
        logs,
        totals,
      },
    });
  } catch (error) {
    console.error("❌ Error getDailyLogs:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addMealLog,
  getDailyLogs,
};
