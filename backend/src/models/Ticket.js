const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    registration: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticketType: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketType', required: true },
    uniqueTicketCode: { type: String, required: true, unique: true },
    qrCodeData: { type: String, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'USED', 'CANCELLED', 'REFUNDED'],
      default: 'ACTIVE',
    },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
