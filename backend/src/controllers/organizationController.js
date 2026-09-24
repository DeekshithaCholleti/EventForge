const Organization = require('../models/Organization');
const OrganizationMember = require('../models/OrganizationMember');
const User = require('../models/User');
const { sendSuccess } = require('../utils/response');
const { NotFoundError, ForbiddenError, ValidationError, ConflictError } = require('../utils/errors');

const listOrganizations = async (req, res, next) => {
  try {
    let organizations;
    if (req.user.role === 'PLATFORM_ADMIN') {
      organizations = await Organization.find().sort({ createdAt: -1 });
    } else {
      const memberships = await OrganizationMember.find({ user: req.user._id, status: 'ACTIVE' }).select('organization');
      organizations = await Organization.find({ _id: { $in: memberships.map(({ organization }) => organization) }, isActive: true }).sort({ createdAt: -1 });
    }
    return sendSuccess(res, 'Organizations fetched', { organizations }, 200);
  } catch (error) {
    next(error);
  }
};

const createOrganization = async (req, res, next) => {
  try {
    if (req.user.role !== 'PLATFORM_ADMIN') throw new ForbiddenError('Only platform admins can create organizations');
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
    if (req.user.role !== 'PLATFORM_ADMIN') {
      const membership = await OrganizationMember.findOne({ organization: organization._id, user: req.user._id, status: 'ACTIVE' });
      if (!membership) throw new ForbiddenError('You do not belong to this organization');
    }
    return sendSuccess(res, 'Organization fetched', { organization }, 200);
  } catch (error) {
    next(error);
  }
};

const updateOrganization = async (req, res, next) => {
  try {
    if (req.user.role !== 'PLATFORM_ADMIN') throw new ForbiddenError('Only platform admins can update organizations');
    const organization = await Organization.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!organization) throw new NotFoundError('Organization not found');
    return sendSuccess(res, 'Organization updated successfully', { organization }, 200);
  } catch (error) {
    next(error);
  }
};

const deleteOrganization = async (req, res, next) => {
  try {
    if (req.user.role !== 'PLATFORM_ADMIN') throw new ForbiddenError('Only platform admins can delete organizations');
    const organization = await Organization.findByIdAndDelete(req.params.id);
    if (!organization) throw new NotFoundError('Organization not found');
    return sendSuccess(res, 'Organization deleted successfully', null, 200);
  } catch (error) {
    next(error);
  }
};

const addOrganizer = async (req, res, next) => {
  try {
    if (req.user.role !== 'PLATFORM_ADMIN') throw new ForbiddenError('Only platform admins can add organizers');
    const [organization, organizer] = await Promise.all([
      Organization.findById(req.params.id),
      User.findById(req.body.user).select('-passwordHash'),
    ]);
    if (!organization) throw new NotFoundError('Organization not found');
    if (!organizer) throw new NotFoundError('User not found');
    if (organizer.role !== 'EVENT_ORGANIZER') throw new ValidationError('Only event organizer users can be added to an organization');
    if (!organizer.isActive) throw new ValidationError('Inactive users cannot be added to an organization');

    const existing = await OrganizationMember.findOne({ organization: organization._id, user: organizer._id });
    if (existing) {
      if (existing.status === 'ACTIVE') throw new ConflictError('Organizer already belongs to this organization');
      existing.status = 'ACTIVE';
      existing.role = req.body.role || 'MEMBER';
      await existing.save();
      await existing.populate('user', 'name email role');
      return sendSuccess(res, 'Organizer added to organization', { membership: existing }, 200);
    }

    const membership = await OrganizationMember.create({
      organization: organization._id,
      user: organizer._id,
      role: req.body.role || 'MEMBER',
      status: 'ACTIVE',
    });
    await membership.populate('user', 'name email role');
    return sendSuccess(res, 'Organizer added to organization', { membership }, 201);
  } catch (error) {
    next(error);
  }
};

const listOrganizationMembers = async (req, res, next) => {
  try {
    if (req.user.role !== 'PLATFORM_ADMIN') throw new ForbiddenError('Only platform admins can view organization members');
    const organization = await Organization.findById(req.params.id);
    if (!organization) throw new NotFoundError('Organization not found');
    const members = await OrganizationMember.find({ organization: organization._id, status: 'ACTIVE' }).populate('user', 'name email role').sort({ createdAt: -1 });
    return sendSuccess(res, 'Organization members fetched', { members }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = { listOrganizations, createOrganization, getOrganizationById, updateOrganization, deleteOrganization, addOrganizer, listOrganizationMembers };
