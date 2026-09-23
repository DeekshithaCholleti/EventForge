const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listTicketTypes, createTicketType, getTicketTypeById, updateTicketType, deleteTicketType } = require('../controllers/ticketTypeController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listTicketTypes);
router.post('/', [body('event').isMongoId(), body('name').trim().notEmpty(), body('price').isNumeric(), body('capacity').isInt({ min: 1 })], handleValidationErrors, createTicketType);
router.get('/:id', [param('id').isMongoId()], handleValidationErrors, getTicketTypeById);
router.patch('/:id', [param('id').isMongoId()], handleValidationErrors, updateTicketType);
router.delete('/:id', [param('id').isMongoId()], handleValidationErrors, deleteTicketType);
module.exports = router;

