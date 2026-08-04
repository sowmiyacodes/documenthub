const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");

const {
    askQuestion,
} = require("../controllers/aiController");

router.post(
    "/chat",
    authenticateUser,
    askQuestion
);

module.exports = router;