const express = require("express");
const cors = require("cors");
const path = require("path");
const resumeRoutes = require("./routes/resumeRoutes");
const authRoutes = require("./routes/authRoutes");
// Load environment variables
require("dotenv").config();

// Create Express app
const app = express();



// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// Routes
app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Resume Builder API is running");
});

module.exports = app;
