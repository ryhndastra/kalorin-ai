const prisma = require("../../config/prisma");
const {
  getJakartaRollingRange,
  formatJakartaDate,
} = require("../../utils/dateUtils");

// GET WEEKLY SCORE
const getWeeklyScoreService = async (userId) => {
  const { startOfRange, endOfRange } = getJakartaRollingRange(7);

  // USER
  const user = await prisma.profile.findFirst({
    where: {
      userId,
    },
  });

  // LOGS
  const logs = await prisma.dailyLog.findMany({
    where: {
      userId,
        date: {
        gte: startOfRange,
        lte: endOfRange,
      },
    },
  });

  // EMPTY
  if (!logs.length) {
    return {
      overall: 0,
      consistency: 0,
      protein: 0,
      calories: 0,
      trackingDays: 0,
      proteinGoalHitDays: 0,
      calorieGoalHitDays: 0,
      message: "Start tracking meals to build your nutrition score.",
    };
  }

  // GROUP DAYS
  const grouped = {};

  logs.forEach((log) => {
    const key = formatJakartaDate(log.date);

    if (!grouped[key]) {
      grouped[key] = {
        calories: 0,
        proteins: 0,
      };
    }

    grouped[key].calories += log.calories || 0;
    grouped[key].proteins += log.proteins || 0;
  });

  const days = Object.values(grouped);

  // CONSISTENCY SCORE
  const trackingDays = Object.keys(grouped).length;
  const consistencyScore = Math.min((trackingDays / 7) * 100, 100);

  // TARGETS
  const proteinTarget = user?.proteinTarget || 100;
  const calorieTarget = user?.dailyCalories || 2000;

  // AVERAGES
  const avgProtein =
    days.reduce((acc, day) => acc + day.proteins, 0) / days.length;
  const avgCalories =
    days.reduce((acc, day) => acc + day.calories, 0) / days.length;

  // PROTEIN SCORE
  const proteinScore = Math.min((avgProtein / proteinTarget) * 100, 100);

  // CALORIE SCORE
  const calorieDifference = Math.abs(avgCalories - calorieTarget);
  const calorieScore = Math.max(
    100 - (calorieDifference / calorieTarget) * 100,
    0,
  );

  // GOAL HIT DAYS
  // PROTEIN GOAL
  const proteinGoalHitDays = days.filter(
    (day) => day.proteins >= proteinTarget,
  ).length;

  // CALORIE GOAL
  // ±10% tolerance
  const calorieGoalHitDays = days.filter((day) => {
    const lower = calorieTarget * 0.8;
    const upper = calorieTarget * 1.2;
    return day.calories >= lower && day.calories <= upper;
  }).length;

  // OVERALL SCORE
  const overall =
    consistencyScore * 0.4 + proteinScore * 0.35 + calorieScore * 0.25;

  // MESSAGE
  let message = "Good nutrition consistency this week.";

  if (overall >= 85) {
    message = "Excellent nutrition consistency this week.";
  } else if (overall >= 70) {
    message = "You're maintaining a solid nutrition routine.";
  } else if (overall >= 50) {
    message = "Your nutrition habits are improving steadily.";
  } else {
    message = "Try tracking meals more consistently to improve your score.";
  }

  return {
    overall: Math.round(overall),
    consistency: Math.round(consistencyScore),
    protein: Math.round(proteinScore),
    calories: Math.round(calorieScore),
    trackingDays,
    proteinGoalHitDays,
    calorieGoalHitDays,
    message,
  };
};

module.exports = {
  getWeeklyScoreService,
};
