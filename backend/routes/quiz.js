const router = require('express').Router();
const axios = require('axios');
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

async function callGemini(prompt) {
  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ role: 'user', parts: [{ text: prompt }] }] }
  );
  const parts = data.candidates[0].content.parts;
  return parts.find(p => p.text)?.text || '';
}

router.post('/generate', auth, async (req, res) => {
  const { topic, language = 'English', count = 5 } = req.body;
  if (!topic) return res.status(400).json({ message: 'Topic required' });

  const prompt = `Generate exactly ${count} multiple choice questions about "${topic}" in ${language}.
Return ONLY a valid JSON array, no markdown, no explanation. Format:
[{"question":"...","options":["A","B","C","D"],"answer":"A","explanation":"..."}]`;

  try {
    const raw = await callGemini(prompt);
    const jsonStr = raw.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(jsonStr);
    res.json({ topic, questions });
  } catch (err) {
    res.status(500).json({ message: 'Quiz generation failed', detail: err.message });
  }
});

router.post('/submit', auth, async (req, res) => {
  const { topic, score, maxScore } = req.body;
  try {
    const perf = await Performance.findOneAndUpdate(
      { userId: req.userId },
      { $inc: { totalQuizzes: 1, totalScore: score, totalMaxScore: maxScore } },
      { upsert: true, new: true }
    );
    const idx = perf.topics.findIndex(t => t.name === topic);
    if (idx >= 0) {
      perf.topics[idx].quizzesTaken += 1;
      perf.topics[idx].totalScore += score;
      perf.topics[idx].maxScore += maxScore;
    } else {
      perf.topics.push({ name: topic, quizzesTaken: 1, totalScore: score, maxScore });
    }
    await perf.save();
    res.json({ ok: true, performance: perf });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
