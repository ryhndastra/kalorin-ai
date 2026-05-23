const prisma = require("../../config/prisma");
const {
  getJakartaRollingRange,
  formatJakartaDate,
} = require("../../utils/dateUtils");

// GET WEEKLY TRENDS
const getWeeklyTrendsService = async (userId) => {
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
      date: "asc",
    },
  });

  // EMPTY 7 DAYS
  const grouped = {};

  for (let i = 0; i < 7; i++) {
    const current = new Date(startOfRange);
    current.setUTCDate(startOfRange.getUTCDate() + i);
    const key = formatJakartaDate(current);

    grouped[key] = {
      calories: 0,
      proteins: 0,
      carbs: 0,
      fat: 0,
    };
  }

  // GROUP LOGS
  logs.forEach((log) => {
    const dayKey = formatJakartaDate(log.date);

    if (!grouped[dayKey]) {
      grouped[dayKey] = {
        calories: 0,
        proteins: 0,
        carbs: 0,
        fat: 0,
      };
    }

    grouped[dayKey].calories += log.calories || 0;
    grouped[dayKey].proteins += log.proteins || 0;
    grouped[dayKey].carbs += log.carbs || 0;
    grouped[dayKey].fat += log.fat || 0;
  });

  // RESPONSE
  const trends = Object.entries(grouped).map(([date, values]) => ({
    date,
    calories: Number(values.calories.toFixed(1)),
    proteins: Number(values.proteins.toFixed(1)),
    carbs: Number(values.carbs.toFixed(1)),
    fat: Number(values.fat.toFixed(1)),
  }));

  return trends;
};

module.exports = {
  getWeeklyTrendsService,
};
