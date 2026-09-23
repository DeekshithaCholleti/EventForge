const mongoose = require('mongoose');

const staffAssignmentSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    responsibility: {
      type: String,
      enum: ['CHECK_IN', 'SESSION_SUPPORT', 'VENUE_OPERATION', 'ATTENDEE_SUPPORT'],
      required: true,
    },
    assignedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StaffAssignment', staffAssignmentSchema);
