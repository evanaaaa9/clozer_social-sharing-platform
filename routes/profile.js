const express = require('express');
const router = express.Router();
const path = require('path');
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');

router.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/profile.html'));
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Could not load profile' });
  }
});

router.get('/myposts', requireAuth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.session.user._id })
      .populate('circles', 'name color')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Could not load posts' });
  }
});

router.post('/update', requireAuth, async (req, res) => {
  try {
    const { name, bio } = req.body;
    await User.findByIdAndUpdate(req.session.user._id, { name, bio });
    req.session.user.name = name;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not update profile' });
  }
});

module.exports = router;