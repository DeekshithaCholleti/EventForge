const User = require('../models/User');
const { sendSuccess } = require('../utils/response');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

const listUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
    return sendSuccess(res, 'Users fetched', { users }, 200);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) throw new NotFoundError('User not found');
    return sendSuccess(res, 'User fetched', { user }, 200);
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    if (req.user.role !== 'PLATFORM_ADMIN') throw new ForbiddenError('Only platform admins can change user roles');
    const validRoles = ['PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF', 'SPEAKER', 'ATTENDEE', 'SPONSOR'];
    const { role } = req.body;
    if (!validRoles.includes(role)) throw new ValidationError(`Invalid role. Valid roles: ${validRoles.join(', ')}`);
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash');
    if (!user) throw new NotFoundError('User not found');
    return sendSuccess(res, 'User role updated', { user }, 200);
  } catch (error) { next(error); }
};

const updateUserStatus = async (req, res, next) => {
  try {
    if (req.user.role !== 'PLATFORM_ADMIN') throw new ForbiddenError('Only platform admins can change user status');
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true }).select('-passwordHash');
    if (!user) throw new NotFoundError('User not found');
    return sendSuccess(res, 'User status updated', { user }, 200);
  } catch (error) { next(error); }
};

module.exports = { listUsers, getUserById, updateUserRole, updateUserStatus };

