const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF', 'SPEAKER', 'ATTENDEE', 'SPONSOR']).withMessage('Invalid role'),
  ],
  handleValidationErrors,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidationErrors,
  login
);

router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getMe);

module.exports = router;
