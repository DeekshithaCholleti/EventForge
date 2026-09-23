const Organization = require('../models/Organization');
const { sendSuccess } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

const listOrganizations = async (req, res, next) => {
  try {
    const organizations = await Organization.find().sort({ createdAt: -1 });
    return sendSuccess(res, 'Organizations fetched', { organizations }, 200);
  } catch (error) {
    next(error);
  }
};

const createOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.create(req.body);
    return sendSuccess(res, 'Organization created successfully', { organization }, 201);
  } catch (error) {
    next(error);
  }
};

const getOrganizationById = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) throw new NotFoundError('Organization not found');
    return sendSuccess(res, 'Organization fetched', { organization }, 200);
  } catch (error) {
    next(error);
  }
};

const updateOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!organization) throw new NotFoundError('Organization not found');
    return sendSuccess(res, 'Organization updated successfully', { organization }, 200);
  } catch (error) {
    next(error);
  }
};

const deleteOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);
    if (!organization) throw new NotFoundError('Organization not found');
    return sendSuccess(res, 'Organization deleted successfully', null, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = { listOrganizations, createOrganization, getOrganizationById, updateOrganization, deleteOrganization };
