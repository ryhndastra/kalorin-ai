const { scanFoodImage } = require("../services/scannerService");

const scanFoodController = async (req, res, next) => {
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
    return next(error);
  }
};

module.exports = {
  scanFoodController,
};
