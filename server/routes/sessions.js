const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// POST /api/sessions  — save a completed session
router.post('/', protect, async (req, res) => {
  try {
    const {
      motivation,
      totalSeconds,
      focusSeconds,
      alertCount,
      alerts,
      longestStreak,
    } = req.body;

    const focusScore =
      totalSeconds > 0 ? Math.round((focusSeconds / totalSeconds) * 100) : 100;

    const session = await Session.create({
      user: req.user._id,
      motivation,
      totalSeconds,
      focusSeconds,
      focusScore,
      alertCount,
      alerts: alerts || [],
      longestStreak: longestStreak || 0,
    });

    // Update user totals
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalSessions: 1,
        totalFocusTime: focusSeconds,
      },
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/sessions  — get session history for current user
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const stats = {
      totalSessions: sessions.length,
      totalFocusTime: sessions.reduce((s, sess) => s + sess.focusSeconds, 0),
      avgFocusScore:
        sessions.length > 0
          ? Math.round(
              sessions.reduce((s, sess) => s + sess.focusScore, 0) /
                sessions.length
            )
          : 0,
      totalAlerts: sessions.reduce((s, sess) => s + sess.alertCount, 0),
    };

    res.json({ sessions, stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/sessions/:id  — get a single session
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
