const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticketType: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketType', required: true },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    originalAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    registrationStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'WAITLISTED', 'CANCELLED', 'REJECTED'],
      default: 'PENDING',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

registrationSchema.index({ event: 1, attendee: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
