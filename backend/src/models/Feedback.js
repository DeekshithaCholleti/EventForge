const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

feedbackSchema.index({ session: 1, attendee: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
