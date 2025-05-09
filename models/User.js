const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: "Student" }, // Ensure role field exists
  contact: { type: String }, // Ensure contact field exists
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
