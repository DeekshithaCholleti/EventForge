const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    targetAudience: {
      type: String,
      enum: ['ALL', 'ATTENDEES', 'SPEAKERS', 'STAFF', 'SPONSORS'],
      default: 'ALL',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED'],
      default: 'DRAFT',
    },
    publishedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
