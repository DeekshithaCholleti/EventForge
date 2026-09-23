const express = require('express');
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listSessionAttendance, createSessionAttendance } = require('../controllers/sessionAttendanceController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listSessionAttendance);
router.post('/', [body('event').isMongoId(), body('session').isMongoId(), body('attendee').isMongoId()], handleValidationErrors, createSessionAttendance);
module.exports = router;
