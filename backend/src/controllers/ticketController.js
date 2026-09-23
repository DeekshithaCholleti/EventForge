const Ticket = require('../models/Ticket');
const { sendSuccess } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

const listTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find().populate('registration event attendee ticketType');
    return sendSuccess(res, 'Tickets fetched', { tickets }, 200);
  } catch (error) { next(error); }
};

const createTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.create({
      ...req.body,
      uniqueTicketCode: req.body.uniqueTicketCode || `TKT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      qrCodeData: req.body.qrCodeData || `ticket:${Date.now()}`,
    });
    return sendSuccess(res, 'Ticket created successfully', { ticket }, 201);
  } catch (error) { next(error); }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('registration event attendee ticketType');
    if (!ticket) throw new NotFoundError('Ticket not found');
    return sendSuccess(res, 'Ticket fetched', { ticket }, 200);
  } catch (error) { next(error); }
};

module.exports = { listTickets, createTicket, getTicketById };
