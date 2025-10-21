const express = require("express");
const { createUser, loginUser, authUserDetails } = require("../controllers/authController");
const router = express.Router();

router.post("/register", createUser);
router.post("/login",loginUser);
router.get("/user-details", authUserDetails)

module.exports = router;

