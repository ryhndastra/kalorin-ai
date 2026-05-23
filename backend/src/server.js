require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");

// import Controllers
const { getAllFoods, getFoodById, searchFood } = require("./controllers/foodController");
const {
  createOrUpdateProfile,
  getProfile,
} = require("./controllers/userController");

const {
  getFoodRecommendation,
  getQuickInsight,
  getRecommendedFoodList, // fungsi buat list dashboard
} = require("./controllers/aiController");

const user_routes = require("./routes/userRoutes");
const track_routes = require("./routes/trackRoutes");
const insightRoutes = require("./routes/insightRoutes");
const scannerRoutes = require("./routes/scannerRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//  ENDPOINTS

// Endpoint Tes & Health Check
app.get("/", (req, res) => res.send("API KalorinAI Running! "));

// Endpoint Master Food (Database)
app.get("/api/foods", getAllFoods);
app.get("/api/foods/search", searchFood);
app.get("/api/foods/:id", getFoodById);

// Endpoint User Profile (Database)
app.post("/api/profile", createOrUpdateProfile);
app.get("/api/profile/:userId", getProfile);
app.use("/api/user", user_routes);
app.use("/api/track", track_routes);
app.use("/api/insights", insightRoutes);
app.use("/api/scanner", scannerRoutes);

// ENDPOINTS AI

/**
 * endpoint buat quick insight harian (motivasi, tips, dll) di homepage
 * Body: { userId, macroContext }
 */
app.post("/api/ai/recommend", getQuickInsight);

/**
 * endpoint buat list makanan "recommended for You" di dashboard
 * Body: { userId }
 */
app.post("/api/ai/food-list", getRecommendedFoodList);

/**
 * endpoint buat review makanan spesifik (halaman detail)
 * Body: { userId, foodId }
 */
app.post("/api/ai/food-detail", getFoodRecommendation);

// Start Server
app.listen(PORT, () => {
  console.log(`
  Server Node.js jalan di port ${PORT}
  `);
});
