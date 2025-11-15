// routes/user.js
const express = require("express");
const { getProfile, updateProfile } = require("../controllers/userController");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

module.exports = router;
