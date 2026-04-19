const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Allow ALL origins (*)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Handle preflight (VERY IMPORTANT)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/futureedu')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ DB error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/chat'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/feedback', require('./routes/feedback'));

app.get('/', (req, res) => res.send('FutureEdu API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));