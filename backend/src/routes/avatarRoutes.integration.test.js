jest.mock("../middleware/auth", () => ({
  authenticateFirebaseToken: (req, res, next) => {
    req.user = {
      uid: "uid-int-test",
      email: "int@test.com",
    };
    return next();
  },
}));

jest.mock("../controllers/avatarController", () => ({
  uploadAvatar: jest.fn((req, res) =>
    res.json({
      success: true,
      data: {
        photoURL: "https://cdn.test/avatar.png",
      },
    }),
  ),
}));

jest.mock("../config/env", () => ({
  parseCorsOrigins: jest.fn(() => [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]),
  validateCriticalEnv: jest.fn(),
}));

const request = require("supertest");
const app = require("../app");
const { uploadAvatar } = require("../controllers/avatarController");

describe("avatar route integration", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/profile/avatar passes multer file to controller", async () => {
    const response = await request(app)
      .post("/api/profile/avatar")
      .set("Origin", "http://localhost:5173")
      .attach("avatar", Buffer.from("fake"), "avatar.png");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        photoURL: "https://cdn.test/avatar.png",
      },
    });
    expect(uploadAvatar).toHaveBeenCalledTimes(1);
    const reqArg = uploadAvatar.mock.calls[0][0];
    expect(reqArg.user.uid).toBe("uid-int-test");
    expect(reqArg.file).toBeTruthy();
    expect(reqArg.file.originalname).toBe("avatar.png");
  });
});
