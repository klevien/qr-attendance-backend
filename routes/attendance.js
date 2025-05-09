const express = require("express");
const router = express.Router();
const User = require("../models/User");
const AttendanceLog = require("../models/Attendancelog");

// Get all registered users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users: " + error.message,
    });
  }
});

// Register a new user
router.post("/users", async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, message: "Request body is missing" });
    }

    const { studentId, name, email, role, contact } = req.body;
    if (!studentId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "Student ID, name, and email are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ studentId }, { email }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.studentId === studentId
            ? "Student ID already exists"
            : "Email already exists",
      });
    }

    const user = new User({
      studentId,
      name,
      email,
      role: role || "Student",
      contact,
    });
    const newUser = await user.save();
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).json({
      success: false,
      message: "Failed to register user: " + error.message,
    });
  }
});

// Delete a specific user and their attendance logs
router.delete("/users/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const user = await User.findOneAndDelete({ studentId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await AttendanceLog.deleteMany({ studentId });

    res.json({
      success: true,
      message: "User and associated attendance logs deleted",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user: " + error.message,
    });
  }
});

// Get all attendance logs (non-archived)
router.get("/logs", async (req, res) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 1);

    const logs = await AttendanceLog.find({
      timestamp: { $gte: cutoffDate.toISOString() },
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance logs: " + error.message,
    });
  }
});

// Add a new attendance log (e.g., from QR scan)
router.post("/logs", async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, message: "Request body is missing" });
    }

    const {
      studentId,
      date,
      status,
      time,
      timestamp,
      name,
      role,
      contact,
      email,
    } = req.body;
    if (
      !studentId ||
      !date ||
      !status ||
      !time ||
      !timestamp ||
      !name ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All required fields (studentId, date, status, time, timestamp, name, role) must be provided",
      });
    }

    const user = await User.findOne({ studentId });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Student not found" });
    }

    const log = new AttendanceLog({
      studentId,
      date,
      status,
      time,
      timestamp,
      name,
      role,
      contact: contact || user.contact || "",
      email: email || user.email || "",
    });
    const newLog = await log.save();
    res.status(201).json({ success: true, data: newLog });
  } catch (error) {
    console.error("Error adding attendance log:", error);
    res.status(400).json({
      success: false,
      message: "Failed to add attendance log: " + error.message,
    });
  }
});

// Delete a specific attendance log
router.delete("/logs/:id", async (req, res) => {
  try {
    const log = await AttendanceLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance log not found" });
    }
    res.json({ success: true, message: "Attendance log deleted" });
  } catch (error) {
    console.error("Error deleting attendance log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete attendance log: " + error.message,
    });
  }
});

// Clear all attendance logs (but not registered users)
router.delete("/clear", async (req, res) => {
  try {
    await AttendanceLog.deleteMany({});
    res.json({
      success: true,
      message: "All attendance logs cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing attendance logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear attendance logs: " + error.message,
    });
  }
});

// Get archived attendance logs (logs older than present day)
router.get("/archive", async (req, res) => {
  try {
    // Define a cutoff date for archived logs (older than present day)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate()); // Go back present day
    cutoffDate.setHours(0, 0, 0, 0);
    // Fetch logs older than the cutoff date
    const archivedLogs = await AttendanceLog.find({
      timestamp: { $lt: cutoffDate.toISOString() },
    });

    res.json({ success: true, data: archivedLogs });
  } catch (error) {
    console.error("Error fetching archived logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch archived logs: " + error.message,
    });
  }
});

module.exports = router;
