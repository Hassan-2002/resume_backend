const express = require('express');
const { analyzeUploadedResume } = require('../controllers/atsController');

const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');

router.post('/', upload.single('resume'), analyzeUploadedResume);

module.exports = router;
