const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { generateEventDescription, generateSpeakerBio, generateAnnouncement, generateSessionSummary } = require('../controllers/aiController');

const router = express.Router();
router.use(verifyToken);
router.post('/event-description', generateEventDescription);
router.post('/speaker-bio', generateSpeakerBio);
router.post('/announcement', generateAnnouncement);
router.post('/session-summary', generateSessionSummary);
module.exports = router;
