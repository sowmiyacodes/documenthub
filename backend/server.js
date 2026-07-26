const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Next.js frontend
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("LifeHub Backend Running");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});