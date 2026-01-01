const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const authenticateUser = require('../middlewares/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const {
  analyzeUploadedResume,
  getUserAnalyses,
  getAnalysisById,
  deleteAnalysis,
  getDashboardStats,
  getResumeFile,
} = require('../controllers/atsController');

// Optional auth middleware - sets req.user if token exists, but doesn't block
const optionalAuth = async (req, res, next) => {
  const { session_token } = req.cookies;
  
  if (!session_token) {
    // No token, continue without user
    return next();
  }
  
  try {
    const decoded = jwt.verify(session_token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userid);
    if (user) {
      req.user = { id: user._id, email: user.email, name: user.name };
    }
  } catch (error) {
    // Token invalid, continue without user
    console.log('Optional auth: Token invalid or expired');
  }
  
  next();
};

// Analyze resume - works for both logged in and anonymous users
// If logged in, saves to database
router.post('/', optionalAuth, upload.single('resume'), analyzeUploadedResume);

// Protected routes - require authentication
router.get('/history', authenticateUser, getUserAnalyses);
router.get('/dashboard-stats', authenticateUser, getDashboardStats);
router.get('/:id', authenticateUser, getAnalysisById);
router.get('/:id/file', authenticateUser, getResumeFile);
router.delete('/:id', authenticateUser, deleteAnalysis);

module.exports = router;
