const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listPackages, createPackage, getPackageById, updatePackage } = require('../controllers/sponsorshipPackageController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listPackages);
router.post('/', [body('event').isMongoId(), body('name').trim().notEmpty(), body('price').isNumeric()], handleValidationErrors, createPackage);
router.get('/:id', [param('id').isMongoId()], handleValidationErrors, getPackageById);
router.patch('/:id', [param('id').isMongoId()], handleValidationErrors, updatePackage);
module.exports = router;
