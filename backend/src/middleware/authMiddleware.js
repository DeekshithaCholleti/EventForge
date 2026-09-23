const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const { UnauthorizedError, ForbiddenError, NotFoundError, BadRequestError } = require('../utils/errors');
const { jwtSecret } = require('../config/env');

const verifyToken = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const decoded = await promisify(jwt.verify)(token, jwtSecret);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is inactive or not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next();

    const decoded = await promisify(jwt.verify)(token, jwtSecret);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (user && user.isActive) req.user = user;
    next();
  } catch (error) {
    next(); // Ignore errors, just proceed as unauthenticated
  }
};

const authorizeRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ForbiddenError('You do not have access to this resource'));
  }

  next();
};

const authorizeEventAccess = (eventIdParam = 'eventId', options = {}) => {
  return async (req, res, next) => {
    try {
      const eventId = req.params[eventIdParam] || req.body[eventIdParam] || req.body.eventId || req.query.eventId || req.query[eventIdParam];
      if (!eventId) {
        return next(new BadRequestError('Event id is required'));
      }

      const EventMember = require('../models/EventMember');
      const Event = require('../models/Event');

      const event = await Event.findById(eventId);
      if (!event) {
        return next(new NotFoundError('Event not found'));
      }

      const membership = await EventMember.findOne({
        event: eventId,
        user: req.user._id,
        status: 'ACTIVE',
      });

      const isPlatformAdmin = req.user.role === 'PLATFORM_ADMIN';
      if (isPlatformAdmin) {
        req.event = event;
        return next();
      }

      if (!membership) {
        return next(new ForbiddenError('You are not a member of this event'));
      }

      if (options.requireRole && !options.requireRole.includes(membership.eventRole)) {
        return next(new ForbiddenError('You do not have the required event role'));
      }

      req.event = event;
      req.eventMember = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const authorizeEventRole = (allowedRoles = []) => async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.params.id || req.body.eventId || req.query.eventId;
    if (!eventId) {
      return next(new UnauthorizedError('Event reference required'));
    }

    const EventMember = require('../models/EventMember');
    const membership = await EventMember.findOne({
      event: eventId,
      user: req.user._id,
      status: 'ACTIVE',
    });

    if (req.user.role === 'PLATFORM_ADMIN') {
      return next();
    }

    if (!membership) {
      return next(new ForbiddenError('You are not a member of this event'));
    }

    if (allowedRoles.length && !allowedRoles.includes(membership.eventRole)) {
      return next(new ForbiddenError('You do not have permission for this event role'));
    }

    req.eventMember = membership;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyToken,
  optionalAuth,
  authorizeRole,
  authorizeEventAccess,
  authorizeEventRole,
};
