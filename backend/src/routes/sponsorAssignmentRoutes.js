const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listAssignments, createAssignment, getAssignmentById, updateAssignment } = require('../controllers/sponsorAssignmentController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listAssignments);
router.post('/', [body('event').isMongoId(), body('sponsor').isMongoId(), body('sponsorshipPackage').isMongoId()], handleValidationErrors, createAssignment);
router.get('/:id', [param('id').isMongoId()], handleValidationErrors, getAssignmentById);
router.patch('/:id', [param('id').isMongoId()], handleValidationErrors, updateAssignment);
module.exports = router;
