const express = require("express");
const router = express.Router();

const { addMealLog, getDailyLogs } = require("../controllers/trackController");
const { authenticateFirebaseToken } = require("../middleware/auth");

router.use(authenticateFirebaseToken);

// ADD MEAL LOG
router.post("/add", addMealLog);

// GET DAILY LOGS
router.get("/logs", getDailyLogs);

module.exports = router;
