const mongoose = require('mongoose');

const TaskProgressSchema = new mongoose.Schema({
  taskId: String,
  completed: { type: Boolean, default: false },
  linkClicked: { type: Boolean, default: false },
  completedAt: Date,
  minutesSpent: { type: Number, default: 0 }
}, { _id: false });

const DayProgressSchema = new mongoose.Schema({
  day: Number,
  date: String,
  completed: { type: Boolean, default: false },
  minutesSpent: { type: Number, default: 0 },
  tasks: [TaskProgressSchema]
}, { _id: false });

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  // Legacy deviceId kept for migration
  deviceId: { type: String, default: null },
  startDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  currentDay: { type: Number, default: 1 },
  streakCount: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCompletedDate: { type: String, default: null },
  totalTasksCompleted: { type: Number, default: 0 },
  totalMinutesSpent: { type: Number, default: 0 },
  // XP earned through task completion (synced to User.xp)
  xpEarned: { type: Number, default: 0 },
  days: [DayProgressSchema]
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);
