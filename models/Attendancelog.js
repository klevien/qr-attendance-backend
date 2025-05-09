const mongoose = require("mongoose");

const attendanceLogSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true },
  time: { type: String, required: true },
  timestamp: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true }, // Add role field
  contact: { type: String }, // Add contact field
  email: { type: String }, // Add email field
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AttendanceLog", attendanceLogSchema);
