const { sendError } = require('../utils/response');

const notFoundHandler = (req, res) => {
  return sendError(res, 'Route not found', [{ path: req.originalUrl, message: 'Endpoint does not exist' }], 404);
};

const globalErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', err);
  }

  return sendError(res, message, errors, statusCode);
};

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
