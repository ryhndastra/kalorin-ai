const path = require("path");
const prisma = require("../config/prisma");
const { createSupabaseClient } = require("../config/supabase");

const AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET || "avatars";
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const getExtension = (file) => {
  const extension = path.extname(file.originalname || "").toLowerCase();

  if (extension) return extension;
  if (file.mimetype === "image/png") return ".png";
  if (file.mimetype === "image/webp") return ".webp";
  return ".jpg";
};

const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user?.uid;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Avatar image is required",
      });
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Avatar must be a JPG, PNG, or WebP image",
      });
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return res.status(400).json({
        success: false,
        message: "Avatar size must be 2MB or less",
      });
    }

    const supabase = createSupabaseClient();
    const extension = getExtension(file);
    const filePath = `${userId}/profile-${Date.now()}${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
    const photoURL = data.publicUrl;

    const profile = await prisma.profile.update({
      where: { userId },
      data: { photoURL },
    });

    return res.json({
      success: true,
      data: {
        photoURL,
        profile,
      },
    });
  } catch (error) {
    console.error("Error uploadAvatar:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload avatar",
    });
  }
};

module.exports = { uploadAvatar };
