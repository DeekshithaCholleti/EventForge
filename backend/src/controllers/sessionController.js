const Session = require('../models/Session');
const { sendSuccess } = require('../utils/response');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { checkRoomConflict, checkSpeakerConflict } = require('../services/sessionConflictService');

const listSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find().populate('event speakers createdBy');
    return sendSuccess(res, 'Sessions fetched', { sessions }, 200);
  } catch (error) { next(error); }
};

const createSession = async (req, res, next) => {
  try {
    const { event, room, speakers = [], startTime, endTime } = req.body;
    const roomConflict = await checkRoomConflict({ eventId: event, roomId: room, startTime, endTime });
    if (roomConflict) throw new ConflictError('Room conflict detected for this session time');
    const speakerConflict = await checkSpeakerConflict({ eventId: event, speakers, startTime, endTime });
    if (speakerConflict) throw new ConflictError('Speaker conflict detected for this session time');

    const session = await Session.create({ ...req.body, createdBy: req.user._id });
    return sendSuccess(res, 'Session created successfully', { session }, 201);
  } catch (error) { next(error); }
};

const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id).populate('event speakers createdBy');
    if (!session) throw new NotFoundError('Session not found');
    return sendSuccess(res, 'Session fetched', { session }, 200);
  } catch (error) { next(error); }
};

const updateSession = async (req, res, next) => {
  try {
    const existing = await Session.findById(req.params.id);
    if (!existing) throw new NotFoundError('Session not found');

    const nextData = { ...existing.toObject(), ...req.body };
    const roomConflict = await checkRoomConflict({ eventId: nextData.event, roomId: nextData.room, startTime: nextData.startTime, endTime: nextData.endTime, sessionId: req.params.id });
    if (roomConflict) throw new ConflictError('Room conflict detected for this session time');
    const speakerConflict = await checkSpeakerConflict({ eventId: nextData.event, speakers: nextData.speakers || [], startTime: nextData.startTime, endTime: nextData.endTime, sessionId: req.params.id });
    if (speakerConflict) throw new ConflictError('Speaker conflict detected for this session time');

    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return sendSuccess(res, 'Session updated successfully', { session }, 200);
  } catch (error) { next(error); }
};

const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) throw new NotFoundError('Session not found');
    return sendSuccess(res, 'Session deleted successfully', null, 200);
  } catch (error) { next(error); }
};

module.exports = { listSessions, createSession, getSessionById, updateSession, deleteSession };
