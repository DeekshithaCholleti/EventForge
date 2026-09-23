const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const objectIdValidation = (field, location = 'params') => {
  return (location === 'body' ? body(field) : location === 'query' ? query(field) : param(field)).custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error(`${field} must be a valid Mongo ObjectId`);
    }
    return true;
  });
};

module.exports = {
  handleValidationErrors,
  isValidObjectId,
  objectIdValidation,
  body,
  param,
  query,
};
