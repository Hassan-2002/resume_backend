const express = require('express');
const router = express.Router();
const  { analyzeUploadedResume }  = require('../controllers/jobDescController');
const upload = require('../middlewares/uploadMiddleware');
router.post('/', upload.single('resume'), analyzeUploadedResume);

module.exports = router;