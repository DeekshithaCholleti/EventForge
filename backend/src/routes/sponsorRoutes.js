const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listSponsors, createSponsor, getSponsorById, updateSponsor, deleteSponsor, getMySponsorships } = require('../controllers/sponsorController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/my-sponsorships', getMySponsorships);
router.get('/', listSponsors);
router.post('/', [body('event').isMongoId(), body('companyName').trim().notEmpty()], handleValidationErrors, createSponsor);
router.get('/:id', [param('id').isMongoId()], handleValidationErrors, getSponsorById);
router.patch('/:id', [param('id').isMongoId()], handleValidationErrors, updateSponsor);
router.delete('/:id', [param('id').isMongoId()], handleValidationErrors, deleteSponsor);
module.exports = router;

