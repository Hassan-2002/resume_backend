const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    index: true,
  },
  fileName: {
    type: String,
    required: [true, "File name is required"],
  },
  fileType: {
    type: String,
    default: "application/pdf",
  },
  fileSize: {
    type: Number,
  },
  // Store the file path for retrieval
  filePath: {
    type: String,
    default: null,
  },
  // Job description the resume was analyzed against
  jobTitle: {
    type: String,
    default: "",
  },
  jobDescription: {
    type: String,
    default: "",
  },
  companyName: {
    type: String,
    default: "",
  },
  // ATS Analysis Results
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  // Full analysis data (stored as JSON)
  analysisData: {
    type: Object,
    default: {},
  },
  // Parsed resume data (for use in resume builder)
  parsedResumeData: {
    type: Object,
    default: null,
  },
  // Status
  status: {
    type: String,
    enum: ["pending", "analyzing", "completed", "failed"],
    default: "pending",
  },
  // Timestamps
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  analyzedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for faster queries
resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
