const { generateNutritionPatterns } = require("./patternEngineService");
const { getFoodPatternService } = require("./foodPatternService");
const { requestBehavioralInsights } = require("../aiApiService");

// GET AI BEHAVIORAL INSIGHTS
const getBehavioralInsightsService = async (userId, language = "en") => {
  try {
    // GENERATE BEHAVIOR PATTERNS
    const behavioralPatterns = await generateNutritionPatterns(userId);

    // GENERATE FOOD PATTERNS
    const foodPatterns = await getFoodPatternService(userId);

    // MERGE PAYLOAD
    const payload = {
      ...behavioralPatterns,
      ...foodPatterns,
      language,
    };

    // AI MICROSERVICE
    const response = await requestBehavioralInsights(payload);

    // RETURN DATA
    return {
      insights: response.insights || [],
      source: response.source || "unknown",
    };
  } catch (error) {
    console.error("❌ AI Behavioral Insight Error:", error.message);
    return {
      insights: [
        {
          type: "info",
          title: language === "id" ? "Insight Tidak Tersedia" : "Insights Unavailable",
          message:
            language === "id"
              ? "Insight perilaku belum bisa dibuat."
              : "Behavioral insights could not be generated.",
        },
      ],
      source: "backend-fallback",
    };
  }
};

module.exports = {
  getBehavioralInsightsService,
};
