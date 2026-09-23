const mongoose = require('mongoose');

const deliverableSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
      default: 'PENDING',
    },
    completedAt: { type: Date },
  },
  { _id: true }
);

const sponsorAssignmentSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor', required: true },
    sponsorshipPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'SponsorshipPackage', required: true },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'CANCELLED'],
      default: 'ACTIVE',
    },
    notes: { type: String, default: '' },
    deliverables: [deliverableSchema],
    assignedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SponsorAssignment', sponsorAssignmentSchema);
