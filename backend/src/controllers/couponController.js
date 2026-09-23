const Coupon = require('../models/Coupon');
const { sendSuccess } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

const listCoupons = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    const coupons = await Coupon.find(filter).populate('event');
    return sendSuccess(res, 'Coupons fetched', { items: coupons }, 200);
  } catch (error) { next(error); }
};

const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create({ ...req.body, code: String(req.body.code || '').toUpperCase() });
    return sendSuccess(res, 'Coupon created successfully', { coupon }, 201);
  } catch (error) { next(error); }
};

const getCouponById = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate('event');
    if (!coupon) throw new NotFoundError('Coupon not found');
    return sendSuccess(res, 'Coupon fetched', { coupon }, 200);
  } catch (error) { next(error); }
};

const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) throw new NotFoundError('Coupon not found');
    return sendSuccess(res, 'Coupon updated successfully', { coupon }, 200);
  } catch (error) { next(error); }
};

module.exports = { listCoupons, createCoupon, getCouponById, updateCoupon };
