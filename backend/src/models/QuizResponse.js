const mongoose = require('mongoose');
const { SKIN_TYPES, CONCERNS, UNDERTONES, keys } = require('../config/constants');

// One completed skin test. Anonymous: no name, contact or device id, only the
// answers, so the owner can see what kind of skin their customers have.
const quizResponseSchema = new mongoose.Schema(
  {
    gender: { type: String, enum: ['femra', 'meshkuj'] },
    skinType: { type: String, enum: [...keys(SKIN_TYPES), 'nuk_e_di'] },
    concerns: [{ type: String, enum: keys(CONCERNS) }],
    tone: { type: Number, min: 1, max: 5 },
    undertone: { type: String, enum: [...keys(UNDERTONES), 'nuk_e_di'] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

quizResponseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('QuizResponse', quizResponseSchema);
