require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const attendanceRoutes = require("./routes/attendance");

// Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "https://qrcode-attendance-system.vercel.app/" })); // Allow frontend to communicate with backend

// Routes
app.use("/api/attendance", attendanceRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI) // Removed deprecated options
  .then(() => {
    // Listen for requests
    app.listen("https://qrcode-attendance-system.vercel.app/", () => {
      console.log(
        `Connected to MongoDB & listening on port ${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });
