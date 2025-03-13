const express = require("express");
const { createUser, loginUser } = require("../controllers/authController");
const authenticateUser = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);

module.exports = router;

