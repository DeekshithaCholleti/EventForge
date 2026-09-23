const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listTickets, createTicket, getTicketById } = require('../controllers/ticketController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listTickets);
router.post('/', [body('registration').isMongoId(), body('event').isMongoId(), body('attendee').isMongoId(), body('ticketType').isMongoId()], handleValidationErrors, createTicket);
router.get('/:id', [param('id').isMongoId()], handleValidationErrors, getTicketById);
module.exports = router;
