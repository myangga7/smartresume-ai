// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import routes
const resumeRoutes = require("./routes/resumeRoutes");
const aiRoutes = require("./routes/aiRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files dari folder uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Gunakan routes
app.use("/api", resumeRoutes);
app.use("/api", aiRoutes);
app.use("/api", uploadRoutes);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is running!" });
});

// Root route
app.get("/", (req, res) => {
  res.send("SmartResume AI Backend is running!");
});

// Connect to MongoDB
console.log("Mencoba koneksi ke MongoDB...");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "ADA ✓" : "TIDAK ADA ✗");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ BERHASIL terhubung ke MongoDB!");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ SERVER berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ GAGAL koneksi ke MongoDB:", error.message);
  });
