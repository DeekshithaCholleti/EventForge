const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    maxUses: { type: Number, min: 1, default: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    minimumAmount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.index({ event: 1, code: 1 }, { unique: true });

couponSchema.pre('validate', function (next) {
  if (this.discountType === 'PERCENTAGE' && (this.discountValue < 0 || this.discountValue > 100)) {
    this.invalidate('discountValue', 'Percentage discount value must be between 0 and 100');
  }

  if (this.validFrom && this.validUntil && this.validFrom > this.validUntil) {
    this.invalidate('validUntil', 'Coupon validUntil must be after validFrom');
  }

  next();
});

module.exports = mongoose.model('Coupon', couponSchema);
