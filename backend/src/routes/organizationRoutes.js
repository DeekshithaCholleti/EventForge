const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../validators/commonValidators');
const { listOrganizations, createOrganization, getOrganizationById, updateOrganization, deleteOrganization, addOrganizer, listOrganizationMembers } = require('../controllers/organizationController');

const router = express.Router();

router.use(verifyToken);
router.get('/', listOrganizations);
router.post(
  '/',
  [
    authorizeRole('PLATFORM_ADMIN'),
    body('name').trim().isLength({ min: 2 }).withMessage('Organization name is required'),
    body('description').optional().isString(),
  ],
  handleValidationErrors,
  createOrganization
);
router.get('/:id/members', [param('id').isMongoId().withMessage('Invalid organization id'), authorizeRole('PLATFORM_ADMIN')], handleValidationErrors, listOrganizationMembers);
router.post('/:id/members', [param('id').isMongoId().withMessage('Invalid organization id'), authorizeRole('PLATFORM_ADMIN'), body('user').isMongoId().withMessage('Organizer user is required'), body('role').optional().isIn(['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'])], handleValidationErrors, addOrganizer);
router.get('/:id', [param('id').isMongoId().withMessage('Invalid organization id')], handleValidationErrors, getOrganizationById);
router.patch('/:id', [param('id').isMongoId().withMessage('Invalid organization id')], handleValidationErrors, updateOrganization);
router.delete('/:id', [param('id').isMongoId().withMessage('Invalid organization id')], handleValidationErrors, deleteOrganization);

module.exports = router;
