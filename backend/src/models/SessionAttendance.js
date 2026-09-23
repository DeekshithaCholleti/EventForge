const mongoose = require('mongoose');

const sessionAttendanceSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attendedAt: { type: Date, default: Date.now },
    method: {
      type: String,
      enum: ['QR', 'MANUAL', 'CHECK_IN'],
      default: 'MANUAL',
    },
  },
  { timestamps: true }
);

sessionAttendanceSchema.index({ session: 1, attendee: 1 }, { unique: true });

module.exports = mongoose.model('SessionAttendance', sessionAttendanceSchema);
