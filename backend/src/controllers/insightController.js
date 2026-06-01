const {
  getWeeklySummaryService,
} = require("../services/insights/summaryService");
const {
  getWeeklyTrendsService,
} = require("../services/insights/trendsService");
const {
  getBehavioralInsightsService,
} = require("../services/insights/behavioralInsightService");
const {
  getWeeklyComparisonService,
} = require("../services/insights/comparisonService");
const { getWeeklyScoreService } = require("../services/insights/scoreService");
const {
  generateNutritionPatterns,
} = require("../services/insights/patternEngineService");
const {
  getFoodPatternService,
} = require("../services/insights/foodPatternService");
const { getStreakService } = require("../services/insights/streakService");

// GET WEEKLY SUMMARY
const getWeeklySummary = async (req, res, next) => {
  try {
    const userId = req.user?.uid;

    // VALIDATION
    if (!userId) {
      return res.status(400).json({
        success: false,

        message: "User ID is required",
      });
    }

    const summary = await getWeeklySummaryService(userId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// GET WEEKLY TRENDS
const getWeeklyTrends = async (req, res, next) => {
  try {
    const userId = req.user?.uid;

    // VALIDATION
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const trends = await getWeeklyTrendsService(userId);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

// GET BEHAVIORAL INSIGHTS
const getBehavioralInsights = async (req, res, next) => {
  try {
    const userId = req.user?.uid;

    // VALIDATION
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await getBehavioralInsightsService(userId);

    res.json({
      success: true,
      data: result.insights,
      source: result.source,
    });
  } catch (error) {
    next(error);
  }
};

// GET WEEKLY COMPARISON
const getWeeklyComparison = async (req, res, next) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const comparison = await getWeeklyComparisonService(userId);

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
};

// GET WEEKLY SCORE
const getWeeklyScore = async (req, res, next) => {
  try {
    const userId = req.user?.uid;

    // VALIDATION
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const score = await getWeeklyScoreService(userId);

    res.json({
      success: true,
      data: score,
    });
  } catch (error) {
    next(error);
  }
};

// GET NUTRITION PATTERNS
const getNutritionPatterns = async (req, res, next) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const patterns = await generateNutritionPatterns(userId);

    res.json({
      success: true,
      data: patterns,
    });
  } catch (error) {
    next(error);
  }
};

// GET FOOD PATTERNS
const getFoodPatterns = async (req, res, next) => {
  try {
    const userId = req.user?.uid;

    // VALIDATION
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const patterns = await getFoodPatternService(userId);

    res.json({
      success: true,
      data: patterns,
    });
  } catch (error) {
    next(error);
  }
};

// GET STREAKS
const getStreaks = async (req, res, next) => {
  try {
    const userId = req.user?.uid;

    // VALIDATION
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const streaks = await getStreakService(userId);

    res.json({
      success: true,
      data: streaks,
    });
  } catch (error) {
    next(error);
  }
};

// GET INSIGHTS DASHBOARD (aggregated)
const getInsightsDashboard = async (req, res, next) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const [trends, comparison, score, streaks] = await Promise.all([
      getWeeklyTrendsService(userId),
      getWeeklyComparisonService(userId),
      getWeeklyScoreService(userId),
      getStreakService(userId),
    ]);

    return res.json({
      success: true,
      data: {
        trends,
        comparison,
        score,
        streaks,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getWeeklySummary,
  getWeeklyTrends,
  getBehavioralInsights,
  getWeeklyComparison,
  getWeeklyScore,
  getNutritionPatterns,
  getFoodPatterns,
  getStreaks,
  getInsightsDashboard,
};
