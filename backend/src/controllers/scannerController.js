const { scanFoodImage } = require("../services/scannerService");

const scanFoodController = async (req, res) => {
  try {
    // NO FILE
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required.",
      });
    }

    // SCAN FOOD
    const result = await scanFoodImage(req.file.buffer, req.file.originalname);
    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  scanFoodController,
};
