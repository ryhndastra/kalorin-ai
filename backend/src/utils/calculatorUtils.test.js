const {
  calculateDailyNeeds,
  normalizeActivityLevel,
  normalizeGender,
} = require("./calculatorUtils");

describe("calculatorUtils", () => {
  describe("normalizeGender", () => {
    test("normalizes supported gender values", () => {
      expect(normalizeGender(" Male ")).toBe("male");
      expect(normalizeGender("FEMALE")).toBe("female");
    });

    test("rejects unsupported gender values", () => {
      expect(normalizeGender("unknown")).toBeNull();
      expect(normalizeGender(undefined)).toBeNull();
    });
  });

  describe("normalizeActivityLevel", () => {
    test("normalizes supported activity values", () => {
      expect(normalizeActivityLevel(" Moderate ")).toBe("moderate");
      expect(normalizeActivityLevel("VERY_ACTIVE")).toBe("very_active");
    });

    test("falls back to sedentary for unsupported values", () => {
      expect(normalizeActivityLevel("weekly")).toBe("sedentary");
      expect(normalizeActivityLevel(undefined)).toBe("sedentary");
    });
  });

  describe("calculateDailyNeeds", () => {
    test("calculates male maintain calories using Mifflin-St Jeor and activity factor", () => {
      const result = calculateDailyNeeds(
        70,
        175,
        "1996-01-01",
        "Stay Healthy",
        "male",
        "moderate",
      );

      expect(result.protein).toBe(126);
      expect(result.calories).toBeGreaterThanOrEqual(2500);
      expect(result.calories).toBeLessThanOrEqual(2700);
    });

    test("calculates female maintain calories lower than male for same body stats", () => {
      const male = calculateDailyNeeds(
        70,
        175,
        "1996-01-01",
        "Stay Healthy",
        "male",
        "moderate",
      );
      const female = calculateDailyNeeds(
        70,
        175,
        "1996-01-01",
        "Stay Healthy",
        "female",
        "moderate",
      );

      expect(female.calories).toBeLessThan(male.calories);
      expect(female.protein).toBe(male.protein);
    });

    test("applies activity level multiplier", () => {
      const sedentary = calculateDailyNeeds(
        75,
        181,
        "2005-01-01",
        "Stay Healthy",
        "male",
        "sedentary",
      );
      const active = calculateDailyNeeds(
        75,
        181,
        "2005-01-01",
        "Stay Healthy",
        "male",
        "active",
      );

      expect(active.calories).toBeGreaterThan(sedentary.calories);
    });

    test("applies goal adjustments and protein targets", () => {
      const maintain = calculateDailyNeeds(
        75,
        181,
        "2005-01-01",
        "Stay Healthy",
        "male",
        "moderate",
      );
      const weightLoss = calculateDailyNeeds(
        75,
        181,
        "2005-01-01",
        "Weight Loss",
        "male",
        "moderate",
      );
      const bulking = calculateDailyNeeds(
        75,
        181,
        "2005-01-01",
        "Bulking",
        "male",
        "moderate",
      );

      expect(weightLoss.calories).toBeLessThan(maintain.calories);
      expect(bulking.calories).toBeGreaterThan(maintain.calories);
      expect(weightLoss.protein).toBe(150);
      expect(bulking.protein).toBe(143);
    });

    test("does not recommend unsafe low weight-loss calories", () => {
      const result = calculateDailyNeeds(
        45,
        155,
        "1996-01-01",
        "Weight Loss",
        "female",
        "sedentary",
      );

      expect(result.calories).toBeGreaterThanOrEqual(1200);
    });

    test("returns defaults when required data is missing or gender is invalid", () => {
      expect(calculateDailyNeeds(70, 175, null, "Stay Healthy", "male", "moderate")).toEqual({
        calories: 2000,
        protein: 100,
      });
      expect(
        calculateDailyNeeds(70, 175, "1996-01-01", "Stay Healthy", "unknown", "moderate"),
      ).toEqual({
        calories: 2000,
        protein: 100,
      });
    });
  });
});
