const express = require("express");
const router = express.Router();
const {
  getWeeklySummary,
  getWeeklyTrends,
  getBehavioralInsights,
  getWeeklyComparison,
  getWeeklyScore,
  getNutritionPatterns,
  getFoodPatterns,
  getStreaks,
} = require("../controllers/insightController");
const { authenticateFirebaseToken } = require("../middleware/auth");

router.use(authenticateFirebaseToken);

router.get("/weekly-summary", getWeeklySummary);
router.get("/weekly-trends", getWeeklyTrends);
router.get("/behavioral-insights", getBehavioralInsights);
router.get("/weekly-comparison", getWeeklyComparison);
router.get("/weekly-score", getWeeklyScore);
router.get("/nutrition-patterns", getNutritionPatterns);
router.get("/food-patterns", getFoodPatterns);
router.get("/streaks", getStreaks);

module.exports = router;
