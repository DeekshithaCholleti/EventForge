const TicketType = require('../models/TicketType');
const Registration = require('../models/Registration');
const EventMember = require('../models/EventMember');
const { sendSuccess } = require('../utils/response');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');

const listTicketTypes = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    if (!req.query.includeArchived) filter.status = { $ne: 'ARCHIVED' };
    const items = await TicketType.find(filter).populate('event');
    return sendSuccess(res, 'Ticket types fetched', { items }, 200);
  } catch (error) { next(error); }
};

const createTicketType = async (req, res, next) => {
  try {
    const item = await TicketType.create(req.body);
    return sendSuccess(res, 'Ticket type created successfully', { item }, 201);
  } catch (error) { next(error); }
};

const getTicketTypeById = async (req, res, next) => {
  try {
    const item = await TicketType.findById(req.params.id).populate('event');
    if (!item) throw new NotFoundError('Ticket type not found');
    return sendSuccess(res, 'Ticket type fetched', { item }, 200);
  } catch (error) { next(error); }
};

const updateTicketType = async (req, res, next) => {
  try {
    const item = await TicketType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) throw new NotFoundError('Ticket type not found');
    return sendSuccess(res, 'Ticket type updated successfully', { item }, 200);
  } catch (error) { next(error); }
};

const deleteTicketType = async (req, res, next) => {
  try {
    const ticketType = await TicketType.findById(req.params.id);
    if (!ticketType) throw new NotFoundError('Ticket type not found');

    // Verify organizer owns the event (skip for PLATFORM_ADMIN)
    if (req.user.role !== 'PLATFORM_ADMIN') {
      const membership = await EventMember.findOne({
        event: ticketType.event,
        user: req.user._id,
        status: 'ACTIVE',
        eventRole: 'ORGANIZER',
      });
      if (!membership) {
        throw new ForbiddenError('Only the event organizer can delete ticket types');
      }
    }

    // Check if any active registrations exist for this ticket type
    const registrationCount = await Registration.countDocuments({
      ticketType: ticketType._id,
      registrationStatus: { $in: ['PENDING', 'CONFIRMED', 'WAITLISTED'] },
    });

    if (registrationCount > 0) {
      // Soft-delete: archive it
      ticketType.status = 'ARCHIVED';
      await ticketType.save();
      return sendSuccess(res, `This ticket type has ${registrationCount} active registration(s) and cannot be permanently deleted. It has been archived instead.`, { item: ticketType, archived: true }, 200);
    }

    // No registrations — hard delete is safe
    await TicketType.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 'Ticket type deleted successfully', null, 200);
  } catch (error) { next(error); }
};

module.exports = { listTicketTypes, createTicketType, getTicketTypeById, updateTicketType, deleteTicketType };
