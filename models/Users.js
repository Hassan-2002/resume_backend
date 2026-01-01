const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: 6,
    select: false,
  },
  // Plan and credits
  plan: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    default: "free",
  },
  credits: {
    type: Number,
    default: 3, // Free plan gets 3 credits
  },
  // Track usage
  totalAnalyses: {
    type: Number,
    default: 0,
  },
  lastAnalysisDate: {
    type: Date,
  },
  // Subscription dates
  planStartDate: {
    type: Date,
    default: Date.now,
  },
  planEndDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("User", userSchema);
