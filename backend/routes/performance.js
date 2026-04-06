const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Performance = require('../models/Performance');

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

router.get('/', auth, async (req, res) => {
  try {
    const perf = await Performance.findOne({ userId: req.userId });
    res.json(perf || { topics: [], totalQuizzes: 0, totalScore: 0, totalMaxScore: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Called internally after quiz submission
router.post('/update', auth, async (req, res) => {
  const { topic, score, maxScore } = req.body;
  try {
    const perf = await Performance.findOneAndUpdate(
      { userId: req.userId },
      {
        $inc: { totalQuizzes: 1, totalScore: score, totalMaxScore: maxScore },
      },
      { upsert: true, new: true }
    );

    const topicIndex = perf.topics.findIndex(t => t.name === topic);
    if (topicIndex >= 0) {
      perf.topics[topicIndex].quizzesTaken += 1;
      perf.topics[topicIndex].totalScore += score;
      perf.topics[topicIndex].maxScore += maxScore;
    } else {
      perf.topics.push({ name: topic, quizzesTaken: 1, totalScore: score, maxScore });
    }
    await perf.save();
    res.json(perf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Track topic from chat
router.post('/track-topic', auth, async (req, res) => {
  const { topic } = req.body;
  try {
    const perf = await Performance.findOne({ userId: req.userId });
    if (!perf) {
      await Performance.create({ userId: req.userId, topics: [{ name: topic, questionsAsked: 1 }] });
    } else {
      const idx = perf.topics.findIndex(t => t.name === topic);
      if (idx >= 0) perf.topics[idx].questionsAsked += 1;
      else perf.topics.push({ name: topic, questionsAsked: 1 });
      await perf.save();
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
