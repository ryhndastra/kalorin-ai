const prisma = require("../../config/prisma");
const { getJakartaRollingRange } = require("../../utils/dateUtils");

// GET FOOD PATTERN ANALYSIS
const getFoodPatternService = async (userId) => {
  const { startOfRange, endOfRange } = getJakartaRollingRange(7);

  // FETCH LOGS
  const logs = await prisma.dailyLog.findMany({
    where: {
      userId,
        date: {
        gte: startOfRange,
        lte: endOfRange,
      },
    },
    orderBy: {
      calories: "desc",
    },
  });

  // EMPTY
  if (!logs.length) {
    return {
      dominantFoods: [],
      dominantMealType: null,
      highestCalorieFood: null,
      highestProteinFood: null,
      weekendCalories: 0,
      weekdayCalories: 0,
      lateNightEatingCount: 0,
    };
  }

  // FOOD COUNTER
  const foodFrequency = {};

  logs.forEach((log) => {
    const food = log.foodName || "Unknown Food";
    if (!foodFrequency[food]) {
      foodFrequency[food] = 0;
    }
    foodFrequency[food]++;
  });

  // TOP FOODS
  const dominantFoods = Object.entries(foodFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([food]) => food);

  // HIGHEST CALORIE FOOD
  const highestCalorieFood =
    [...logs].sort((a, b) => (b.calories || 0) - (a.calories || 0))[0]
      ?.foodName || null;

  // HIGHEST PROTEIN FOOD
  const highestProteinFood =
    [...logs].sort((a, b) => (b.proteins || 0) - (a.proteins || 0))[0]
      ?.foodName || null;

  // DOMINANT MEAL TYPE
  const mealTypeCount = {};

  logs.forEach((log) => {
    const meal = log.mealType || "unknown";

    if (!mealTypeCount[meal]) {
      mealTypeCount[meal] = 0;
    }
    mealTypeCount[meal]++;
  });

  const dominantMealType =
    Object.entries(mealTypeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // WEEKEND VS WEEKDAY
  let weekendCalories = 0;
  let weekdayCalories = 0;

  logs.forEach((log) => {
    const day = new Date(log.date).getDay();
    const isWeekend = day === 0 || day === 6;

    if (isWeekend) {
      weekendCalories += log.calories || 0;
    } else {
      weekdayCalories += log.calories || 0;
    }
  });

  // LATE NIGHT EATING
  let lateNightEatingCount = 0;

  logs.forEach((log) => {
    const hour = new Date(log.date).getHours();
    if (hour >= 22) {
      lateNightEatingCount++;
    }
  });

  // RETURN
  return {
    dominantFoods,
    dominantMealType,
    highestCalorieFood,
    highestProteinFood,
    weekendCalories: Math.round(weekendCalories),
    weekdayCalories: Math.round(weekdayCalories),
    lateNightEatingCount,
  };
};

module.exports = {
  getFoodPatternService,
};
