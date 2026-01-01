const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  getSectionSuggestions,
  getFullResumeReview,
  rewriteSectionContent,
  generateBullets,
  getTemplates,
  saveResume,
  parseResume
} = require('../controllers/resumeBuilderController');

// Public routes (no auth required for basic functionality)
// Get available templates
router.get('/templates', getTemplates);

// Protected routes (require authentication)
// Parse uploaded resume into structured data
router.post('/parse', authenticateUser, upload.single('resume'), parseResume);

// Get AI suggestions for a section
router.post('/suggestions', authenticateUser, getSectionSuggestions);

// Get full resume AI review
router.post('/review', authenticateUser, getFullResumeReview);

// Rewrite content with AI
router.post('/rewrite', authenticateUser, rewriteSectionContent);

// Generate bullet points from description
router.post('/generate-bullets', authenticateUser, generateBullets);

// Save resume data
router.post('/save', authenticateUser, saveResume);

module.exports = router;
