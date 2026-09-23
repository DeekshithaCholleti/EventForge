const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    companyName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
    contactInformation: {
      email: String,
      phone: String,
      contactPerson: String,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sponsor', sponsorSchema);
