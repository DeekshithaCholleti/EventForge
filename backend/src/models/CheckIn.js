const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    checkedInAt: { type: Date, default: Date.now },
    method: {
      type: String,
      enum: ['QR', 'MANUAL', 'STAFF'],
      default: 'QR',
    },
  },
  { timestamps: true }
);

checkInSchema.index({ ticket: 1 }, { unique: true });

module.exports = mongoose.model('CheckIn', checkInSchema);
