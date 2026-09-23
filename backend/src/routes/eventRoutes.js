const express = require('express');
const { body, param, query } = require('express-validator');
const { verifyToken, optionalAuth, authorizeRole, authorizeEventAccess } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../validators/commonValidators');
const { listEvents, createEvent, getEventById, updateEvent, deleteEvent } = require('../controllers/eventController');

const router = express.Router();

router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 500 }),
], handleValidationErrors, listEvents);

router.post('/', verifyToken, [
  body('organization').isMongoId().withMessage('Organization is required'),
  body('name').trim().isLength({ min: 2 }).withMessage('Event name is required'),
  body('startDate').isISO8601().withMessage('Start date is required'),
  body('endDate').isISO8601().withMessage('End date is required'),
  body('registrationStart').isISO8601().withMessage('Registration start is required'),
  body('registrationEnd').isISO8601().withMessage('Registration end is required'),
], handleValidationErrors, createEvent);

router.get('/:id', [param('id').isMongoId()], handleValidationErrors, getEventById);
router.patch('/:id', verifyToken, [param('id').isMongoId()], handleValidationErrors, updateEvent);
router.delete('/:id', verifyToken, [param('id').isMongoId()], handleValidationErrors, deleteEvent);

module.exports = router;
