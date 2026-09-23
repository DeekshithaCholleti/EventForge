const WaitlistEntry = require('../models/WaitlistEntry');
const { sendSuccess } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

const listWaitlistEntries = async (req, res, next) => {
  try {
    const items = await WaitlistEntry.find().populate('event attendee ticketType');
    return sendSuccess(res, 'Waitlist entries fetched', { items }, 200);
  } catch (error) { next(error); }
};

const createWaitlistEntry = async (req, res, next) => {
  try {
    const item = await WaitlistEntry.create(req.body);
    return sendSuccess(res, 'Waitlist entry created successfully', { item }, 201);
  } catch (error) { next(error); }
};

const getWaitlistEntryById = async (req, res, next) => {
  try {
    const item = await WaitlistEntry.findById(req.params.id).populate('event attendee ticketType');
    if (!item) throw new NotFoundError('Waitlist entry not found');
    return sendSuccess(res, 'Waitlist entry fetched', { item }, 200);
  } catch (error) { next(error); }
};

module.exports = { listWaitlistEntries, createWaitlistEntry, getWaitlistEntryById };
