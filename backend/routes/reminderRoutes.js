const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");
const {
    createReminder,
    deleteReminder,
    getReminder,
    getReminderNotifications,
    getReminderSummary,
    listReminders,
    updateReminder,
    updateReminderStatus,
} = require("../controllers/reminderController");

const router = express.Router();
router.use(authenticateUser);
router.get("/summary", getReminderSummary);
router.get("/notifications", getReminderNotifications);
router.get("/", listReminders);
router.post("/", createReminder);
router.get("/:id", getReminder);
router.patch("/:id", updateReminder);
router.patch("/:id/status", updateReminderStatus);
router.delete("/:id", deleteReminder);

module.exports = router;
