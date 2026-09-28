const express = require("express");

const { register, login } = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login)
router.get("/me", authenticate, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});


module.exports = router;


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsInJvbGUiOiJQQVNTRU5HRVIiLCJpYXQiOjE3OTA1OTc2NDQsImV4cCI6MTc5MDY4NDA0NH0.dDZEnU6fAuRU3sbwd1ZdsinBgAKHMJcokiILRIU9064