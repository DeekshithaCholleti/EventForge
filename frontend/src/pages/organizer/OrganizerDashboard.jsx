import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventAPI, analyticsAPI, organizationAPI } from '../../api';
import { StatCard, LoadingSpinner, EmptyState } from '../../components/UI';
import { Calendar, Users, CheckCircle, BarChart2, PlusCircle, Layers, Edit, XCircle, Building2 } from 'lucide-react';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalEvents: 0, publishedEvents: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ name: '', description: '', eventType: 'CONFERENCE', organization: '', startDate: '', endDate: '', registrationStart: '', registrationEnd: '', capacity: 100 });
  const [organizations, setOrganizations] = useState([]);
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [evRes, orgRes] = await Promise.all([
        eventAPI.getAll({ limit: 50, myEvents: true, includePast: true }),
        organizationAPI.getAll(),
      ]);
      const allEvents = evRes.data?.events || [];
      setEvents(allEvents);
      setStats({
        totalEvents: allEvents.length,
        publishedEvents: allEvents.filter(e => e.status === 'PUBLISHED' || e.status === 'ONGOING').length,
      });
      setOrganizations(orgRes.data?.organizations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toLocalDatetime = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getIsoString = (localStr) => {
    if (!localStr) return null;
    return new Date(localStr).toISOString();
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      if (!newEvent.organization) { setCreateError('Please select an organization for this event.'); setCreateLoading(false); return; }
      
      const payload = {
        ...newEvent,
        startDate: getIsoString(newEvent.startDate),
        endDate: getIsoString(newEvent.endDate),
        registrationStart: getIsoString(newEvent.registrationStart),
        registrationEnd: getIsoString(newEvent.registrationEnd),
      };

      await eventAPI.create(payload);
      setShowCreateModal(false);
      setNewEvent({ name: '', description: '', eventType: 'CONFERENCE', organization: '', startDate: '', endDate: '', registrationStart: '', registrationEnd: '', capacity: 100 });
      fetchDashboard();
    } catch (err) {
      setCreateError(typeof err === 'string' ? err : (err.message || 'Failed to create event. Check all fields.'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handlePublish = async (eventId) => {
    try {
      await eventAPI.update(eventId, { status: 'PUBLISHED' });
      fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to publish event');
    }
  };

  const openEditModal = (event) => {
    setEditingEvent({
      ...event,
      startDate: toLocalDatetime(event.startDate),
      endDate: toLocalDatetime(event.endDate),
      registrationStart: toLocalDatetime(event.registrationStart),
      registrationEnd: toLocalDatetime(event.registrationEnd),
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    try {
      await eventAPI.update(editingEvent._id, {
        name: editingEvent.name,
        description: editingEvent.description,
        eventType: editingEvent.eventType,
        startDate: getIsoString(editingEvent.startDate),
        endDate: getIsoString(editingEvent.endDate),
        registrationStart: getIsoString(editingEvent.registrationStart),
        registrationEnd: getIsoString(editingEvent.registrationEnd),
        capacity: editingEvent.capacity,
      });
      setShowEditModal(false);
      setEditingEvent(null);
      fetchDashboard();
      setActionMsg('✓ Event updated successfully');
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      setEditError(typeof err === 'string' ? err : (err.message || 'Failed to update event'));
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEvent = async (event) => {
    if (!window.confirm(`Are you sure you want to cancel "${event.name}"? This action will prevent new registrations. Existing registrations will be preserved.`)) return;
    try {
      await eventAPI.delete(event._id);
      fetchDashboard();
      setActionMsg('✓ Event cancelled successfully');
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to cancel event');
    }
  };

  if (loading) return <LoadingSpinner />;

  const statusColor = (s) => ({ PUBLISHED: '#7AB2D3', ONGOING: '#B9E5E8', DRAFT: '#a47742', COMPLETED: '#7AB2D3', CANCELLED: '#a6535b' }[s] || '#5f7488');
  const inputStyle = { width: '100%', boxSizing: 'border-box' };

  return (
    <div>
      {actionMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{actionMsg}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Organizer Dashboard</h1>
          <p style={{ color: '#64748b' }}>Welcome back, {user?.name}</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <PlusCircle size={18} /> New Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard label="Total Events" value={stats.totalEvents} icon={Calendar} color="#7AB2D3" />
        <StatCard label="Active/Published" value={stats.publishedEvents} icon={CheckCircle} color="#B9E5E8" />
        <StatCard label="Organizations" value={organizations.length} icon={Users} color="#7AB2D3" />
        <StatCard label="Role" value="Organizer" icon={Layers} color="#B9E5E8" sub="Event-scoped access" />
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>Your Organizations</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Organizations you can create events for.</p>
          </div>
          <Building2 size={24} style={{ color: '#7AB2D3' }} />
        </div>
        {organizations.length === 0 ? (
          <p style={{ color: '#64748b' }}>You are not assigned to an organization yet. Ask a platform admin to add you.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {organizations.map(organization => (
              <div key={organization._id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.9rem 1rem', background: '#f8fafc' }}>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>{organization.name}</div>
                {organization.description && <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.25rem' }}>{organization.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { to: '/organizer/sessions', label: '📅 Manage Sessions', color: '#4f46e5' },
          { to: '/organizer/ticket-types', label: '🎟 Ticket Types', color: '#10b981' },
          { to: '/organizer/coupons', label: '🏷 Coupons', color: '#f59e0b' },
          { to: '/organizer/announcements', label: '📢 Announcements', color: '#0ea5e9' },
          { to: '/organizer/analytics', label: '📊 Analytics', color: '#8b5cf6' },
          { to: '/organizer/ai-assistant', label: '✨ AI Assistant', color: '#ec4899' },
        ].map(({ to, label, color }) => (
          <Link key={to} to={to} className="btn btn-secondary" style={{ borderColor: color, color, fontWeight: 600 }}>{label}</Link>
        ))}
      </div>

      {/* Events table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Your Events</h2>
      </div>

      {events.length === 0 ? (
        <EmptyState title="No events yet" description="Create your first event to get started." icon={Calendar} />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id}>
                  <td style={{ fontWeight: 600 }}>{event.name}</td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{event.eventType?.replace(/_/g, ' ')}</td>
                  <td>
                    <span style={{ background: statusColor(event.status) + '18', color: statusColor(event.status), padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {event.status}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(event.startDate).toLocaleDateString()}</td>
                  <td>{event.capacity}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <Link to={`/events/${event._id}`} className="btn btn-secondary btn-sm">View</Link>
                      {event.status === 'DRAFT' && (
                        <button onClick={() => handlePublish(event._id)} className="btn btn-success btn-sm">Publish</button>
                      )}
                      {!['CANCELLED', 'COMPLETED'].includes(event.status) && (
                        <button onClick={() => openEditModal(event)} className="btn btn-secondary btn-sm" style={{ color: '#4f46e5' }} title="Edit Event">
                          <Edit size={14} />
                        </button>
                      )}
                      {!['CANCELLED', 'COMPLETED'].includes(event.status) && (
                        <button onClick={() => handleCancelEvent(event)} className="btn btn-danger btn-sm" title="Cancel Event">
                          <XCircle size={14} />
                        </button>
                      )}
                      <Link to={`/organizer/analytics?event=${event._id}`} className="btn btn-secondary btn-sm" style={{ color: '#8b5cf6' }}>
                        <BarChart2 size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.25rem' }}>Create New Event</h3>
            {createError && (
              <div className="alert alert-danger">
                <strong>{createError}</strong>
              </div>
            )}
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label>Organization *</label>
                <select className="form-control" value={newEvent.organization} onChange={e => setNewEvent({ ...newEvent, organization: e.target.value })} required>
                  <option value="">Select an organization</option>
                  {organizations.map(organization => <option key={organization._id} value={organization._id}>{organization.name}</option>)}
                </select>
                {organizations.length === 0 && <small style={{ color: '#dc2626' }}>You must belong to an organization before creating an event.</small>}
              </div>
              <div className="form-group">
                <label>Event Name *</label>
                <input className="form-control" style={inputStyle} value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} placeholder="e.g. AI Summit 2026" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Event overview..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Event Type</label>
                  <select className="form-control" value={newEvent.eventType} onChange={e => setNewEvent({ ...newEvent, eventType: e.target.value })}>
                    {['CONFERENCE', 'WORKSHOP', 'SEMINAR', 'EXHIBITION', 'CORPORATE_MEETING', 'WEBINAR'].map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input type="number" className="form-control" value={newEvent.capacity} onChange={e => setNewEvent({ ...newEvent, capacity: Number(e.target.value) })} min={1} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Date *</label>
                  <input type="datetime-local" className="form-control" value={newEvent.startDate} onChange={e => setNewEvent({ ...newEvent, startDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input type="datetime-local" className="form-control" value={newEvent.endDate} onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Registration Start *</label>
                  <input type="datetime-local" className="form-control" value={newEvent.registrationStart} onChange={e => setNewEvent({ ...newEvent, registrationStart: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Registration End *</label>
                  <input type="datetime-local" className="form-control" value={newEvent.registrationEnd} onChange={e => setNewEvent({ ...newEvent, registrationEnd: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createLoading}>
                  {createLoading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editingEvent && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.25rem' }}>Edit Event</h3>
            {editError && <div className="alert alert-danger"><strong>{editError}</strong></div>}
            <form onSubmit={handleEditSave}>
              <div className="form-group">
                <label>Event Name *</label>
                <input className="form-control" style={inputStyle} value={editingEvent.name} onChange={e => setEditingEvent({ ...editingEvent, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} value={editingEvent.description} onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Event Type</label>
                  <select className="form-control" value={editingEvent.eventType} onChange={e => setEditingEvent({ ...editingEvent, eventType: e.target.value })}>
                    {['CONFERENCE', 'WORKSHOP', 'SEMINAR', 'EXHIBITION', 'CORPORATE_MEETING', 'WEBINAR'].map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input type="number" className="form-control" value={editingEvent.capacity} onChange={e => setEditingEvent({ ...editingEvent, capacity: Number(e.target.value) })} min={1} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Date *</label>
                  <input type="datetime-local" className="form-control" value={editingEvent.startDate} onChange={e => setEditingEvent({ ...editingEvent, startDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input type="datetime-local" className="form-control" value={editingEvent.endDate} onChange={e => setEditingEvent({ ...editingEvent, endDate: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Registration Start *</label>
                  <input type="datetime-local" className="form-control" value={editingEvent.registrationStart} onChange={e => setEditingEvent({ ...editingEvent, registrationStart: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Registration End *</label>
                  <input type="datetime-local" className="form-control" value={editingEvent.registrationEnd} onChange={e => setEditingEvent({ ...editingEvent, registrationEnd: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
