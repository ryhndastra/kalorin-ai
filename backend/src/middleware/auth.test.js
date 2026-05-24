jest.mock("../config/firebaseAdmin", () => ({
  auth: jest.fn(),
}));

const admin = require("../config/firebaseAdmin");
const { authenticateFirebaseToken } = require("./auth");
const { createMockRes } = require("../testUtils/mockHttp");

describe("authenticateFirebaseToken", () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 401 when bearer token is missing", async () => {
    const req = { headers: {} };
    const res = createMockRes();

    await authenticateFirebaseToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Authentication token is required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 when token verification fails", async () => {
    const req = {
      headers: {
        authorization: "Bearer invalid_token",
      },
    };
    const res = createMockRes();

    admin.auth.mockReturnValue({
      verifyIdToken: jest.fn().mockRejectedValue(new Error("bad token")),
    });

    await authenticateFirebaseToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid or expired authentication token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("sets req.user and calls next when token is valid", async () => {
    const req = {
      headers: {
        authorization: "Bearer valid_token",
      },
    };
    const res = createMockRes();

    admin.auth.mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue({
        uid: "firebase-uid",
        email: "user@mail.com",
        name: "User Name",
        picture: "https://image.test/u.png",
      }),
    });

    await authenticateFirebaseToken(req, res, next);

    expect(req.user).toEqual({
      uid: "firebase-uid",
      email: "user@mail.com",
      name: "User Name",
      picture: "https://image.test/u.png",
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
