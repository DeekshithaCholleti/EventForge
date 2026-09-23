const express = require('express');
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listCheckIns, createCheckIn } = require('../controllers/checkInController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listCheckIns);
router.post(
  '/',
  [
    body('ticket').notEmpty().withMessage('Ticket is required'),
    body('event').optional().isMongoId().withMessage('Invalid event id'),
    body('attendee').optional().isMongoId().withMessage('Invalid attendee id'),
  ],
  handleValidationErrors,
  createCheckIn
);

module.exports = router;
