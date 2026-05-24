const express = require("express");
const upload = require("../middleware/upload");
const { uploadAvatar } = require("../controllers/avatarController");
const { authenticateFirebaseToken } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/avatar",
  authenticateFirebaseToken,
  upload.single("avatar"),
  uploadAvatar,
);

module.exports = router;
