const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listRegistrations, createRegistration, getRegistrationById, updateRegistration } = require('../controllers/registrationController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listRegistrations);
router.post('/', [
  body('event').isMongoId(),
  body('ticketType').isMongoId(),
], handleValidationErrors, createRegistration);
router.get('/:id', [param('id').isMongoId()], handleValidationErrors, getRegistrationById);
router.patch('/:id', [param('id').isMongoId()], handleValidationErrors, updateRegistration);
module.exports = router;
