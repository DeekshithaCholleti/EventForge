const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '' },
    sessionType: { type: String, enum: ['KEYNOTE', 'PANEL', 'WORKSHOP', 'NETWORKING', 'OTHER'], default: 'OTHER' },
    tags: [{ type: String }],
    speakers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    room: { type: String, trim: true, default: '' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    capacity: { type: Number, min: 1, default: 50 },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'CANCELLED'], default: 'DRAFT' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

sessionSchema.index({ event: 1, room: 1, startTime: 1, endTime: 1 });

sessionSchema.pre('validate', function (next) {
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    this.invalidate('endTime', 'End time must be after start time');
  }
  next();
});

module.exports = mongoose.model('Session', sessionSchema);
