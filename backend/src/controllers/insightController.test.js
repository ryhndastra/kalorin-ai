jest.mock("../services/insights/summaryService", () => ({
  getWeeklySummaryService: jest.fn(),
}));
jest.mock("../services/insights/trendsService", () => ({
  getWeeklyTrendsService: jest.fn(),
}));
jest.mock("../services/insights/behavioralInsightService", () => ({
  getBehavioralInsightsService: jest.fn(),
}));
jest.mock("../services/insights/comparisonService", () => ({
  getWeeklyComparisonService: jest.fn(),
}));
jest.mock("../services/insights/scoreService", () => ({
  getWeeklyScoreService: jest.fn(),
}));
jest.mock("../services/insights/patternEngineService", () => ({
  generateNutritionPatterns: jest.fn(),
}));
jest.mock("../services/insights/foodPatternService", () => ({
  getFoodPatternService: jest.fn(),
}));
jest.mock("../services/insights/streakService", () => ({
  getStreakService: jest.fn(),
}));

const { createMockRes } = require("../testUtils/mockHttp");
const insightController = require("./insightController");
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

describe("insightController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 400 when uid missing", async () => {
    const req = { user: null };
    const res = createMockRes();

    await insightController.getWeeklySummary(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User ID is required",
    });
  });

  test("getWeeklySummary returns service data", async () => {
    getWeeklySummaryService.mockResolvedValue({ calories: 1000 });
    const req = { user: { uid: "u1" } };
    const res = createMockRes();

    await insightController.getWeeklySummary(req, res);

    expect(getWeeklySummaryService).toHaveBeenCalledWith("u1");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { calories: 1000 },
    });
  });

  test("getWeeklyTrends returns service data", async () => {
    getWeeklyTrendsService.mockResolvedValue([{ day: "mon" }]);
    const req = { user: { uid: "u1" } };
    const res = createMockRes();

    await insightController.getWeeklyTrends(req, res);

    expect(getWeeklyTrendsService).toHaveBeenCalledWith("u1");
  });

  test("getBehavioralInsights returns insights and source", async () => {
    getBehavioralInsightsService.mockResolvedValue({
      insights: ["drink more water"],
      source: "ai",
    });
    const req = { user: { uid: "u1" } };
    const res = createMockRes();

    await insightController.getBehavioralInsights(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: ["drink more water"],
      source: "ai",
    });
  });

  test("getWeeklyComparison returns comparison", async () => {
    getWeeklyComparisonService.mockResolvedValue({ delta: 10 });
    const req = { user: { uid: "u1" } };
    const res = createMockRes();

    await insightController.getWeeklyComparison(req, res);

    expect(getWeeklyComparisonService).toHaveBeenCalledWith("u1");
  });

  test("getWeeklyScore returns score", async () => {
    getWeeklyScoreService.mockResolvedValue({ score: 82 });
    const req = { user: { uid: "u1" } };
    const res = createMockRes();

    await insightController.getWeeklyScore(req, res);

    expect(getWeeklyScoreService).toHaveBeenCalledWith("u1");
  });

  test("getNutritionPatterns returns patterns", async () => {
    generateNutritionPatterns.mockResolvedValue(["high sodium"]);
    const req = { user: { uid: "u1" } };
    const res = createMockRes();

    await insightController.getNutritionPatterns(req, res);

    expect(generateNutritionPatterns).toHaveBeenCalledWith("u1");
  });

  test("getFoodPatterns returns patterns", async () => {
    getFoodPatternService.mockResolvedValue(["late-night snack"]);
    const req = { user: { uid: "u1" } };
    const res = createMockRes();

    await insightController.getFoodPatterns(req, res);

    expect(getFoodPatternService).toHaveBeenCalledWith("u1");
  });

  test("getStreaks returns streak payload", async () => {
    getStreakService.mockResolvedValue({ streakDays: 5 });
    const req = { user: { uid: "u1" } };
    const res = createMockRes();

    await insightController.getStreaks(req, res);

    expect(getStreakService).toHaveBeenCalledWith("u1");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { streakDays: 5 },
    });
  });
});
