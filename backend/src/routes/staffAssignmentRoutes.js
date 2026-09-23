const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listStaffAssignments, createStaffAssignment, updateStaffAssignment, deleteStaffAssignment } = require('../controllers/staffAssignmentController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listStaffAssignments);
router.post('/', [body('event').isMongoId(), body('staff').isMongoId(), body('responsibility').isIn(['CHECK_IN', 'SESSION_SUPPORT', 'VENUE_OPERATION', 'ATTENDEE_SUPPORT'])], handleValidationErrors, createStaffAssignment);
router.patch('/:id', [param('id').isMongoId()], handleValidationErrors, updateStaffAssignment);
router.delete('/:id', [param('id').isMongoId()], handleValidationErrors, deleteStaffAssignment);
module.exports = router;

