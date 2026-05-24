jest.mock("../config/prisma", () => ({
  profile: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  dailyLog: {
    count: jest.fn(),
    aggregate: jest.fn(),
  },
}));

const prisma = require("../config/prisma");
const { createOrUpdateProfile } = require("./userController");
const { createMockRes } = require("../testUtils/mockHttp");

describe("createOrUpdateProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rejects when authenticated user id is missing", async () => {
    const req = {
      user: {},
      body: { email: "user@mail.com" },
    };
    const res = createMockRes();

    await createOrUpdateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User ID and email are required",
    });
  });

  test("rejects invalid gender", async () => {
    prisma.profile.findUnique.mockResolvedValue(null);

    const req = {
      user: { uid: "uid-1", email: "user@mail.com" },
      body: {
        name: "User",
        gender: "robot",
      },
    };
    const res = createMockRes();

    await createOrUpdateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid gender",
    });
  });

  test("rejects invalid activity level", async () => {
    prisma.profile.findUnique.mockResolvedValue(null);

    const req = {
      user: { uid: "uid-1", email: "user@mail.com" },
      body: {
        name: "User",
        gender: "male",
        activityLevel: "sometimes",
      },
    };
    const res = createMockRes();

    await createOrUpdateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid activity level",
    });
  });

  test("uses req.user.uid as trusted source of userId instead of body.userId", async () => {
    prisma.profile.findUnique.mockResolvedValue(null);
    prisma.profile.upsert.mockResolvedValue({
      userId: "trusted-uid",
      fullName: "Trusted",
      dailyCalories: 2500,
      proteinTarget: 126,
    });

    const req = {
      user: { uid: "trusted-uid", email: "trusted@mail.com" },
      body: {
        userId: "spoofed-uid",
        name: "Trusted",
        birthdate: "1996-01-01",
        gender: "male",
        activityLevel: "moderate",
        weight: 70,
        height: 175,
        goal: "Stay Healthy",
        dailyCalories: 0,
        proteinTarget: 0,
      },
    };
    const res = createMockRes();

    await createOrUpdateProfile(req, res);

    expect(prisma.profile.findUnique).toHaveBeenCalledWith({
      where: { userId: "trusted-uid" },
    });

    const upsertArg = prisma.profile.upsert.mock.calls[0][0];
    expect(upsertArg.where).toEqual({ userId: "trusted-uid" });
    expect(upsertArg.create.userId).toBe("trusted-uid");
    expect(upsertArg.create.userId).not.toBe("spoofed-uid");
    expect(upsertArg.create.gender).toBe("male");
    expect(upsertArg.create.activityLevel).toBe("moderate");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        userId: "trusted-uid",
        fullName: "Trusted",
        dailyCalories: 2500,
        proteinTarget: 126,
      },
    });
  });
});
