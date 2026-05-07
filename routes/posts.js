const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Post = require('../models/Post');
const Circle = require('../models/Circle');

// GET FEED - Only shows whispers that haven't expired
router.get('/feed', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const myCircles = await Circle.find({ owner: userId });
    const memberCircles = await Circle.find({ members: userId });
    const allCircleIds = [...myCircles, ...memberCircles].map(c => c._id);

    const { circle } = req.query;
    const filter = {
      circles: circle ? circle : { $in: allCircleIds },
      expiresAt: { $gt: new Date() } // Double check they haven't expired
    };

    const posts = await Post.find(filter)
      .populate('author', 'name email')
      .populate('circles', 'name color')
      .populate('comments.author', 'name')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Could not load feed' });
  }
});

// CREATE WHISPER
router.post('/', requireAuth, async (req, res) => {
  try {
    const { content, circles } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    if (!circles || !circles.length) return res.status(400).json({ error: 'Select a circle' });

    const post = new Post({
      content,
      circles,
      author: req.session.user._id
    });

    await post.save();
    await post.populate('author', 'name email');
    await post.populate('circles', 'name color');
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Could not create whisper' });
  }
});

// LIKE WHISPER
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Whisper vanished!' });

    const userId = req.session.user._id.toString();
    const liked = post.likes.map(l => l.toString()).includes(userId);

    if (liked) post.likes = post.likes.filter(l => l.toString() !== userId);
    else post.likes.push(req.session.user._id);

    await post.save();
    res.json({ likes: post.likes.length, liked: !liked });
  } catch (err) {
    res.status(500).json({ error: 'Could not like' });
  }
});

// DELETE WHISPER
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await Post.findOneAndDelete({ _id: req.params.id, author: req.session.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete' });
  }
});

module.exports = router;