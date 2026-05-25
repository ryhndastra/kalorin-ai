const express = require("express");
const cors = require("cors");
const { authenticateFirebaseToken } = require("./middleware/auth");
const { parseCorsOrigins, validateCriticalEnv } = require("./config/env");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// import Controllers
const {
  getAllFoods,
  getFoodById,
  searchFood,
} = require("./controllers/foodController");
const {
  createOrUpdateProfile,
  getProfile,
} = require("./controllers/userController");

const {
  getFoodRecommendation,
  getQuickInsight,
  getRecommendedFoodList, // fungsi buat list dashboard
} = require("./controllers/aiController");

const track_routes = require("./routes/trackRoutes");
const insightRoutes = require("./routes/insightRoutes");
const scannerRoutes = require("./routes/scannerRoutes");
const avatarRoutes = require("./routes/avatarRoutes");

const app = express();
const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS);

validateCriticalEnv();

// middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl/postman) and whitelisted browser origins.
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  }),
);

app.use(express.json());

//  ENDPOINTS

// Endpoint Tes & Health Check
app.get("/", (req, res) => res.send("API KalorinAI Running! "));

// Endpoint Master Food (Database)
app.get("/api/foods", getAllFoods);
app.get("/api/foods/search", searchFood);
app.get("/api/foods/:id", getFoodById);

// Endpoint User Profile (Database)
app.post("/api/profile", authenticateFirebaseToken, createOrUpdateProfile);
app.get("/api/profile/:userId", authenticateFirebaseToken, getProfile);
app.use("/api/track", track_routes);
app.use("/api/insights", insightRoutes);
app.use("/api/scanner", scannerRoutes);
app.use("/api/profile", avatarRoutes);

// ENDPOINTS AI

/**
 * endpoint buat quick insight harian (motivasi, tips, dll) di homepage
 * Body: { userId, macroContext }
 */
app.post("/api/ai/recommend", authenticateFirebaseToken, getQuickInsight);

/**
 * endpoint buat list makanan "recommended for You" di dashboard
 * Body: { userId }
 */
app.post(
  "/api/ai/food-list",
  authenticateFirebaseToken,
  getRecommendedFoodList,
);

/**
 * endpoint buat review makanan spesifik (halaman detail)
 * Body: { userId, foodId }
 */
app.post(
  "/api/ai/food-detail",
  authenticateFirebaseToken,
  getFoodRecommendation,
);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
