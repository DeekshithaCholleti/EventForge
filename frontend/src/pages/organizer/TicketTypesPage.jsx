import React, { useState, useEffect } from 'react';
import { ticketTypeAPI, eventAPI } from '../../api';
import { LoadingSpinner, EmptyState } from '../../components/UI';
import { Tag, PlusCircle, Trash2, Archive } from 'lucide-react';

const TicketTypesPage = () => {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');
  const [formData, setFormData] = useState({ event: '', name: '', description: '', price: 0, capacity: 100, salesStart: '', salesEnd: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ttRes, eRes] = await Promise.all([
        ticketTypeAPI.getAll(),
        eventAPI.getAll({ limit: 50, myEvents: true, includePast: true })
      ]);
      setTicketTypes(ttRes.data?.items || []);
      setEvents(eRes.data?.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const payload = {
        ...formData,
        salesStart: formData.salesStart ? new Date(formData.salesStart).toISOString() : null,
        salesEnd: formData.salesEnd ? new Date(formData.salesEnd).toISOString() : null
      };
      await ticketTypeAPI.create(payload);
      setShowModal(false);
      setFormData({ event: '', name: '', description: '', price: 0, capacity: 100, salesStart: '', salesEnd: '' });
      fetchData();
      setActionMsg('✓ Ticket type created successfully');
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to create ticket type');
    }
  };

  const handleDelete = async (tt) => {
    if (!window.confirm(`Delete ticket type "${tt.name}"?`)) return;
    setActionError('');
    try {
      const res = await ticketTypeAPI.delete(tt._id);
      fetchData();
      // Backend returns archived: true when it soft-deletes due to registrations
      if (res.data?.archived) {
        setActionMsg(`ℹ️ ${res.message || 'Ticket type archived because it has active registrations.'}`);
      } else {
        setActionMsg('✓ Ticket type deleted successfully');
      }
      setTimeout(() => setActionMsg(''), 6000);
    } catch (err) {
      setActionError(err.message || 'Failed to delete ticket type');
      setTimeout(() => setActionError(''), 6000);
    }
  };

  const statusBadge = (status) => {
    const colors = { ACTIVE: '#10b981', DRAFT: '#f59e0b', ARCHIVED: '#94a3b8' };
    return (
      <span style={{ background: (colors[status] || '#94a3b8') + '18', color: colors[status] || '#94a3b8', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700 }}>
        {status}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {actionMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{actionMsg}</div>}
      {actionError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{actionError}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1>Ticket Types</h1>
          <p style={{ color: '#64748b' }}>Manage pricing and capacity for event tickets</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <PlusCircle size={18} /> New Ticket Type
        </button>
      </div>

      {ticketTypes.length === 0 ? (
        <EmptyState title="No Ticket Types" description="Create your first ticket type to start selling." icon={Tag} />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Event</th>
                <th>Price</th>
                <th>Capacity</th>
                <th>Sold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ticketTypes.map(tt => (
                <tr key={tt._id} style={{ opacity: tt.status === 'ARCHIVED' ? 0.6 : 1 }}>
                  <td style={{ fontWeight: 600 }}>{tt.name}</td>
                  <td style={{ color: '#64748b' }}>{tt.event?.name}</td>
                  <td style={{ fontWeight: 600, color: '#10b981' }}>${tt.price}</td>
                  <td>{tt.capacity}</td>
                  <td>{tt.soldCount}</td>
                  <td>{statusBadge(tt.status)}</td>
                  <td>
                    {tt.status !== 'ARCHIVED' ? (
                      <button
                        onClick={() => handleDelete(tt)}
                        className="btn btn-danger btn-sm"
                        title={tt.soldCount > 0 ? 'Has registrations — will archive instead of delete' : 'Delete ticket type'}
                      >
                        {tt.soldCount > 0 ? <Archive size={14} /> : <Trash2 size={14} />}
                        <span style={{ marginLeft: '4px', fontSize: '0.75rem' }}>
                          {tt.soldCount > 0 ? 'Archive' : 'Delete'}
                        </span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Archived</span>
                    )}
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
            <h3>Create Ticket Type</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Event</label>
                <select className="form-control" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} required>
                  <option value="">— Select Event —</option>
                  {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Early Bird" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input type="number" className="form-control" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} min={0} required />
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input type="number" className="form-control" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} min={1} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Sales Start *</label>
                  <input type="datetime-local" className="form-control" value={formData.salesStart} onChange={e => setFormData({...formData, salesStart: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Sales End *</label>
                  <input type="datetime-local" className="form-control" value={formData.salesEnd} onChange={e => setFormData({...formData, salesEnd: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Ticket Type</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TicketTypesPage;
