import React, { useState, useEffect } from 'react';
import { sessionAPI, eventAPI, roomAPI } from '../../api';
import { LoadingSpinner, EmptyState, Alert } from '../../components/UI';
import { Clock, AlertTriangle, PlusCircle, Trash2, Edit } from 'lucide-react';

const SessionsManager = () => {
  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ event: '', title: '', description: '', sessionType: 'PRESENTATION', tags: '', room: '', startTime: '', endTime: '', capacity: 50 });
  const [error, setError] = useState('');
  const [conflictMsg, setConflictMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, eRes] = await Promise.all([
        sessionAPI.getAll(),
        eventAPI.getAll({ limit: 50, myEvents: true, includePast: true }),
      ]);
      setSessions(sRes.data?.sessions || []);
      setEvents(eRes.data?.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setConflictMsg('');
    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
      };
      await sessionAPI.create(payload);
      setShowModal(false);
      setFormData({ event: '', title: '', description: '', sessionType: 'PRESENTATION', tags: '', room: '', startTime: '', endTime: '', capacity: 50 });
      fetchData();
    } catch (err) {
      if (err.status === 409) {
        setConflictMsg(err.message);
      } else {
        setError(typeof err === 'string' ? err : err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await sessionAPI.delete(id);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>Sessions Manager</h1>
          <p style={{ color: '#64748b' }}>Create and manage event sessions. Room & speaker conflicts are auto-detected.</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(''); setConflictMsg(''); }} className="btn btn-primary">
          <PlusCircle size={18} /> New Session
        </button>
      </div>

      {sessions.length === 0 ? (
        <EmptyState title="No sessions yet" description="Create your first session for an event." icon={Clock} />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Event</th>
                <th>Room</th>
                <th>Time</th>
                <th>Type</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 600 }}>{s.title}</td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{s.event?.name || '—'}</td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{s.room || '—'}</td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{s.sessionType || '—'}</td>
                  <td style={{ fontSize: '0.78rem' }}>
                    {(s.tags || []).map(t => (
                      <span key={t} style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.4rem', borderRadius: '9999px', marginRight: '0.25rem' }}>{t}</span>
                    ))}
                  </td>
                  <td>
                    <button onClick={() => handleDelete(s._id)} className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.25rem' }}>Create New Session</h3>

            {conflictMsg && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                <AlertTriangle size={18} /> <strong>Conflict Detected:</strong> {conflictMsg}
              </div>
            )}
            {error && (
              <div className="alert alert-danger" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem', marginBottom: '1rem' }}>
                <strong>{typeof error === 'string' ? error : (error.message || 'Validation failed')}</strong>
                {error.errors && error.errors.length > 0 && (
                  <ul style={{ margin: '0 0 0 1.25rem', padding: 0, fontSize: '0.85rem' }}>
                    {error.errors.map((e, i) => <li key={i}>{e.field ? `${e.field}: ${e.message}` : e.message}</li>)}
                  </ul>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Event *</label>
                <select className="form-control" value={formData.event} onChange={e => setFormData({ ...formData, event: e.target.value })} required>
                  <option value="">— Select Event —</option>
                  {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Session Title *</label>
                <input className="form-control" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Keynote: The Future of AI" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Session Type</label>
                  <select className="form-control" value={formData.sessionType} onChange={e => setFormData({ ...formData, sessionType: e.target.value })}>
                    {['KEYNOTE', 'PRESENTATION', 'WORKSHOP', 'PANEL', 'NETWORKING', 'BREAK'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Room Name</label>
                  <input type="text" className="form-control" value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} placeholder="e.g. Conference Hall A" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Time *</label>
                  <input type="datetime-local" className="form-control" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <input type="datetime-local" className="form-control" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input className="form-control" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} placeholder="AI, Machine Learning, Cloud" />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input type="number" className="form-control" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} min={1} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Session'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsManager;
