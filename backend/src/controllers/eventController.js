const Event = require('../models/Event');
const EventMember = require('../models/EventMember');
const { sendSuccess } = require('../utils/response');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');

const listEvents = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.organization) filter.organization = req.query.organization;

    let isOrganizerOrAdmin = false;
    if (req.user && (req.user.role === 'PLATFORM_ADMIN' || req.user.role === 'EVENT_ORGANIZER')) {
      isOrganizerOrAdmin = true;
    }

    if (req.query.myEvents === 'true' && req.user && req.user.role !== 'PLATFORM_ADMIN') {
      const memberships = await EventMember.find({ user: req.user._id, eventRole: 'ORGANIZER', status: 'ACTIVE' });
      const myEventIds = memberships.map(m => m.event);
      filter._id = { $in: myEventIds };
    }

    // Hide past events from non-organizers
    if (!isOrganizerOrAdmin && req.query.includePast !== 'true') {
      filter.endDate = { $gte: new Date() };
      if (!filter.status) {
        filter.status = { $nin: ['COMPLETED', 'CANCELLED'] };
      }
    }

    const [events, total] = await Promise.all([
      Event.find(filter).populate('organization createdBy').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Event.countDocuments(filter),
    ]);

    return sendSuccess(res, 'Events fetched', { events, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }, 200);
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id,
    });

    await EventMember.create({
      event: event._id,
      user: req.user._id,
      eventRole: 'ORGANIZER',
      status: 'ACTIVE',
      permissions: ['MANAGE_EVENT', 'MANAGE_SESSIONS', 'VIEW_ANALYTICS'],
    });

    return sendSuccess(res, 'Event created successfully', { event }, 201);
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organization createdBy');
    if (!event) throw new NotFoundError('Event not found');
    return sendSuccess(res, 'Event fetched', { event }, 200);
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) throw new NotFoundError('Event not found');

    const membership = await EventMember.findOne({ event: event._id, user: req.user._id, status: 'ACTIVE' });
    if (req.user.role !== 'PLATFORM_ADMIN' && (!membership || membership.eventRole !== 'ORGANIZER')) {
      throw new ForbiddenError('Only event organizers can update this event');
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return sendSuccess(res, 'Event updated successfully', { event: updated }, 200);
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) throw new NotFoundError('Event not found');

    const membership = await EventMember.findOne({ event: event._id, user: req.user._id, status: 'ACTIVE' });
    if (req.user.role !== 'PLATFORM_ADMIN' && (!membership || membership.eventRole !== 'ORGANIZER')) {
      throw new ForbiddenError('Only event organizers can cancel this event');
    }

    if (event.status === 'COMPLETED') {
      throw new BadRequestError('Cannot cancel a completed event');
    }
    if (event.status === 'CANCELLED') {
      throw new BadRequestError('Event is already cancelled');
    }

    // Safe cancel — does not hard delete, preserves registrations/tickets
    event.status = 'CANCELLED';
    await event.save();
    return sendSuccess(res, 'Event cancelled successfully', { event }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = { listEvents, createEvent, getEventById, updateEvent, deleteEvent };

