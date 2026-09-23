const express = require('express');
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listFeedback, createFeedback } = require('../controllers/feedbackController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listFeedback);
router.post('/', [body('event').isMongoId(), body('session').isMongoId(), body('rating').isInt({ min: 1, max: 5 }), body('comment').optional().trim()], handleValidationErrors, createFeedback);
module.exports = router;
