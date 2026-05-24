require("dotenv").config({ path: "./.env" });
const app = require("./app");
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`
  Server Node.js jalan di port ${PORT}
  `);
});
