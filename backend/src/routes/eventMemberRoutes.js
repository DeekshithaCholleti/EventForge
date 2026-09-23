const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { listEventMembers, createEventMember, updateEventMember, deleteEventMember } = require('../controllers/eventMemberController');
const { handleValidationErrors } = require('../validators/commonValidators');
const { body, param } = require('express-validator');

const router = express.Router();
router.use(verifyToken);

router.get('/:eventId?', listEventMembers);
router.post('/', [body('event').isMongoId(), body('user').isMongoId(), body('eventRole').isIn(['ORGANIZER','STAFF','SPEAKER','ATTENDEE','SPONSOR'])], handleValidationErrors, createEventMember);
router.patch('/:id', [param('id').isMongoId()], handleValidationErrors, updateEventMember);
router.delete('/:id', [param('id').isMongoId()], handleValidationErrors, deleteEventMember);

module.exports = router;
