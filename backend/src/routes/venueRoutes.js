const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listVenues, createVenue, getVenueById, updateVenue, deleteVenue } = require('../controllers/venueController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listVenues);
router.post('/', [body('organization').isMongoId(), body('name').trim().notEmpty(), body('address').trim().notEmpty(), body('city').trim().notEmpty(), body('country').trim().notEmpty()], handleValidationErrors, createVenue);
router.get('/:id', [param('id').isMongoId()], handleValidationErrors, getVenueById);
router.patch('/:id', [param('id').isMongoId()], handleValidationErrors, updateVenue);
router.delete('/:id', [param('id').isMongoId()], handleValidationErrors, deleteVenue);
module.exports = router;
