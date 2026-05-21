const express = require("express");
const upload = require("../middleware/upload");
const { scanFoodController } = require("../controllers/scannerController");
const router = express.Router();

router.post("/scan-food", upload.single("file"), scanFoodController);

module.exports = router;
