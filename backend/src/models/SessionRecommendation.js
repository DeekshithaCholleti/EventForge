const mongoose = require('mongoose');

const sessionRecommendationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    reason: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

sessionRecommendationSchema.index({ event: 1, attendee: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('SessionRecommendation', sessionRecommendationSchema);
