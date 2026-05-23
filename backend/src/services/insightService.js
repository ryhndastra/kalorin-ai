const prisma = require("../config/prisma");
const { calculateUserStatus } = require("../utils/bmiUtils");
const { requestInsight } = require("./aiApiService");
const { INSIGHT_TTL } = require("../config/aiConfig");
const { getCache, setCache } = require("../utils/cacheUtils");

// CACHE
const insightCache = new Map();

// GENERATE INSIGHT
const generateInsight = async (userId, macroContext) => {
  // cache ikut context
  const cacheKey = `insight-${userId}-${macroContext}`;

  const cachedInsight = getCache(insightCache, cacheKey);

  if (cachedInsight) {
    return cachedInsight;
  }

  const user = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const userStatus = calculateUserStatus(user.weight, user.height) || "Normal";

  try {
    const aiResponse = await requestInsight({
      user_status: String(userStatus),

      macro_context: String(
        macroContext ||
          `User goal is ${user.goal || "Healthy"}. Keep them motivated!`,
      ),
    });

    const insightText =
      aiResponse?.insight_text ||
      macroContext ||
      "Stay consistent with your nutrition goals today!";

    setCache(insightCache, cacheKey, insightText, INSIGHT_TTL);

    return insightText;
  } catch (error) {
    console.error("❌ Insight Service Error:", error.message);

    // contextual fallback
    return macroContext || "Stay consistent with your nutrition goals today !";
  }
};

module.exports = {
  generateInsight,
};
