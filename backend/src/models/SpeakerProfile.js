const mongoose = require('mongoose');

const speakerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, default: '' },
    designation: { type: String, default: '' },
    company: { type: String, default: '' },
    expertise: [{ type: String }],
    profileImage: { type: String, default: '' },
    socialLinks: {
      linkedin: String,
      twitter: String,
      website: String,
    },
    availability: { type: String, default: '' },
    presentationMaterials: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SpeakerProfile', speakerProfileSchema);
