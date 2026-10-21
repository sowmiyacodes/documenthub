const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");
const { getSettings, updateSettings } = require("../controllers/settingsController");

const router = express.Router();
router.use(authenticateUser);
router.get("/", getSettings);
router.patch("/", updateSettings);

module.exports = router;
