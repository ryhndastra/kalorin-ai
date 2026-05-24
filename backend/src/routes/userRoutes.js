const express = require("express");
const router = express.Router();
const {
  createOrUpdateProfile,
  getProfile,
} = require("../controllers/userController");
const { authenticateFirebaseToken } = require("../middleware/auth");

// Endpoint untuk sinkronisasi (POST)
router.post("/profile", authenticateFirebaseToken, createOrUpdateProfile);

// Endpoint untuk ambil data (GET)
router.get("/profile/:userId", authenticateFirebaseToken, getProfile);

module.exports = router;
