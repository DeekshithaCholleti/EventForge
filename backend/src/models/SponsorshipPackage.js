const mongoose = require('mongoose');

const sponsorshipPackageSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    benefits: [{ type: String }],
    capacity: { type: Number, min: 1, default: 1 },
    status: {
      type: String,
      enum: ['ACTIVE', 'DRAFT', 'ARCHIVED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SponsorshipPackage', sponsorshipPackageSchema);
