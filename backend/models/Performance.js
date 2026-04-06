const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  topics: [
    {
      name: String,
      questionsAsked: { type: Number, default: 0 },
      quizzesTaken: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      maxScore: { type: Number, default: 0 },
    }
  ],
  totalQuizzes: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  totalMaxScore: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Performance', performanceSchema);
