const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.userId = jwt.verify(token, process.env.JWT_SECRET).id; next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
}

router.post('/', auth, async (req, res) => {
  try {
    const { type, rating, message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message required' });
    const user = await User.findById(req.userId).select('name email');
    const fb = await Feedback.create({
      userId: req.userId,
      name: user?.name,
      email: user?.email,
      type, rating, message
    });
    res.status(201).json(fb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/mine', auth, async (req, res) => {
  const list = await Feedback.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(list);
});

module.exports = router;
