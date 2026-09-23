const mongoose = require('mongoose');

const eventMemberSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventRole: {
      type: String,
      enum: ['ORGANIZER', 'STAFF', 'SPEAKER', 'ATTENDEE', 'SPONSOR'],
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'INACTIVE'],
      default: 'ACTIVE',
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

eventMemberSchema.index({ event: 1, user: 1 }, { unique: true });
module.exports = mongoose.model('EventMember', eventMemberSchema);
