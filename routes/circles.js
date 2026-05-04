const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Circle = require('../models/Circle');
const User = require('../models/User');

router.get('/', requireAuth, async (req, res) => {
  const circles = await Circle.find({ owner: req.session.user._id }).populate('members', 'name email');
  res.json(circles);
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Circle name is required' });
    const circle = new Circle({ name, color: color || '#2a7c5a', owner: req.session.user._id });
    await circle.save();
    res.json(circle);
  } catch (err) {
    res.status(500).json({ error: 'Could not create circle' });
  }
});

router.post('/:id/members', requireAuth, async (req, res) => {
  try {
    const circle = await Circle.findOne({ _id: req.params.id, owner: req.session.user._id });
    if (!circle) return res.status(404).json({ error: 'Circle not found' });
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (circle.members.includes(user._id))
      return res.status(400).json({ error: 'Already a member' });
    circle.members.push(user._id);
    await circle.save();
    res.json({ success: true, member: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Could not add member' });
  }
});

router.delete('/:id/members/:userId', requireAuth, async (req, res) => {
  try {
    const circle = await Circle.findOne({ _id: req.params.id, owner: req.session.user._id });
    if (!circle) return res.status(404).json({ error: 'Circle not found' });
    circle.members = circle.members.filter(m => m.toString() !== req.params.userId);
    await circle.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not remove member' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await Circle.findOneAndDelete({ _id: req.params.id, owner: req.session.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete circle' });
  }
});

module.exports = router;