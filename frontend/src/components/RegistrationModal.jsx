import React, { useState, useEffect } from 'react';
import { registrationAPI, ticketTypeAPI } from '../api';
import { Tag, CheckCircle, AlertCircle, X, ShieldCheck } from 'lucide-react';

export const RegistrationModal = ({ event, ticketTypes = [], coupons = [], onClose, onSuccess }) => {
  const [selectedTicket, setSelectedTicket] = useState(ticketTypes[0]?._id || '');
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponSuccess, setCouponSuccess] = useState('');

  useEffect(() => {
    if (ticketTypes.length > 0) {
      const isValid = ticketTypes.some(t => t._id === selectedTicket);
      if (!isValid) {
        setSelectedTicket(ticketTypes[0]._id);
        setAppliedDiscount(0);
        setCouponSuccess('');
      }
    }
  }, [ticketTypes, selectedTicket]);

  const currentTicketDoc = ticketTypes.find((t) => t._id === selectedTicket);
  const originalPrice = currentTicketDoc ? currentTicketDoc.price : 0;

  const handleApplyCoupon = () => {
    setError('');
    setCouponSuccess('');
    if (!couponCode.trim()) return;

    const matchedCoupon = coupons.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (!matchedCoupon) {
      setError('Invalid coupon code for this event');
      setAppliedDiscount(0);
      return;
    }

    if (!matchedCoupon.isActive) {
      setError('This coupon is currently inactive');
      setAppliedDiscount(0);
      return;
    }

    let discount = 0;
    if (matchedCoupon.discountType === 'PERCENTAGE') {
      discount = (originalPrice * matchedCoupon.discountValue) / 100;
    } else {
      discount = matchedCoupon.discountValue;
    }
    if (discount > originalPrice) discount = originalPrice;

    setAppliedDiscount(discount);
    setCouponSuccess(`Applied code ${matchedCoupon.code} (-$${discount})`);
  };

  const finalPrice = Math.max(0, originalPrice - appliedDiscount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await registrationAPI.create({
        event: event._id,
        ticketType: selectedTicket,
        coupon: couponCode || undefined,
      });

      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3>Register for {event.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="alert alert-danger"><AlertCircle size={18} /> {error}</div>}
        {couponSuccess && <div className="alert alert-success"><CheckCircle size={18} /> {couponSuccess}</div>}

        {ticketTypes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
            <Tag size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <h4 style={{ marginBottom: '0.5rem', color: '#334155' }}>No Tickets Available</h4>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>There are currently no ticket tiers created for this event. Please check back later or contact the organizer.</p>
            <button type="button" onClick={onClose} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Ticket Tier</label>
            <select
              className="form-control"
              value={selectedTicket}
              onChange={(e) => {
                setSelectedTicket(e.target.value);
                setAppliedDiscount(0);
                setCouponSuccess('');
              }}
              required
            >
              {ticketTypes.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} – ${t.price} ({t.capacity - t.soldCount > 0 ? `${t.capacity - t.soldCount} left` : 'Waitlist'})
                </option>
              ))}
            </select>
          </div>

          {/* Coupon Input */}
          <div className="form-group">
            <label>Promo / Coupon Code</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. SAVE20, EARLY10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <button type="button" onClick={handleApplyCoupon} className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                <Tag size={16} /> Apply
              </button>
            </div>
          </div>

          {/* Summary Box */}
          <div style={{ background: '#f5faf9', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #d6e5e5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
              <span>Ticket Price:</span>
              <span>${originalPrice}</span>
            </div>
            {appliedDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#10b981', fontSize: '0.9rem' }}>
                <span>Discount Applied:</span>
                <span>-${appliedDiscount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', paddingTop: '0.5rem', borderTop: '1px solid #cbd5e1' }}>
              <span>Total Amount:</span>
              <span style={{ color: '#4A628A' }}>${finalPrice}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className={`btn btn-primary registration-submit ${loading ? 'is-loading' : ''}`} disabled={loading}>
              <ShieldCheck size={18} /> {loading ? 'Sending...' : 'Confirm Registration'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
