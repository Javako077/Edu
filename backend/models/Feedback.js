const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:     String,
  email:    String,
  type:     { type: String, enum: ['bug', 'suggestion', 'compliment', 'other'], default: 'other' },
  rating:   { type: Number, min: 1, max: 5 },
  message:  { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
