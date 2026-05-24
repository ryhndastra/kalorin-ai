jest.mock("../config/prisma", () => ({
  dailyLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
}));

const prisma = require("../config/prisma");
const { addMealLog, getDailyLogs } = require("./trackController");
const { createMockRes } = require("../testUtils/mockHttp");

describe("trackController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addMealLog", () => {
    test("returns 400 when required fields are missing", async () => {
      const req = { user: { uid: "u1" }, body: { foodName: "" } };
      const res = createMockRes();

      await addMealLog(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Missing required fields",
      });
    });

    test("returns 400 for invalid numeric fields", async () => {
      const req = {
        user: { uid: "u1" },
        body: { foodName: "Nasi", calories: "abc" },
      };
      const res = createMockRes();

      await addMealLog(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid numeric fields",
      });
    });

    test("creates meal log with authenticated uid", async () => {
      prisma.dailyLog.create.mockResolvedValue({
        id: "log-1",
        userId: "trusted",
        foodName: "Nasi",
      });

      const req = {
        user: { uid: "trusted" },
        body: {
          userId: "spoofed",
          foodName: "Nasi",
          calories: 250,
          proteins: 6,
          fat: 3,
          carbs: 40,
          quantity: 1,
        },
      };
      const res = createMockRes();

      await addMealLog(req, res);

      const createArg = prisma.dailyLog.create.mock.calls[0][0];
      expect(createArg.data.userId).toBe("trusted");
      expect(createArg.data.userId).not.toBe("spoofed");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: "log-1",
          userId: "trusted",
          foodName: "Nasi",
        },
      });
    });
  });

  describe("getDailyLogs", () => {
    test("returns 400 when uid is missing", async () => {
      const req = { user: null, query: {} };
      const res = createMockRes();

      await getDailyLogs(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User ID is required",
      });
    });

    test("returns 400 on invalid date format", async () => {
      const req = { user: { uid: "u1" }, query: { date: "not-a-date" } };
      const res = createMockRes();

      await getDailyLogs(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    });

    test("returns logs and totals", async () => {
      prisma.dailyLog.findMany.mockResolvedValue([
        { calories: 200, proteins: 10, fat: 5, carbs: 30 },
        { calories: 300, proteins: 15, fat: 8, carbs: 40 },
      ]);

      const req = { user: { uid: "u1" }, query: { date: "2026-05-25" } };
      const res = createMockRes();

      await getDailyLogs(req, res);

      expect(prisma.dailyLog.findMany).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          logs: [
            { calories: 200, proteins: 10, fat: 5, carbs: 30 },
            { calories: 300, proteins: 15, fat: 8, carbs: 40 },
          ],
          totals: {
            calories: 500,
            proteins: 25,
            fat: 13,
            carbs: 70,
          },
        },
      });
    });
  });
});
