const { registerUser, loginUser } = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    return sendSuccess(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    return sendSuccess(res, 'Login successful', result, 200);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  return sendSuccess(res, 'Logout successful', null, 200);
};

const getMe = async (req, res) => {
  return sendSuccess(res, 'User profile fetched', { user: req.user }, 200);
};

module.exports = { register, login, logout, getMe };
