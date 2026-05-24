const prisma = require("../config/prisma");
const { calculateUserStatus } = require("../utils/bmiUtils");
const { buildAIPayload } = require("../utils/payloadBuilder");
const { normalizeScore, getScoreLabel } = require("../utils/scoreUtils");
const {
  requestRecommendation,
  requestRecommendationWithExplanation,
} = require("./aiApiService");

const {
  MAX_FOOD_SCAN,
  RECOMMENDATION_LIST_TTL,
  CONCURRENT_LIMIT,
} = require("../config/aiConfig");

const { getCache, setCache } = require("../utils/cacheUtils");
const isDev = process.env.NODE_ENV !== "production";
const debugLog = (...args) => {
  if (isDev) console.debug(...args);
};

// CACHE — hanya untuk list final (bukan perfood, itu sudah di Redis)
const recommendationListCache = new Map();

// SCORING HEURISTIK (tanpa AI)
const heuristicScore = (food, userGoal, userStatus) => {
  let score = 50;

  const isObesity =
    userStatus.includes("Obesity") ||
    userGoal.includes("weight") ||
    userGoal.includes("loss");

  const isBulk = userGoal.includes("bulk");

  if (isObesity) {
    if (food.calories <= 200) score += 20;
    else if (food.calories <= 300) score += 10;
    else if (food.calories > 400) score -= 20;
  } else if (isBulk) {
    if (food.calories >= 400) score += 15;
  } else {
    if (food.calories >= 200 && food.calories <= 400) score += 10;
  }

  if (isBulk) {
    if (food.proteins >= 20) score += 25;
    else if (food.proteins >= 15) score += 15;
    else if (food.proteins < 8) score -= 20;
  } else {
    if (food.proteins >= 10) score += 10;
  }

  if (isObesity) {
    if (food.fat <= 5) score += 15;
    else if (food.fat > 15) score -= 20;
    if (food.carbohydrate <= 30) score += 10;
    else if (food.carbohydrate > 60) score -= 10;
  }

  return Math.max(0, Math.min(100, score));
};

// FILTER KERAS
const isFoodSuitable = (food, userGoal, userStatus) => {
  const foodName = food.name.toLowerCase();
  const badWords = ["gajih", "goreng", "lemak", "minyak", "babi"];
  const isJunkFood = badWords.some((word) => foodName.includes(word));

  if (
    userGoal.includes("weight") ||
    userGoal.includes("loss") ||
    userStatus.includes("Obesity")
  ) {
    if (isJunkFood || food.calories > 350 || food.fat > 15) return false;
  }

  if (userGoal.includes("bulk")) {
    if (food.proteins < 8) return false;
  }

  return true;
};

// CONCURRENT LIMITER
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const processWithLimit = async (items, limit, asyncFn) => {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    const chunkResults = await Promise.all(chunk.map((item) => asyncFn(item)));
    results.push(...chunkResults);
    if (i + limit < items.length) await sleep(300);
  }
  return results;
};

// Max food yang dikirim ke AI per request
const MAX_AI_CANDIDATES = 10;

// GENERATE RECOMMENDATION LIST
const generateRecommendationList = async (userId) => {
  const user = await prisma.profile.findUnique({ where: { userId } });

  if (!user) throw new Error("User profile not found");

  const userGoal = user.goal?.toLowerCase() || "stay healthy";
  const recommendationCacheKey = `recommend-list-${userId}-${userGoal}`;

  // 1. Cek cache list final
  const cachedRecommendations = getCache(
    recommendationListCache,
    recommendationCacheKey,
  );
  if (cachedRecommendations) {
    debugLog("⚡ Using cached recommendation list");
    return cachedRecommendations;
  }

  // 2. Ambil raw foods
  const totalFoods = await prisma.food.count();
  const skip = Math.floor(
    Math.random() * Math.max(0, totalFoods - MAX_FOOD_SCAN),
  );
  const rawFoods = await prisma.food.findMany({ take: MAX_FOOD_SCAN, skip });

  const userStatus = calculateUserStatus(user.weight, user.height) || "Normal";

  // 3. Filter keras
  const filteredFoods = rawFoods.filter((food) =>
    isFoodSuitable(food, userGoal, userStatus),
  );

  // Heuristic sort → ambil top MAX_AI_CANDIDATES saja ke AI
  const topCandidates = filteredFoods
    .map((food) => ({
      food,
      hScore: heuristicScore(food, userGoal, userStatus),
    }))
    .sort((a, b) => b.hScore - a.hScore)
    .slice(0, MAX_AI_CANDIDATES)
    .map(({ food }) => food);

  debugLog(
    `📊 ${rawFoods.length} raw → ${filteredFoods.length} filtered → ${topCandidates.length} to AI`,
  );

  // kirim ke AI
  // Cache per-food sudah dihandle Redis di aiApiService,
  // tidak perlu cek/simpan cache di sini lagi
  const aiResults = await processWithLimit(
    topCandidates,
    CONCURRENT_LIMIT,
    async (food) => {
      try {
        const payload = buildAIPayload(user, food);
        const aiData = await requestRecommendation(payload); // ← Redis cache + dedup aktif di sini

        if (!aiData?.is_recommended) return null;

        const matchScore = normalizeScore(aiData.match_score_percent);

        return {
          ...food,
          matchScore,
          matchLabel: getScoreLabel(matchScore),
          explanation:
            aiData.explanation || "Good nutritional match for your profile.",
        };
      } catch (error) {
        console.error(`❌ Food AI Error (${food.name}):`, error.message);
        return null;
      }
    },
  );

  // Sort dan ambil top 10
  const finalFoods = aiResults
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

  setCache(
    recommendationListCache,
    recommendationCacheKey,
    finalFoods,
    RECOMMENDATION_LIST_TTL,
  );

  return finalFoods;
};

// FOOD DETAIL
const generateFoodDetail = async (userId, foodId) => {
  const user = await prisma.profile.findUnique({ where: { userId } });
  const food = await prisma.food.findUnique({
    where: { id: Number(foodId) },
  });

  if (!user || !food) throw new Error("Data not found");

  const payload = buildAIPayload(user, food);
  const recommendation = await requestRecommendationWithExplanation(payload);
  const matchScore = normalizeScore(recommendation?.match_score_percent);

  return {
    ...recommendation,
    matchLabel: getScoreLabel(matchScore),
  };
};

module.exports = {
  generateRecommendationList,
  generateFoodDetail,
};
