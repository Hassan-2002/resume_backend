const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  candidateName: {
    type: String,
    required: [true, "Please add a candidate name"],
  },
  candidateEmail: {
    type: String,
    required: [true, "Please add a candidate email"],
  },
  candidatePhone: {
    type: String
  },
  candidateAddress: {
    type: String,
  },
  skills: {
    type: [String],
    default: [],
  },
  careerObjective: {
    type: String,
  },
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    graduationYear: String,
  }],
  workExperience: [{
    company: String,
    position: String,
    duration: String,
    responsibilities: String,
  }],
  certifications: {
    type: [String],
    default: [],
  },
  languages: {
    type: [String],
    default: [],
  },
  fileName: {
    type: String,
    required: [true, "Please add a file name"],
  },
  fileType: {
    type: String,
    required: [true, "Please add a file type"],
  },
  fileSize: {
    type: Number,
    required: [true, "Please add a file size"],
  },
  filePath: {
    type: String,
    required: [true, "Please add a file path"],
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Resume', resumeSchema);

