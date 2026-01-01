const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser")

const path = require("path");
const resumeRoutes = require("./routes/resumeRoutes");
const authRoutes = require("./routes/authRoutes");
const atsRoutes = require("./routes/atsRoutes");
const jobDescRoutes = require("./routes/jobDescRoutes");
const resumeBuilderRoutes = require("./routes/resumeBuilderRoutes");
const generatePDFRoutes = require("./routes/generatePDF");
const authenticateUser = require("./middlewares/authMiddleware"); // Import middleware
require("dotenv").config(); // Load environment variables

const app = express();

// Middleware
const corsOptions = {
  // Your frontend's URL. Use an environment variable for production.
  origin: ['http://localhost:3000', 'http://localhost:3001'], 
  credentials: true, // This is essential for cookies
};
app.use(cookieParser())
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Public Routes (No authentication needed)
app.use("/auth", authRoutes);
//User details 

// Protected Routes (Require JWT)
app.use("/resume", authenticateUser, resumeRoutes);
app.use("/ats-score", atsRoutes);
app.use("/job-desc", authenticateUser, jobDescRoutes);
app.use("/resume-builder", resumeBuilderRoutes);
app.use("/generate-pdf", generatePDFRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Resume Builder API is running");
});



module.exports = app;
