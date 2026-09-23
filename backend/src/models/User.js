const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF', 'SPEAKER', 'ATTENDEE', 'SPONSOR'],
      default: 'ATTENDEE',
      required: true,
    },
    profile: {
      bio: String,
      phone: String,
      company: String,
      avatar: String,
      location: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
