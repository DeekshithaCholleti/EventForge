const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const { ConflictError, UnauthorizedError, ValidationError } = require('../utils/errors');

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });
};

const registerUser = async ({ name, email, password, role = 'ATTENDEE' }) => {
  if (!name || !email || !password) {
    throw new ValidationError('Name, email and password are required');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
  });

  const token = signToken(user);
  return {
    token,
    user: user.toJSON(),
  };
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('User account is inactive');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = signToken(user);
  return {
    token,
    user: user.toJSON(),
  };
};

module.exports = {
  signToken,
  registerUser,
  loginUser,
};
