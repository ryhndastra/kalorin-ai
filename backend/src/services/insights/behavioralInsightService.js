const { generateNutritionPatterns } = require("./patternEngineService");
const { getFoodPatternService } = require("./foodPatternService");
const { requestBehavioralInsights } = require("../aiApiService");

// GET AI BEHAVIORAL INSIGHTS
const getBehavioralInsightsService = async (userId) => {
  try {
    // GENERATE BEHAVIOR PATTERNS
    const behavioralPatterns = await generateNutritionPatterns(userId);

    // GENERATE FOOD PATTERNS
    const foodPatterns = await getFoodPatternService(userId);

    // MERGE PAYLOAD
    const payload = {
      ...behavioralPatterns,
      ...foodPatterns,
    };

    // AI MICROSERVICE
    const response = await requestBehavioralInsights(payload);

    // RETURN DATA
    return response.insights || [];
  } catch (error) {
    console.error("❌ AI Behavioral Insight Error:", error.message);
    return [
      {
        type: "info",
        title: "Insights Unavailable",
        message: "Behavioral insights could not be generated.",
      },
    ];
  }
};

module.exports = {
  getBehavioralInsightsService,
};
