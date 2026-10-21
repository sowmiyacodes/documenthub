const express = require("express");
const cors = require("cors");
require("dotenv").config();

const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const reminderJob = require("./jobs/reminder.job");
const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/settings", settingsRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("LifeHub Backend Running");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  reminderJob.start();
});