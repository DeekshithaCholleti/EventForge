const CheckIn = require('../models/CheckIn');
const Ticket = require('../models/Ticket');
const EventMember = require('../models/EventMember');
const StaffAssignment = require('../models/StaffAssignment');
const User = require('../models/User');
const { sendSuccess } = require('../utils/response');
const { NotFoundError, ConflictError, ForbiddenError, BadRequestError } = require('../utils/errors');

const listCheckIns = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    if (req.query.attendee) filter.attendee = req.query.attendee;

    const items = await CheckIn.find(filter).populate('event attendee ticket checkedInBy');
    return sendSuccess(res, 'Check-ins fetched successfully', { items }, 200);
  } catch (error) {
    next(error);
  }
};

const createCheckIn = async (req, res, next) => {
  try {
    const { ticket: ticketInput, event: eventId, attendee: attendeeId, method = 'QR' } = req.body;

    if (!ticketInput) {
      throw new BadRequestError('Ticket identifier is required');
    }

    // Find ticket by ID, uniqueTicketCode, or qrCodeData
    let ticket = null;
    if (typeof ticketInput === 'string' && ticketInput.match(/^[0-9a-fA-F]{24}$/)) {
      ticket = await Ticket.findById(ticketInput).populate('attendee ticketType');
    }
    if (!ticket) {
      ticket = await Ticket.findOne({
        $or: [{ uniqueTicketCode: ticketInput }, { qrCodeData: ticketInput }],
      }).populate('attendee ticketType');
    }

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    const effectiveEventId = eventId || ticket.event.toString();
    if (ticket.event.toString() !== effectiveEventId) {
      throw new ConflictError('Ticket does not belong to the specified event');
    }

    if (ticket.status !== 'ACTIVE') {
      throw new BadRequestError(`Ticket cannot be checked in because its status is "${ticket.status}". It may have already been used.`);
    }

    if (attendeeId && ticket.attendee._id.toString() !== attendeeId) {
      throw new ConflictError('Ticket does not belong to the specified attendee');
    }

    // Check staff authorization for the event — event-scoped
    if (req.user.role !== 'PLATFORM_ADMIN') {
      // Allow event organizer
      const organizerMembership = await EventMember.findOne({
        event: effectiveEventId,
        user: req.user._id,
        status: 'ACTIVE',
        eventRole: 'ORGANIZER',
      });

      if (!organizerMembership) {
        // Must have an active StaffAssignment for this specific event with CHECK_IN responsibility
        const staffAssignment = await StaffAssignment.findOne({
          event: effectiveEventId,
          staff: req.user._id,
          status: 'ACTIVE',
          responsibility: 'CHECK_IN',
        });

        if (!staffAssignment) {
          throw new ForbiddenError('Check-in failed: You are not assigned as staff for this event.');
        }
      }
    }

    // Check duplicate check-in
    const existingCheckIn = await CheckIn.findOne({ ticket: ticket._id });
    if (existingCheckIn) {
      throw new ConflictError('Ticket has already been checked in');
    }

    // Create CheckIn record
    const checkIn = await CheckIn.create({
      event: effectiveEventId,
      attendee: ticket.attendee._id,
      ticket: ticket._id,
      checkedInBy: req.user._id,
      method,
      checkedInAt: new Date(),
    });

    // Mark ticket as USED
    ticket.status = 'USED';
    await ticket.save();

    const attendeeInfo = await User.findById(ticket.attendee._id).select('name email profile');

    return sendSuccess(
      res,
      'Attendee checked in successfully',
      {
        checkIn,
        ticket: {
          _id: ticket._id,
          uniqueTicketCode: ticket.uniqueTicketCode,
          status: ticket.status,
          ticketType: ticket.ticketType,
        },
        attendee: attendeeInfo,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { listCheckIns, createCheckIn };
