const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const { listCoupons, createCoupon, getCouponById, updateCoupon } = require('../controllers/couponController');
const { handleValidationErrors } = require('../validators/commonValidators');

const router = express.Router();
router.use(verifyToken);
router.get('/', listCoupons);
router.post('/', [
  body('event').isMongoId(),
  body('code').trim().notEmpty(),
  body('discountType').isIn(['PERCENTAGE', 'FIXED']),
  body('discountValue').isFloat({ min: 0 }),
], handleValidationErrors, createCoupon);
router.get('/:id', [param('id').isMongoId()], handleValidationErrors, getCouponById);
router.patch('/:id', [param('id').isMongoId()], handleValidationErrors, updateCoupon);
module.exports = router;
