const crypto = require('crypto');
const Registration = require('../models/Registration');
const TicketType = require('../models/TicketType');
const Event = require('../models/Event');
const Coupon = require('../models/Coupon');
const Ticket = require('../models/Ticket');
const EventMember = require('../models/EventMember');
const WaitlistEntry = require('../models/WaitlistEntry');
const { sendSuccess } = require('../utils/response');
const { NotFoundError, ConflictError, ValidationError, BadRequestError } = require('../utils/errors');

const listRegistrations = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    if (req.query.attendee) filter.attendee = req.query.attendee;
    if (req.query.status) filter.registrationStatus = req.query.status;

    const items = await Registration.find(filter).populate('event attendee ticketType coupon');
    return sendSuccess(res, 'Registrations fetched successfully', { items }, 200);
  } catch (error) {
    next(error);
  }
};

const createRegistration = async (req, res, next) => {
  try {
    const { event: eventId, ticketType: ticketTypeId, coupon: couponInput, attendee: attendeeInput } = req.body;
    const attendeeId = attendeeInput || req.user._id;

    const eventDoc = await Event.findById(eventId);
    if (!eventDoc) throw new NotFoundError('Event not found');

    // Status checks
    if (eventDoc.status === 'CANCELLED') {
      throw new BadRequestError('This event has been cancelled. Registration is not available.');
    }
    const now = new Date();
    if (eventDoc.status === 'COMPLETED' || (eventDoc.endDate && now > eventDoc.endDate)) {
      throw new BadRequestError('This event has already completed. Registration is closed.');
    }

    if (eventDoc.registrationStart && now < eventDoc.registrationStart) {
      throw new BadRequestError(`Registration for this event has not started yet. Registration opens on ${new Date(eventDoc.registrationStart).toLocaleString()}.`);
    }
    if (eventDoc.registrationEnd && now > eventDoc.registrationEnd) {
      throw new BadRequestError('Registration for this event has closed.');
    }

    const ticketTypeDoc = await TicketType.findById(ticketTypeId);
    if (!ticketTypeDoc || ticketTypeDoc.event.toString() !== eventId) {
      throw new NotFoundError('Ticket type not found for this event');
    }
    if (ticketTypeDoc.status === 'ARCHIVED') {
      throw new BadRequestError('This ticket type is no longer available.');
    }

    if (ticketTypeDoc.salesStart && now < ticketTypeDoc.salesStart) {
      throw new BadRequestError(`Ticket sales for this ticket type have not started yet. Sales open on ${new Date(ticketTypeDoc.salesStart).toLocaleString()}.`);
    }
    if (ticketTypeDoc.salesEnd && now > ticketTypeDoc.salesEnd) {
      throw new BadRequestError('Ticket sales for this ticket type have ended.');
    }

    const existing = await Registration.findOne({
      event: eventId,
      attendee: attendeeId,
      registrationStatus: { $in: ['PENDING', 'CONFIRMED', 'WAITLISTED'] },
    });
    if (existing) {
      throw new ConflictError('You are already registered for this event.');
    }

    // Coupon validation & discount calculation
    let couponDoc = null;
    let discountAmount = 0;

    if (couponInput) {
      if (typeof couponInput === 'string' && couponInput.match(/^[0-9a-fA-F]{24}$/)) {
        couponDoc = await Coupon.findById(couponInput);
      } else if (typeof couponInput === 'string') {
        couponDoc = await Coupon.findOne({ event: eventId, code: couponInput.trim().toUpperCase() });
      }

      if (!couponDoc || couponDoc.event.toString() !== eventId) {
        throw new NotFoundError('Invalid coupon code for this event');
      }
      if (!couponDoc.isActive) {
        throw new ValidationError('Coupon is inactive');
      }
      if (couponDoc.validFrom && now < couponDoc.validFrom) {
        throw new ValidationError('Coupon is not yet valid');
      }
      if (couponDoc.validUntil && now > couponDoc.validUntil) {
        throw new ValidationError('Coupon has expired');
      }
      if (couponDoc.maxUses && couponDoc.usedCount >= couponDoc.maxUses) {
        throw new ValidationError('Coupon usage limit reached');
      }
      if (couponDoc.minimumAmount && ticketTypeDoc.price < couponDoc.minimumAmount) {
        throw new ValidationError(`Minimum price of $${couponDoc.minimumAmount} required to use this coupon`);
      }

      if (couponDoc.discountType === 'PERCENTAGE') {
        discountAmount = (ticketTypeDoc.price * couponDoc.discountValue) / 100;
      } else {
        discountAmount = couponDoc.discountValue;
      }
      if (discountAmount > ticketTypeDoc.price) {
        discountAmount = ticketTypeDoc.price;
      }
    }

    const finalAmount = Math.max(0, ticketTypeDoc.price - discountAmount);

    // Check capacity
    const isTicketTypeFull = ticketTypeDoc.capacity && ticketTypeDoc.soldCount >= ticketTypeDoc.capacity;
    const totalConfirmedRegistrations = await Registration.countDocuments({ event: eventId, registrationStatus: 'CONFIRMED' });
    const isEventFull = eventDoc.capacity && totalConfirmedRegistrations >= eventDoc.capacity;

    if (isTicketTypeFull || isEventFull) {
      // Create Waitlist Entry
      const currentWaitlistCount = await WaitlistEntry.countDocuments({ event: eventId, ticketType: ticketTypeId, status: 'WAITING' });
      const waitlistEntry = await WaitlistEntry.create({
        event: eventId,
        attendee: attendeeId,
        ticketType: ticketTypeId,
        position: currentWaitlistCount + 1,
        status: 'WAITING',
      });

      const registration = await Registration.create({
        event: eventId,
        attendee: attendeeId,
        ticketType: ticketTypeId,
        coupon: couponDoc ? couponDoc._id : undefined,
        originalAmount: ticketTypeDoc.price,
        discountAmount,
        finalAmount,
        registrationStatus: 'WAITLISTED',
        paymentStatus: 'PENDING',
        approvalStatus: 'PENDING',
      });

      return sendSuccess(res, 'Registration waitlisted due to capacity', { registration, waitlistEntry }, 201);
    }

    // Capacity is available -> Create CONFIRMED registration
    const registration = await Registration.create({
      event: eventId,
      attendee: attendeeId,
      ticketType: ticketTypeId,
      coupon: couponDoc ? couponDoc._id : undefined,
      originalAmount: ticketTypeDoc.price,
      discountAmount,
      finalAmount,
      registrationStatus: 'CONFIRMED',
      paymentStatus: 'PENDING',
      approvalStatus: 'APPROVED',
    });

    // Update ticket type sold count
    await TicketType.findByIdAndUpdate(ticketTypeId, { $inc: { soldCount: 1 } });

    // Update coupon usage
    if (couponDoc) {
      await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { usedCount: 1 } });
    }

    // Ensure attendee is EventMember
    await EventMember.findOneAndUpdate(
      { event: eventId, user: attendeeId },
      { event: eventId, user: attendeeId, eventRole: 'ATTENDEE', status: 'ACTIVE' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Generate unique Ticket & QR Code Data
    const uniqueTicketCode = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const qrCodeData = `QR-${crypto.randomBytes(12).toString('hex')}`;

    const ticket = await Ticket.create({
      registration: registration._id,
      event: eventId,
      attendee: attendeeId,
      ticketType: ticketTypeId,
      uniqueTicketCode,
      qrCodeData,
      status: 'ACTIVE',
    });

    return sendSuccess(res, 'Registration completed successfully', { registration, ticket }, 201);
  } catch (error) {
    next(error);
  }
};

const getRegistrationById = async (req, res, next) => {
  try {
    const item = await Registration.findById(req.params.id).populate('event attendee ticketType coupon');
    if (!item) throw new NotFoundError('Registration not found');
    return sendSuccess(res, 'Registration fetched', { item }, 200);
  } catch (error) {
    next(error);
  }
};

const updateRegistration = async (req, res, next) => {
  try {
    const item = await Registration.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) throw new NotFoundError('Registration not found');
    return sendSuccess(res, 'Registration updated successfully', { item }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = { listRegistrations, createRegistration, getRegistrationById, updateRegistration };
