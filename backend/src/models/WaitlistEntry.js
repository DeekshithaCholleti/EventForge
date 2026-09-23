const mongoose = require('mongoose');

const waitlistEntrySchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticketType: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketType', required: true },
    position: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['WAITING', 'NOTIFIED', 'CANCELLED'],
      default: 'WAITING',
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WaitlistEntry', waitlistEntrySchema);
