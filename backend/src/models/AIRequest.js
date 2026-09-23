const mongoose = require('mongoose');

const aiRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    type: {
      type: String,
      enum: ['EVENT_DESCRIPTION', 'SPEAKER_BIO', 'ANNOUNCEMENT', 'SESSION_SUMMARY'],
      required: true,
    },
    inputMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    generatedOutput: { type: String, default: '' },
    status: {
      type: String,
      enum: ['DRAFT', 'READY', 'FAILED'],
      default: 'DRAFT',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIRequest', aiRequestSchema);
