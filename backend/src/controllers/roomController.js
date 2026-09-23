const Room = require('../models/Room');
const { sendSuccess } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

const listRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().populate('venue');
    return sendSuccess(res, 'Rooms fetched', { rooms }, 200);
  } catch (error) { next(error); }
};

const createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    return sendSuccess(res, 'Room created successfully', { room }, 201);
  } catch (error) { next(error); }
};

const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('venue');
    if (!room) throw new NotFoundError('Room not found');
    return sendSuccess(res, 'Room fetched', { room }, 200);
  } catch (error) { next(error); }
};

const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) throw new NotFoundError('Room not found');
    return sendSuccess(res, 'Room updated successfully', { room }, 200);
  } catch (error) { next(error); }
};

const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) throw new NotFoundError('Room not found');
    return sendSuccess(res, 'Room deleted successfully', null, 200);
  } catch (error) { next(error); }
};

module.exports = { listRooms, createRoom, getRoomById, updateRoom, deleteRoom };
