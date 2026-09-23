const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  listSpeakerProfiles, createSpeakerProfile, getSpeakerProfileById, updateSpeakerProfile,
  getMyProfile, updateMyProfile, getMyEvents,
  assignSpeakerToEvent, removeSpeakerFromEvent,
} = require('../controllers/speakerController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);

// Speaker self-service routes (must come before /:id to avoid shadowing)
router.get('/my-profile', getMyProfile);
router.patch('/my-profile', updateMyProfile);
router.get('/my-events', getMyEvents);

// Organizer assignment routes
router.post('/assign-event', [body('event').isMongoId(), body('user').isMongoId()], handleValidationErrors, assignSpeakerToEvent);
router.delete('/assign-event', removeSpeakerFromEvent);

// General listing & CRUD
router.get('/', listSpeakerProfiles);
router.post('/', [body('bio').optional().isString()], handleValidationErrors, createSpeakerProfile);
router.get('/:id', [param('id').isMongoId()], handleValidationErrors, getSpeakerProfileById);
router.patch('/:id', [param('id').isMongoId()], handleValidationErrors, updateSpeakerProfile);

module.exports = router;
