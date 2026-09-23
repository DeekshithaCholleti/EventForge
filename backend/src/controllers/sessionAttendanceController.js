const SessionAttendance = require('../models/SessionAttendance');
const EventMember = require('../models/EventMember');
const StaffAssignment = require('../models/StaffAssignment');
const { sendSuccess } = require('../utils/response');
const { ConflictError, BadRequestError, ForbiddenError } = require('../utils/errors');

const listSessionAttendance = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    if (req.query.session) filter.session = req.query.session;
    if (req.query.attendee) filter.attendee = req.query.attendee;

    // Staff can only view attendance for their assigned events
    if (req.user.role === 'EVENT_STAFF' && req.query.event) {
      const assignment = await StaffAssignment.findOne({
        event: req.query.event,
        staff: req.user._id,
        status: 'ACTIVE',
      });
      if (!assignment) {
        throw new ForbiddenError('You are not assigned as staff for this event');
      }
    }

    const items = await SessionAttendance.find(filter).populate('session attendee recordedBy event');
    return sendSuccess(res, 'Session attendance fetched successfully', { items }, 200);
  } catch (error) {
    next(error);
  }
};

const createSessionAttendance = async (req, res, next) => {
  try {
    const { event, session, attendee, method = 'MANUAL' } = req.body;

    if (!event || !session || !attendee) {
      throw new BadRequestError('Event, session, and attendee are required');
    }

    // Authorization: only organizer of this event, assigned staff, or platform admin
    if (req.user.role !== 'PLATFORM_ADMIN') {
      // Check if organizer
      const organizerMembership = await EventMember.findOne({
        event,
        user: req.user._id,
        status: 'ACTIVE',
        eventRole: 'ORGANIZER',
      });

      if (!organizerMembership) {
        // Check if assigned staff for this event
        const staffAssignment = await StaffAssignment.findOne({
          event,
          staff: req.user._id,
          status: 'ACTIVE',
        });

        if (!staffAssignment) {
          throw new ForbiddenError('You are not authorized to record attendance for this event. Only assigned staff or the event organizer can do this.');
        }
      }
    }

    const existing = await SessionAttendance.findOne({ session, attendee });
    if (existing) {
      throw new ConflictError('Session attendance has already been recorded for this attendee');
    }

    const item = await SessionAttendance.create({
      event,
      session,
      attendee,
      recordedBy: req.user._id,
      method,
      attendedAt: new Date(),
    });

    return sendSuccess(res, 'Session attendance recorded successfully', { item }, 201);
  } catch (error) {
    if (error.code === 11000) {
      return next(new ConflictError('Session attendance has already been recorded for this attendee'));
    }
    next(error);
  }
};

module.exports = { listSessionAttendance, createSessionAttendance };
