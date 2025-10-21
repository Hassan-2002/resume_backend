const express =  require('express');
const { generatePDF } = require('../controllers/pdfgeneratorController');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();
router.post('/generate-pdf', upload.single ,generatePDF);

module.exports = router;