const EventMember = require('../models/EventMember');
const { sendSuccess } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

const listEventMembers = async (req, res, next) => {
  try {
    const members = await EventMember.find({ event: req.params.eventId || req.query.eventId }).populate('user');
    return sendSuccess(res, 'Event members fetched', { members }, 200);
  } catch (error) { next(error); }
};

const createEventMember = async (req, res, next) => {
  try {
    const member = await EventMember.create({ ...req.body, event: req.body.event || req.params.eventId });
    return sendSuccess(res, 'Event member added', { member }, 201);
  } catch (error) { next(error); }
};

const updateEventMember = async (req, res, next) => {
  try {
    const member = await EventMember.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) throw new NotFoundError('Event member not found');
    return sendSuccess(res, 'Event member updated', { member }, 200);
  } catch (error) { next(error); }
};

const deleteEventMember = async (req, res, next) => {
  try {
    const member = await EventMember.findByIdAndDelete(req.params.id);
    if (!member) throw new NotFoundError('Event member not found');
    return sendSuccess(res, 'Event member removed', null, 200);
  } catch (error) { next(error); }
};

module.exports = { listEventMembers, createEventMember, updateEventMember, deleteEventMember };
