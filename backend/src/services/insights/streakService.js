const prisma = require("../../config/prisma");
const { formatJakartaDate } = require("../../utils/dateUtils");

const toUtcDate = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
};

// GET STREAK DATA
const getStreakService = async (userId) => {
  // USER PROFILE
  const user = await prisma.profile.findFirst({
    where: {
      userId,
    },
  });

  // FETCH LOGS
  const logs = await prisma.dailyLog.findMany({
    where: {
      userId,
    },
    select: {
      date: true,
      proteins: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // EMPTY
  if (!logs.length) {
    return {
      trackingStreak: 0,
      longestTrackingStreak: 0,
      proteinStreak: 0,
    };
  }

  // UNIQUE DAYS
  const groupedDays = {};

  logs.forEach((log) => {
    const dateKey = formatJakartaDate(log.date);

    if (!groupedDays[dateKey]) {
      groupedDays[dateKey] = {
        proteins: 0,
      };
    }

    groupedDays[dateKey].proteins += log.proteins || 0;
  });

  const uniqueDays = Object.keys(groupedDays).sort();

  // TRACKING STREAKS
  let trackingStreak = 0;
  let longestTrackingStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diff =
      (toUtcDate(formatJakartaDate(curr)) -
        toUtcDate(formatJakartaDate(prev))) /
      (1000 * 60 * 60 * 24);

    if (diff === 1) {
      currentStreak++;
      longestTrackingStreak = Math.max(longestTrackingStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  // ACTIVE TRACKING STREAK
  const lastTrackedDate = uniqueDays[uniqueDays.length - 1];
  const today = formatJakartaDate(new Date());

  const diffFromToday =
    (toUtcDate(today) - toUtcDate(lastTrackedDate)) / (1000 * 60 * 60 * 24);

  if (diffFromToday <= 1) {
    trackingStreak = currentStreak;
  } else {
    trackingStreak = 0;
  }

  // PROTEIN STREAK
  const proteinTarget = user?.proteinTarget || 100;
  let proteinStreak = 0;
  const reversedDays = [...uniqueDays].reverse();

  for (const day of reversedDays) {
    const protein = groupedDays[day].proteins;
    if (protein >= proteinTarget) {
      proteinStreak++;
    } else {
      break;
    }
  }

  // RETURN
  return {
    trackingStreak,
    longestTrackingStreak,
    proteinStreak,
  };
};

module.exports = {
  getStreakService,
};
