const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");

const {uploadResume}
 = require("../controllers/resumeControllers");

router.post("/upload", upload.single("resume"), uploadResume);

module.exports = router;


