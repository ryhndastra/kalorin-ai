const prisma = require("../../config/prisma");
const { getJakartaRollingRange } = require("../../utils/dateUtils");

const getWeeklyComparisonService = async (userId) => {
  const { startOfRange: currentWeekStart, endOfRange: currentWeekEnd } =
    getJakartaRollingRange(7);
  const previousWeekEnd = new Date(currentWeekStart.getTime() - 1);
  const previousWeekStart = new Date(
    previousWeekEnd.getTime() - 7 * 24 * 60 * 60 * 1000 + 1,
  );

  // FETCH LOGS
  const [currentLogs, previousLogs] = await Promise.all([
    prisma.dailyLog.findMany({
      where: {
        userId,
        date: {
          gte: currentWeekStart,
          lte: currentWeekEnd,
        },
      },
    }),

    prisma.dailyLog.findMany({
      where: {
        userId,
        date: {
          gte: previousWeekStart,
          lte: previousWeekEnd,
        },
      },
    }),
  ]);

  // HELPERS
  const sumCalories = (logs) =>
    logs.reduce((acc, log) => acc + (log.calories || 0), 0);

  const sumProteins = (logs) =>
    logs.reduce((acc, log) => acc + (log.proteins || 0), 0);

  const uniqueTrackingDays = (logs) =>
    new Set(
      logs.map((log) =>
        new Date(log.date).toLocaleDateString("en-CA", {
          timeZone: "Asia/Jakarta",
        }),
      ),
    ).size;

  // TOTALS
  const currentCalories = sumCalories(currentLogs);
  const previousCalories = sumCalories(previousLogs);
  const currentProteins = sumProteins(currentLogs);
  const previousProteins = sumProteins(previousLogs);
  const currentTracking = uniqueTrackingDays(currentLogs);
  const previousTracking = uniqueTrackingDays(previousLogs);

  // BASELINE
  const hasPreviousData = previousLogs.length > 0;

  // PERCENT CALCULATOR
  const calculatePercentChange = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Number((((current - previous) / previous) * 100).toFixed(0));
  };

  // RETURN
  return {
    caloriesChange: calculatePercentChange(currentCalories, previousCalories),
    proteinsChange: calculatePercentChange(currentProteins, previousProteins),
    trackingChange: calculatePercentChange(currentTracking, previousTracking),
    hasPreviousData,
  };
};

module.exports = {
  getWeeklyComparisonService,
};
