const {
  isBlank,
  isPositiveNumber,
  isNonNegativeNumber,
  hasInvalidNumber,
} = require("./requestValidation");

describe("requestValidation", () => {
  test("isBlank identifies empty values", () => {
    expect(isBlank(undefined)).toBe(true);
    expect(isBlank(null)).toBe(true);
    expect(isBlank("")).toBe(true);
    expect(isBlank(0)).toBe(false);
    expect(isBlank("x")).toBe(false);
  });

  test("isPositiveNumber validates positive finite number", () => {
    expect(isPositiveNumber(1)).toBe(true);
    expect(isPositiveNumber("2.5")).toBe(true);
    expect(isPositiveNumber(0)).toBe(false);
    expect(isPositiveNumber(-1)).toBe(false);
    expect(isPositiveNumber("abc")).toBe(false);
  });

  test("isNonNegativeNumber validates 0 and positive finite numbers", () => {
    expect(isNonNegativeNumber(0)).toBe(true);
    expect(isNonNegativeNumber("3")).toBe(true);
    expect(isNonNegativeNumber(-0.1)).toBe(false);
    expect(isNonNegativeNumber("abc")).toBe(false);
  });

  test("hasInvalidNumber validates selected fields and ignores blank values", () => {
    const payload = {
      calories: "100",
      fat: "",
      carbs: "abc",
    };

    expect(hasInvalidNumber(payload, ["calories", "fat"])).toBe(false);
    expect(hasInvalidNumber(payload, ["calories", "carbs"])).toBe(true);
  });
});
