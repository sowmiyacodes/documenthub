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
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  ...(process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS."));
    },
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

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  reminderJob.start();
});