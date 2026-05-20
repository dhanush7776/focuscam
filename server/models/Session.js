const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  type: String,      // 'eyes_closed' | 'face_away' | 'yawning' | 'phone'
  timestamp: Number, // seconds into session
});

const SessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    motivation: {
      type: String,
      default: '',
    },
    totalSeconds: {
      type: Number,
      required: true,
      default: 0,
    },
    focusSeconds: {
      type: Number,
      default: 0,
    },
    focusScore: {
      type: Number, // percentage 0-100
      default: 100,
    },
    alertCount: {
      type: Number,
      default: 0,
    },
    alerts: [AlertSchema],
    longestStreak: {
      type: Number, // longest focused streak in seconds
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', SessionSchema);
