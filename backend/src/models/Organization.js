const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    contactInformation: {
      email: String,
      phone: String,
      website: String,
      address: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
