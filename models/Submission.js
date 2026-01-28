const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  id: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  language: String,
  code: String,
  status: String, // "pass", "fail", "error"
  passedCount: Number,
  totalTests: Number,
  // Time tracking for performance analytics
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
  duration: { type: Number, default: 0 }, // in milliseconds
  success: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

// Index for faster queries
submissionSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model("Submission", submissionSchema);
