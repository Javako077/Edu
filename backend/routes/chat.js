const router = require('express').Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const ChatHistory = require('../models/ChatHistory');
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

async function callGemini(contents) {
  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents }
  );
  const parts = data.candidates[0].content.parts;
  return parts.find(p => p.text)?.text || '';
}

async function detectTopic(question) {
  try {
    const raw = await callGemini([{
      role: 'user',
      parts: [{ text: `What is the main academic subject/topic of this question? Reply with ONLY 1-3 words, nothing else.\nQuestion: "${question}"` }]
    }]);
    return raw.trim().slice(0, 50);
  } catch {
    return 'General';
  }
}

router.post('/chat', auth, async (req, res) => {
  const { question, language = 'English' } = req.body;
  if (!question) return res.status(400).json({ message: 'Question required' });

  const systemPrompt = `You are FutureEdu AI Teacher. Explain concepts clearly, step by step, like a patient and knowledgeable teacher. Use simple language and examples. Always respond in ${language}.`;

  try {
    const answer = await callGemini([{
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nStudent: ${question}\nTeacher:` }]
    }]);

    // Save chat history
    await ChatHistory.findOneAndUpdate(
      { userId: req.userId },
      { $push: { messages: [{ role: 'user', content: question }, { role: 'assistant', content: answer }] } },
      { upsert: true }
    );

    // Track topic in performance (non-blocking)
    detectTopic(question).then(async (topic) => {
      const perf = await Performance.findOne({ userId: req.userId });
      if (!perf) {
        await Performance.create({ userId: req.userId, topics: [{ name: topic, questionsAsked: 1 }] });
      } else {
        const idx = perf.topics.findIndex(t => t.name === topic);
        if (idx >= 0) perf.topics[idx].questionsAsked += 1;
        else perf.topics.push({ name: topic, questionsAsked: 1 });
        await perf.save();
      }
    }).catch(() => {});

    res.json({ answer });
  } catch (err) {
    console.error('CHAT ERROR:', err.response?.data || err.message);
    res.status(500).json({ message: 'AI service error', detail: err.response?.data?.error?.message || err.message });
  }
});

router.get('/history', auth, async (req, res) => {
  const history = await ChatHistory.findOne({ userId: req.userId });
  res.json(history?.messages || []);
});

module.exports = router;
