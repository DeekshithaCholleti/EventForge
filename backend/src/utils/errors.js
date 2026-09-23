class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors = []) {
    super(message, 400, errors);
    this.name = 'BadRequestError';
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', errors = []) {
    super(message, 401, errors);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', errors = []) {
    super(message, 403, errors);
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not found', errors = []) {
    super(message, 404, errors);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict', errors = []) {
    super(message, 409, errors);
    this.name = 'ConflictError';
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 422, errors);
    this.name = 'ValidationError';
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
};
