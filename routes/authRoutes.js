const express = require("express");
const { createUser, loginUser, authUserDetails, logout } = require("../controllers/authController");
const router = express.Router();

router.post("/register", createUser);
router.post("/login",loginUser);
router.get("/user-details", authUserDetails)
router.post("/logout", logout)
module.exports = router;

