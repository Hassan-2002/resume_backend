const express = require('express');
const authenticateUser = require('../middlewares/authMiddleware');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const {analyzeUploadedResume} = require('../controllers/atsController');

router.post('/' ,   upload.single('resume'),   authenticateUser, analyzeUploadedResume);

module.exports = router;
