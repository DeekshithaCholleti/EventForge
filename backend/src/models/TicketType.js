const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    soldCount: { type: Number, default: 0, min: 0 },
    salesStart: { type: Date, required: true },
    salesEnd: { type: Date, required: true },
    benefits: [{ type: String }],
    status: {
      type: String,
      enum: ['ACTIVE', 'DRAFT', 'ARCHIVED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

ticketTypeSchema.pre('validate', function (next) {
  if (this.salesStart && this.salesEnd && this.salesStart > this.salesEnd) {
    this.invalidate('salesEnd', 'Sales end must be after sales start');
  }
  next();
});

module.exports = mongoose.model('TicketType', ticketTypeSchema);
