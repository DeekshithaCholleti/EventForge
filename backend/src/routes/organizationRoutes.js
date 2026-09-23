const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../validators/commonValidators');
const { listOrganizations, createOrganization, getOrganizationById, updateOrganization, deleteOrganization } = require('../controllers/organizationController');

const router = express.Router();

router.use(verifyToken);
router.get('/', listOrganizations);
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Organization name is required'),
    body('description').optional().isString(),
  ],
  handleValidationErrors,
  createOrganization
);
router.get('/:id', [param('id').isMongoId().withMessage('Invalid organization id')], handleValidationErrors, getOrganizationById);
router.patch('/:id', [param('id').isMongoId().withMessage('Invalid organization id')], handleValidationErrors, updateOrganization);
router.delete('/:id', [param('id').isMongoId().withMessage('Invalid organization id')], handleValidationErrors, deleteOrganization);

module.exports = router;
