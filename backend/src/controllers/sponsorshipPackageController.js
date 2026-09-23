const SponsorshipPackage = require('../models/SponsorshipPackage');
const { sendSuccess } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

const listPackages = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    const items = await SponsorshipPackage.find(filter).populate('event');
    return sendSuccess(res, 'Sponsorship packages fetched', { items }, 200);
  } catch (error) { next(error); }
};

const createPackage = async (req, res, next) => {
  try {
    const item = await SponsorshipPackage.create(req.body);
    return sendSuccess(res, 'Sponsorship package created successfully', { item }, 201);
  } catch (error) { next(error); }
};

const getPackageById = async (req, res, next) => {
  try {
    const item = await SponsorshipPackage.findById(req.params.id).populate('event');
    if (!item) throw new NotFoundError('Sponsorship package not found');
    return sendSuccess(res, 'Sponsorship package fetched', { item }, 200);
  } catch (error) { next(error); }
};

const updatePackage = async (req, res, next) => {
  try {
    const item = await SponsorshipPackage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) throw new NotFoundError('Sponsorship package not found');
    return sendSuccess(res, 'Sponsorship package updated successfully', { item }, 200);
  } catch (error) { next(error); }
};

module.exports = { listPackages, createPackage, getPackageById, updatePackage };
