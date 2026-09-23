import React, { useState, useEffect } from 'react';
import { couponAPI, eventAPI } from '../../api';
import { LoadingSpinner, EmptyState } from '../../components/UI';
import { Tag, PlusCircle, Trash2 } from 'lucide-react';

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ event: '', code: '', discountType: 'PERCENTAGE', discountValue: 0, validFrom: '', validUntil: '', maxUses: 100 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, eRes] = await Promise.all([
        couponAPI.getAll(),
        eventAPI.getAll({ limit: 50, myEvents: true, includePast: true })
      ]);
      setCoupons(cRes.data?.items || []);
      setEvents(eRes.data?.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null
      };
      await couponAPI.create(payload);
      setShowModal(false);
      setFormData({ event: '', code: '', discountType: 'PERCENTAGE', discountValue: 0, validUntil: '', maxUses: 100 });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1>Coupons & Discounts</h1>
          <p style={{ color: '#64748b' }}>Manage promotional codes for your events</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <PlusCircle size={18} /> New Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <EmptyState title="No Coupons" description="Create a discount code to boost sales." icon={Tag} />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Event</th>
                <th>Discount</th>
                <th>Uses</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 700 }}>{c.code}</td>
                  <td style={{ color: '#64748b' }}>{c.event?.name}</td>
                  <td style={{ fontWeight: 600, color: '#10b981' }}>
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `$${c.discountValue}`}
                  </td>
                  <td>{c.usedCount} / {c.maxUses}</td>
                  <td>{c.validUntil ? new Date(c.validUntil).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <button onClick={() => couponAPI.delete(c._id).then(fetchData)} className="btn btn-danger btn-sm"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Create Coupon</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Event</label>
                <select className="form-control" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} required>
                  <option value="">— Select Event —</option>
                  {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Code</label>
                <input className="form-control" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. SAVE20" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-control" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value</label>
                  <input type="number" className="form-control" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} min={1} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Valid From *</label>
                  <input type="datetime-local" className="form-control" value={formData.validFrom} onChange={e => setFormData({...formData, validFrom: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Valid Until *</label>
                  <input type="datetime-local" className="form-control" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Coupon</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CouponsPage;
