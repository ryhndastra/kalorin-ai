jest.mock("../services/insightService", () => ({
  generateInsight: jest.fn(),
}));

jest.mock("../services/recommendationService", () => ({
  generateRecommendationList: jest.fn(),
  generateFoodDetail: jest.fn(),
}));

const { generateInsight } = require("../services/insightService");
const {
  generateRecommendationList,
  generateFoodDetail,
} = require("../services/recommendationService");
const {
  getQuickInsight,
  getRecommendedFoodList,
  getFoodRecommendation,
} = require("./aiController");
const { createMockRes } = require("../testUtils/mockHttp");

describe("aiController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getQuickInsight returns 400 when uid missing", async () => {
    const req = { user: null, body: { macroContext: "high-carb" } };
    const res = createMockRes();

    await getQuickInsight(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "User ID is required",
    });
  });

  test("getQuickInsight returns recommendation when success", async () => {
    generateInsight.mockResolvedValue("insight");
    const req = { user: { uid: "u1" }, body: { macroContext: "balanced" } };
    const res = createMockRes();

    await getQuickInsight(req, res);

    expect(generateInsight).toHaveBeenCalledWith("u1", "balanced");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getRecommendedFoodList validates uid", async () => {
    const req = { user: null, body: {} };
    const res = createMockRes();

    await getRecommendedFoodList(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "User ID is required",
    });
  });

  test("getRecommendedFoodList returns data", async () => {
    generateRecommendationList.mockResolvedValue([{ id: 1 }]);
    const req = { user: { uid: "u1" }, body: {} };
    const res = createMockRes();

    await getRecommendedFoodList(req, res);

    expect(generateRecommendationList).toHaveBeenCalledWith("u1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getFoodRecommendation validates inputs", async () => {
    const req = { user: { uid: "u1" }, body: { foodId: 0 } };
    const res = createMockRes();

    await getFoodRecommendation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Valid userId and foodId are required",
    });
  });

  test("getFoodRecommendation returns detail", async () => {
    generateFoodDetail.mockResolvedValue({ text: "detail" });
    const req = { user: { uid: "u1" }, body: { foodId: 7 } };
    const res = createMockRes();

    await getFoodRecommendation(req, res);

    expect(generateFoodDetail).toHaveBeenCalledWith("u1", 7);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
