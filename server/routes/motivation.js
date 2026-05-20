const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/motivation  — get current user's motivation
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('motivation name');
    res.json({ motivation: user.motivation, name: user.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/motivation  — save/update motivation
router.put('/', protect, async (req, res) => {
  try {
    const { motivation } = req.body;
    if (!motivation || motivation.trim() === '') {
      return res.status(400).json({ message: 'Motivation cannot be empty' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { motivation: motivation.trim() },
      { new: true }
    ).select('-password');

    res.json({ motivation: user.motivation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
