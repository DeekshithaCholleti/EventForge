import React, { useState, useEffect } from 'react';
import { announcementAPI, eventAPI } from '../../api';
import { LoadingSpinner, EmptyState } from '../../components/UI';
import { Megaphone, PlusCircle, Trash2 } from 'lucide-react';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');
  // Use 'message' to match Announcement schema
  const [formData, setFormData] = useState({ event: '', title: '', message: '', targetAudience: 'ALL' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, eRes] = await Promise.all([
        announcementAPI.getAll(),
        eventAPI.getAll({ limit: 50, myEvents: true, includePast: true })
      ]);
      setAnnouncements(aRes.data?.items || []);
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
      await announcementAPI.create(formData);
      setShowModal(false);
      setFormData({ event: '', title: '', message: '', targetAudience: 'ALL' });
      fetchData();
      setActionMsg('✓ Announcement posted successfully');
      setTimeout(() => setActionMsg(''), 5000);
    } catch (err) {
      setActionError(err.message || 'Failed to post announcement');
      setTimeout(() => setActionError(''), 6000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementAPI.delete(id);
      fetchData();
      setActionMsg('✓ Announcement deleted');
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to delete announcement');
      setTimeout(() => setActionError(''), 6000);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {actionMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{actionMsg}</div>}
      {actionError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{actionError}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1>Announcements</h1>
          <p style={{ color: '#64748b' }}>Broadcast updates and changes to your attendees</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <PlusCircle size={18} /> New Announcement
        </button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState title="No Announcements" description="Create an announcement to keep attendees informed." icon={Megaphone} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {announcements.map(a => (
            <div key={a._id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, marginRight: '0.5rem' }}>
                    {a.targetAudience || 'ALL'}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{a.title}</span>
                </div>
                <button onClick={() => handleDelete(a._id)} className="btn btn-danger btn-sm"><Trash2 size={14}/></button>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                {a.message || a.content}
              </p>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Posted on {new Date(a.createdAt).toLocaleString()} for <strong>{a.event?.name || 'Unknown event'}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Create Announcement</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Event</label>
                <select className="form-control" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} required>
                  <option value="">— Select Event —</option>
                  {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Keynote Time Changed" required />
              </div>
              <div className="form-group">
                <label>Target Audience</label>
                <select className="form-control" value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})}>
                  <option value="ALL">All</option>
                  <option value="ATTENDEES">Attendees</option>
                  <option value="SPEAKERS">Speakers</option>
                  <option value="STAFF">Staff</option>
                  <option value="SPONSORS">Sponsors</option>
                </select>
              </div>
              <div className="form-group">
                <label>Message Content</label>
                <textarea className="form-control" rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Write your announcement message here..." required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Post Announcement</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AnnouncementsPage;
