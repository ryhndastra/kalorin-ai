const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const statusCode =
    error.statusCode ||
    (error.message && error.message.startsWith("CORS blocked") ? 403 : 500);

  if (statusCode >= 500) {
    console.error("Unhandled API error:", error);
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500 ? "Internal server error." : error.message,
  });
};

module.exports = { errorHandler, notFoundHandler };
