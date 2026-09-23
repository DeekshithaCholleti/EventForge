const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    description: { type: String, default: '' },
    eventType: {
      type: String,
      enum: ['CONFERENCE', 'WORKSHOP', 'SEMINAR', 'EXHIBITION', 'CORPORATE_MEETING', 'WEBINAR'],
      default: 'CONFERENCE',
    },
    banner: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationStart: { type: Date, required: true },
    registrationEnd: { type: Date, required: true },
    location: {
      venueName: String,
      address: String,
      city: String,
      state: String,
      country: String,
      onlineLink: String,
    },
    capacity: { type: Number, min: 1, default: 100 },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

eventSchema.index({ organization: 1, status: 1 });

eventSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }

  if (this.registrationStart && this.registrationEnd && this.registrationStart > this.registrationEnd) {
    this.invalidate('registrationEnd', 'Registration end must be after registration start');
  }

  if (this.registrationStart && this.startDate && this.registrationStart > this.startDate) {
    this.invalidate('registrationStart', 'Registration start cannot be after event start date');
  }

  next();
});

module.exports = mongoose.model('Event', eventSchema);
