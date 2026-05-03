const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: 'Email already registered' });

    const user = new User({ name, email, password });
    await user.save();

    req.session.user = { _id: user._id, name: user.name, email: user.email };
    res.json({ success: true, redirect: '/dashboard' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });

    req.session.user = { _id: user._id, name: user.name, email: user.email };
    res.json({ success: true, redirect: '/dashboard' });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
