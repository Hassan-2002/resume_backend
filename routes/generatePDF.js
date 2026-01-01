const express = require('express');
const {
  generatePDF,
  generatePDFPreview,
  generateHTMLPreview,
  getTemplatePreview
} = require('../controllers/pdfgeneratorController');
const authenticateUser = require('../middlewares/authMiddleware');

const router = express.Router();

// Generate PDF download
router.post('/', authenticateUser, generatePDF);

// Generate PDF as base64 for preview
router.post('/preview', authenticateUser, generatePDFPreview);

// Generate HTML preview (for iframe)
router.post('/html-preview', generateHTMLPreview);

// Get template preview image
router.get('/template-preview/:templateId', getTemplatePreview);

module.exports = router;