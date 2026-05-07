const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Post = require('../models/Post');
const Circle = require('../models/Circle');

router.get('/feed', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const myCircles = await Circle.find({ owner: userId });
    const memberCircles = await Circle.find({ members: userId });
    const allCircleIds = [...myCircles, ...memberCircles].map(c => c._id);

    const { circle } = req.query;
    const filter = circle
      ? { circles: circle }
      : { circles: { $in: allCircleIds } };

    const posts = await Post.find(filter)
      .populate('author', 'name email')
      .populate('circles', 'name color')
      .populate('comments.author', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Could not load feed' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { content, circles } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    if (!circles || !circles.length)
      return res.status(400).json({ error: 'Select at least one circle' });
    const post = new Post({ content, circles, author: req.session.user._id });
    await post.save();
    await post.populate('author', 'name email');
    await post.populate('circles', 'name color');
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Could not create post' });
  }
});

router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const userId = req.session.user._id.toString();
    const liked = post.likes.map(l => l.toString()).includes(userId);
    if (liked) post.likes = post.likes.filter(l => l.toString() !== userId);
    else post.likes.push(req.session.user._id);
    await post.save();
    res.json({ likes: post.likes.length, liked: !liked });
  } catch (err) {
    res.status(500).json({ error: 'Could not like post' });
  }
});

router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.comments.push({ author: req.session.user._id, text });
    await post.save();
    const comment = post.comments[post.comments.length - 1];
    res.json({ ...comment.toObject(), author: { name: req.session.user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Could not add comment' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await Post.findOneAndDelete({ _id: req.params.id, author: req.session.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete post' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findOne({ _id: req.params.id, author: req.session.user._id });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.content = content;
    await post.save();
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ error: 'Could not update post' });
  }
});

module.exports = router;