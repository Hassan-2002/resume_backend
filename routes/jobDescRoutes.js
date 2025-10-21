const express = require('express');
const router = express.Router();
const { analyzeResumeJD } = require('../controllers/jobDescController');
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware')


router.post('/', upload.single('resume'), analyzeResumeJD);

module.exports = router;