const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { getEventAnalytics, getSessionAnalytics, getSponsorAnalytics } = require('../controllers/analyticsController');

const router = express.Router();
router.use(verifyToken);
router.get('/event/:eventId', getEventAnalytics);
router.get('/session/:eventId', getSessionAnalytics);
router.get('/sponsor/:eventId', getSponsorAnalytics);
module.exports = router;
