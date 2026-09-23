const Venue = require('../models/Venue');
const { sendSuccess } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

const listVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find().populate('organization createdBy');
    return sendSuccess(res, 'Venues fetched', { venues }, 200);
  } catch (error) { next(error); }
};

const createVenue = async (req, res, next) => {
  try {
    const venue = await Venue.create({ ...req.body, createdBy: req.user._id });
    return sendSuccess(res, 'Venue created successfully', { venue }, 201);
  } catch (error) { next(error); }
};

const getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id).populate('organization createdBy');
    if (!venue) throw new NotFoundError('Venue not found');
    return sendSuccess(res, 'Venue fetched', { venue }, 200);
  } catch (error) { next(error); }
};

const updateVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!venue) throw new NotFoundError('Venue not found');
    return sendSuccess(res, 'Venue updated successfully', { venue }, 200);
  } catch (error) { next(error); }
};

const deleteVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) throw new NotFoundError('Venue not found');
    return sendSuccess(res, 'Venue deleted successfully', null, 200);
  } catch (error) { next(error); }
};

module.exports = { listVenues, createVenue, getVenueById, updateVenue, deleteVenue };
