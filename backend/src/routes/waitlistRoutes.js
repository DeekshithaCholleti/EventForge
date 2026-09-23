const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listWaitlistEntries, createWaitlistEntry, getWaitlistEntryById } = require('../controllers/waitlistController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listWaitlistEntries);
router.post('/', [body('event').isMongoId(), body('attendee').isMongoId(), body('ticketType').isMongoId(), body('position').isInt({ min: 1 })], handleValidationErrors, createWaitlistEntry);
router.get('/:id', [param('id').isMongoId()], handleValidationErrors, getWaitlistEntryById);
module.exports = router;
