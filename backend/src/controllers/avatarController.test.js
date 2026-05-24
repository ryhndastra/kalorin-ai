jest.mock("../config/prisma", () => ({
  profile: {
    update: jest.fn(),
  },
}));

jest.mock("../config/supabase", () => ({
  createSupabaseClient: jest.fn(),
}));

const prisma = require("../config/prisma");
const { createSupabaseClient } = require("../config/supabase");
const { uploadAvatar } = require("./avatarController");
const { createMockRes } = require("../testUtils/mockHttp");

describe("uploadAvatar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 401 when user is missing", async () => {
    const req = { user: null, file: null };
    const res = createMockRes();

    await uploadAvatar(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Authentication is required",
    });
  });

  test("returns 400 when file is missing", async () => {
    const req = { user: { uid: "uid-1" }, file: null };
    const res = createMockRes();

    await uploadAvatar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Avatar image is required",
    });
  });

  test("returns 400 when mimetype is unsupported", async () => {
    const req = {
      user: { uid: "uid-1" },
      file: {
        mimetype: "application/pdf",
        size: 1000,
      },
    };
    const res = createMockRes();

    await uploadAvatar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Avatar must be a JPG, PNG, or WebP image",
    });
  });

  test("returns 400 when file exceeds size limit", async () => {
    const req = {
      user: { uid: "uid-1" },
      file: {
        mimetype: "image/png",
        size: 2 * 1024 * 1024 + 1,
      },
    };
    const res = createMockRes();

    await uploadAvatar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Avatar size must be 2MB or less",
    });
  });

  test("uploads avatar and updates profile photoURL", async () => {
    const upload = jest.fn().mockResolvedValue({ error: null });
    const getPublicUrl = jest
      .fn()
      .mockReturnValue({ data: { publicUrl: "https://cdn.test/avatar.png" } });
    const from = jest.fn().mockReturnValue({ upload, getPublicUrl });

    createSupabaseClient.mockReturnValue({
      storage: { from },
    });

    prisma.profile.update.mockResolvedValue({
      userId: "uid-1",
      photoURL: "https://cdn.test/avatar.png",
    });

    const req = {
      user: { uid: "uid-1" },
      file: {
        originalname: "avatar.png",
        mimetype: "image/png",
        size: 1024,
        buffer: Buffer.from("png"),
      },
    };
    const res = createMockRes();

    await uploadAvatar(req, res);

    expect(from).toHaveBeenCalled();
    expect(upload).toHaveBeenCalled();
    expect(prisma.profile.update).toHaveBeenCalledWith({
      where: { userId: "uid-1" },
      data: { photoURL: "https://cdn.test/avatar.png" },
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        photoURL: "https://cdn.test/avatar.png",
        profile: {
          userId: "uid-1",
          photoURL: "https://cdn.test/avatar.png",
        },
      },
    });
  });
});
