const express = require("express");
const cors = require("cors");
const path = require("path");
const resumeRoutes = require("./routes/resumeRoutes");
const authRoutes = require("./routes/authRoutes");
const atsRoutes = require("./routes/atsRoutes");
const jobDescRoutes = require("./routes/jobDescRoutes");
const authenticateUser = require("./middlewares/authMiddleware"); // Import middleware
require("dotenv").config(); // Load environment variables

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Public Routes (No authentication needed)
app.use("/auth", authRoutes);

// Protected Routes (Require JWT)
app.use("/resume", authenticateUser, resumeRoutes);
app.use("/ats-score", atsRoutes);
app.use("/jobdesc", authenticateUser, jobDescRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Resume Builder API is running");
});

module.exports = app;
