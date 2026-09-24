import React, { useState, useEffect } from 'react';
import { eventAPI, userAPI, staffAssignmentAPI, speakerAPI, sponsorAPI, sponsorshipPackageAPI, sponsorAssignmentAPI } from '../../api';
import { LoadingSpinner } from '../../components/UI';
import { Users, UserCheck, Building2, Package, Tag, Trash2, Plus, Edit3, Save, X } from 'lucide-react';

const RESPONSIBILITIES = [
  { value: 'CHECK_IN', label: 'Check-In Desk' },
  { value: 'SESSION_SUPPORT', label: 'Session Support' },
  { value: 'VENUE_OPERATION', label: 'Venue Operations' },
  { value: 'ATTENDEE_SUPPORT', label: 'Attendee Support' },
];

const ROLE_COLORS = {
  CHECK_IN: '#7AB2D3',
  SESSION_SUPPORT: '#B9E5E8',
  VENUE_OPERATION: '#b45309',
  ATTENDEE_SUPPORT: '#7AB2D3',
};

const Badge = ({ label, color = '#64748b' }) => (
  <span style={{ background: color + '18', color, border: `1px solid ${color}40`, borderRadius: '999px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
    {label}
  </span>
);

const EventTeamPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [activeTab, setActiveTab] = useState('staff');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data
  const [staffList, setStaffList] = useState([]);
  const [speakerList, setSpeakerList] = useState([]);
  const [sponsorList, setSponsorList] = useState([]);
  const [packageList, setPackageList] = useState([]);
  const [assignmentList, setAssignmentList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Forms
  const [staffForm, setStaffForm] = useState({ staff: '', responsibility: 'CHECK_IN' });
  const [speakerForm, setSpeakerForm] = useState({ user: '', bio: '', designation: '', company: '', expertise: '' });
  const [sponsorForm, setSponsorForm] = useState({ user: '', companyName: '', description: '', contactEmail: '' });
  const [packageForm, setPackageForm] = useState({ name: '', price: '', benefits: '', capacity: 1 });
  
  // Deliverable / Assignment Management
  const [selectedAssignmentSponsor, setSelectedAssignmentSponsor] = useState(null); // sponsor ID
  const [assignmentForm, setAssignmentForm] = useState({ sponsorshipPackage: '', paymentStatus: 'PENDING' });
  const [deliverableForm, setDeliverableForm] = useState({ title: '', description: '', dueDate: '' });

  useEffect(() => {
    eventAPI.getAll({ myEvents: true, includePast: true, limit: 50 }).then(res => {
      const evs = res.data?.events || [];
      setEvents(evs);
      if (evs.length > 0) setSelectedEvent(evs[0]._id);
    }).catch(() => {});
    userAPI.getAll({ limit: 200 }).then(res => setAllUsers(res.data?.users || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedEvent) fetchTeam();
  }, [selectedEvent]);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const [sRes, spRes, sponsRes, pkgRes, asgnRes] = await Promise.all([
        staffAssignmentAPI.getAll({ event: selectedEvent }),
        speakerAPI.getAll({ event: selectedEvent }),
        sponsorAPI.getAll({ event: selectedEvent }),
        sponsorshipPackageAPI.getAll({ event: selectedEvent }),
        sponsorAssignmentAPI.getAll({ event: selectedEvent }),
      ]);
      setStaffList(sRes.data?.items || []);
      setSpeakerList(spRes.data?.profiles || []);
      setSponsorList(sponsRes.data?.sponsors || []);
      setPackageList(pkgRes.data?.items || []);
      setAssignmentList(asgnRes.data?.items || []);
    } catch (e) {
      setError('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  };

  const handleAssignStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.staff) return flash('Please select a staff user', true);
    setSaving(true);
    try {
      await staffAssignmentAPI.create({ event: selectedEvent, staff: staffForm.staff, responsibility: staffForm.responsibility });
      flash('Staff assigned successfully');
      setStaffForm({ staff: '', responsibility: 'CHECK_IN' });
      fetchTeam();
    } catch (err) {
      flash(err.message || 'Failed to assign staff', true);
    } finally { setSaving(false); }
  };

  const handleRemoveStaff = async (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    try {
      await staffAssignmentAPI.delete(id);
      flash('Staff removed');
      fetchTeam();
    } catch (err) { flash(err.message || 'Failed to remove', true); }
  };

  const handleAssignSpeaker = async (e) => {
    e.preventDefault();
    if (!speakerForm.user) return flash('Please select a speaker user', true);
    setSaving(true);
    try {
      const expertiseArr = speakerForm.expertise.split(',').map(s => s.trim()).filter(Boolean);
      await speakerAPI.assignToEvent({ event: selectedEvent, user: speakerForm.user, bio: speakerForm.bio, designation: speakerForm.designation, company: speakerForm.company, expertise: expertiseArr });
      flash('Speaker assigned successfully');
      setSpeakerForm({ user: '', bio: '', designation: '', company: '', expertise: '' });
      fetchTeam();
    } catch (err) {
      flash(err.message || 'Failed to assign speaker', true);
    } finally { setSaving(false); }
  };

  const handleRemoveSpeaker = async (userId) => {
    if (!window.confirm('Remove this speaker from the event?')) return;
    try {
      await speakerAPI.removeFromEvent({ event: selectedEvent, user: userId });
      flash('Speaker removed');
      fetchTeam();
    } catch (err) { flash(err.message || 'Failed to remove', true); }
  };

  const handleAddSponsor = async (e) => {
    e.preventDefault();
    if (!sponsorForm.companyName) return flash('Company name is required', true);
    setSaving(true);
    try {
      await sponsorAPI.create({ event: selectedEvent, user: sponsorForm.user || undefined, companyName: sponsorForm.companyName, description: sponsorForm.description, contactInformation: { email: sponsorForm.contactEmail } });
      flash('Sponsor added successfully');
      setSponsorForm({ user: '', companyName: '', description: '', contactEmail: '' });
      fetchTeam();
    } catch (err) {
      flash(err.message || 'Failed to add sponsor', true);
    } finally { setSaving(false); }
  };

  const handleRemoveSponsor = async (id) => {
    if (!window.confirm('Remove this sponsor?')) return;
    try {
      await sponsorAPI.delete(id);
      flash('Sponsor removed');
      fetchTeam();
    } catch (err) { flash(err.message || 'Failed to remove', true); }
  };

  const handleAddPackage = async (e) => {
    e.preventDefault();
    if (!packageForm.name || !packageForm.price) return flash('Name and price are required', true);
    setSaving(true);
    try {
      const benefitsArr = packageForm.benefits.split(',').map(s => s.trim()).filter(Boolean);
      await sponsorshipPackageAPI.create({ event: selectedEvent, ...packageForm, benefits: benefitsArr });
      flash('Package created successfully');
      setPackageForm({ name: '', price: '', benefits: '', capacity: 1 });
      fetchTeam();
    } catch (err) {
      flash(err.message || 'Failed to create package', true);
    } finally { setSaving(false); }
  };

  const handleManageAssignment = (sponsorId) => {
    const existing = assignmentList.find(a => typeof a.sponsor === 'object' ? a.sponsor._id === sponsorId : a.sponsor === sponsorId);
    setSelectedAssignmentSponsor(sponsorId);
    if (existing) {
      setAssignmentForm({ sponsorshipPackage: typeof existing.sponsorshipPackage === 'object' ? existing.sponsorshipPackage._id : existing.sponsorshipPackage, paymentStatus: existing.paymentStatus });
    } else {
      setAssignmentForm({ sponsorshipPackage: '', paymentStatus: 'PENDING' });
    }
  };

  const handleSaveAssignment = async () => {
    if (!assignmentForm.sponsorshipPackage) return flash('Select a package first', true);
    setSaving(true);
    try {
      const existing = assignmentList.find(a => typeof a.sponsor === 'object' ? a.sponsor._id === selectedAssignmentSponsor : a.sponsor === selectedAssignmentSponsor);
      if (existing) {
        await sponsorAssignmentAPI.update(existing._id, assignmentForm);
      } else {
        await sponsorAssignmentAPI.create({ event: selectedEvent, sponsor: selectedAssignmentSponsor, ...assignmentForm });
      }
      flash('Assignment saved');
      fetchTeam();
    } catch (err) {
      flash(err.message || 'Failed to save assignment', true);
    } finally { setSaving(false); }
  };

  const handleAddDeliverable = async () => {
    if (!deliverableForm.title) return flash('Deliverable title required', true);
    setSaving(true);
    try {
      const existing = assignmentList.find(a => typeof a.sponsor === 'object' ? a.sponsor._id === selectedAssignmentSponsor : a.sponsor === selectedAssignmentSponsor);
      if (!existing) {
        flash('Must create assignment first', true);
        return setSaving(false);
      }
      const updatedDeliverables = [...(existing.deliverables || []), { ...deliverableForm, status: 'PENDING' }];
      await sponsorAssignmentAPI.update(existing._id, { deliverables: updatedDeliverables });
      flash('Deliverable added');
      setDeliverableForm({ title: '', description: '', dueDate: '' });
      fetchTeam();
    } catch (err) {
      flash(err.message || 'Failed to add deliverable', true);
    } finally { setSaving(false); }
  };

  const handleRemoveDeliverable = async (assignmentId, deliverables, deliverableId) => {
    if (!window.confirm('Remove deliverable?')) return;
    try {
      const updated = deliverables.filter(d => d._id !== deliverableId);
      await sponsorAssignmentAPI.update(assignmentId, { deliverables: updated });
      flash('Deliverable removed');
      fetchTeam();
    } catch (err) { flash(err.message || 'Failed to remove', true); }
  };

  const cardStyle = { background: 'var(--cream)', borderRadius: '2px', border: '2px solid var(--dark)', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)' };
  const inputStyle = { width: '100%', padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' };
  const btnPrimary = { background: '#7AB2D3', color: '#1f2933', border: '2px solid var(--dark)', borderRadius: '2px', padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '4px 4px 0 var(--dark)' };
  const btnDanger = { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' };
  const tabStyle = (active) => ({ padding: '0.6rem 1.2rem', borderBottom: active ? '3px solid #7AB2D3' : '3px solid transparent', color: active ? '#1f2933' : '#5f7488', fontWeight: active ? 800 : 600, cursor: 'pointer', background: 'none', border: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' });

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
        <Users size={28} style={{ color: '#7AB2D3' }} />
        <h1 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 700 }}>Event Team Management</h1>
      </div>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Assign staff, speakers, and sponsors to your events.</p>

      {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {/* Event Selector */}
      <div style={{ ...cardStyle, padding: '1rem 1.5rem' }}>
        <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: '#374151' }}>Select Event</label>
        <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={{ ...inputStyle, maxWidth: '420px' }}>
          {events.length === 0 && <option>No events found</option>}
          {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <button style={tabStyle(activeTab === 'staff')} onClick={() => setActiveTab('staff')}><UserCheck size={16} /> Staff</button>
        <button style={tabStyle(activeTab === 'speakers')} onClick={() => setActiveTab('speakers')}><Users size={16} /> Speakers</button>
        <button style={tabStyle(activeTab === 'packages')} onClick={() => setActiveTab('packages')}><Package size={16} /> Packages</button>
        <button style={tabStyle(activeTab === 'sponsors')} onClick={() => setActiveTab('sponsors')}><Building2 size={16} /> Sponsors & Deliverables</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><LoadingSpinner /></div> : !selectedEvent ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>Select an event above.</p> : (
        <>
          {/* ── STAFF TAB ── */}
          {activeTab === 'staff' && (
            <>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Assign Staff Member</h3>
                <form onSubmit={handleAssignStaff} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>User</label>
                    <select value={staffForm.staff} onChange={e => setStaffForm(p => ({ ...p, staff: e.target.value }))} style={inputStyle} required>
                      <option value="">— Select user —</option>
                      {allUsers.filter(u => u.role === 'EVENT_STAFF').map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Responsibility</label>
                    <select value={staffForm.responsibility} onChange={e => setStaffForm(p => ({ ...p, responsibility: e.target.value }))} style={inputStyle}>
                      {RESPONSIBILITIES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <button type="submit" style={btnPrimary} disabled={saving}><Plus size={16} />{saving ? 'Assigning…' : 'Assign'}</button>
                </form>
              </div>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Assigned Staff ({staffList.length})</h3>
                {staffList.length === 0 ? <p style={{ color: '#94a3b8' }}>No staff assigned yet.</p> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ borderBottom: '2px solid #f1f5f9' }}>{['Name','Email','Responsibility','Status',''].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {staffList.map(s => (
                        <tr key={s._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.65rem 0.75rem' }}>{s.staff?.name || '—'}</td>
                          <td style={{ padding: '0.65rem 0.75rem', color: '#64748b', fontSize: '0.85rem' }}>{s.staff?.email || '—'}</td>
                          <td style={{ padding: '0.65rem 0.75rem' }}><Badge label={RESPONSIBILITIES.find(r => r.value === s.responsibility)?.label || s.responsibility} color={ROLE_COLORS[s.responsibility] || '#64748b'} /></td>
                          <td style={{ padding: '0.65rem 0.75rem' }}><Badge label={s.status} color={s.status === 'ACTIVE' ? '#16a34a' : '#64748b'} /></td>
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}><button style={btnDanger} onClick={() => handleRemoveStaff(s._id)}><Trash2 size={13} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ── SPEAKERS TAB ── */}
          {activeTab === 'speakers' && (
            <>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Assign Speaker</h3>
                <form onSubmit={handleAssignSpeaker} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>User Account</label>
                    <select value={speakerForm.user} onChange={e => setSpeakerForm(p => ({ ...p, user: e.target.value }))} style={inputStyle} required>
                      <option value="">— Select user —</option>
                      {allUsers.filter(u => u.role === 'SPEAKER').map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Designation</label>
                    <input value={speakerForm.designation} onChange={e => setSpeakerForm(p => ({ ...p, designation: e.target.value }))} style={inputStyle} placeholder="e.g. CTO" />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Company</label>
                    <input value={speakerForm.company} onChange={e => setSpeakerForm(p => ({ ...p, company: e.target.value }))} style={inputStyle} placeholder="e.g. Acme Corp" />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Expertise (comma-separated)</label>
                    <input value={speakerForm.expertise} onChange={e => setSpeakerForm(p => ({ ...p, expertise: e.target.value }))} style={inputStyle} placeholder="e.g. AI, Leadership" />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Bio</label>
                    <input value={speakerForm.bio} onChange={e => setSpeakerForm(p => ({ ...p, bio: e.target.value }))} style={inputStyle} placeholder="Short bio…" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <button type="submit" style={btnPrimary} disabled={saving}><Plus size={16} />{saving ? 'Assigning…' : 'Assign Speaker'}</button>
                  </div>
                </form>
              </div>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Assigned Speakers ({speakerList.length})</h3>
                {speakerList.length === 0 ? <p style={{ color: '#94a3b8' }}>No speakers assigned yet.</p> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ borderBottom: '2px solid #f1f5f9' }}>{['Name','Designation','Company','Expertise',''].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {speakerList.map((s, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.65rem 0.75rem' }}>{s.user?.name || '—'}</td>
                          <td style={{ padding: '0.65rem 0.75rem', color: '#64748b', fontSize: '0.85rem' }}>{s.profile?.designation || '—'}</td>
                          <td style={{ padding: '0.65rem 0.75rem', color: '#64748b', fontSize: '0.85rem' }}>{s.profile?.company || '—'}</td>
                          <td style={{ padding: '0.65rem 0.75rem', fontSize: '0.82rem', color: '#7c3aed' }}>{(s.profile?.expertise || []).join(', ') || '—'}</td>
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}><button style={btnDanger} onClick={() => handleRemoveSpeaker(s.user?._id)}><Trash2 size={13} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ── PACKAGES TAB ── */}
          {activeTab === 'packages' && (
            <>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Create Sponsorship Package</h3>
                <form onSubmit={handleAddPackage} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Package Name *</label>
                    <input value={packageForm.name} onChange={e => setPackageForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} placeholder="e.g. Gold Tier" required />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Price (USD) *</label>
                    <input type="number" value={packageForm.price} onChange={e => setPackageForm(p => ({ ...p, price: e.target.value }))} style={inputStyle} placeholder="e.g. 5000" required />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Benefits (comma-separated)</label>
                    <input value={packageForm.benefits} onChange={e => setPackageForm(p => ({ ...p, benefits: e.target.value }))} style={inputStyle} placeholder="e.g. Logo on banner, 10 tickets" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <button type="submit" style={btnPrimary} disabled={saving}><Plus size={16} />{saving ? 'Creating…' : 'Create Package'}</button>
                  </div>
                </form>
              </div>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Available Packages ({packageList.length})</h3>
                {packageList.length === 0 ? <p style={{ color: '#94a3b8' }}>No packages created yet.</p> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ borderBottom: '2px solid #f1f5f9' }}>{['Name','Price','Benefits','Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {packageList.map(pkg => (
                        <tr key={pkg._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{pkg.name}</td>
                          <td style={{ padding: '0.65rem 0.75rem', color: '#16a34a', fontWeight: 600 }}>${pkg.price}</td>
                          <td style={{ padding: '0.65rem 0.75rem', fontSize: '0.82rem', color: '#64748b' }}>{(pkg.benefits || []).join(', ') || '—'}</td>
                          <td style={{ padding: '0.65rem 0.75rem' }}><Badge label={pkg.status} color={pkg.status === 'ACTIVE' ? '#16a34a' : '#64748b'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ── SPONSORS TAB ── */}
          {activeTab === 'sponsors' && (
            <>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Add Sponsor</h3>
                <form onSubmit={handleAddSponsor} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Company Name *</label>
                    <input value={sponsorForm.companyName} onChange={e => setSponsorForm(p => ({ ...p, companyName: e.target.value }))} style={inputStyle} placeholder="e.g. TechCorp Inc." required />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Contact Email</label>
                    <input value={sponsorForm.contactEmail} onChange={e => setSponsorForm(p => ({ ...p, contactEmail: e.target.value }))} style={inputStyle} type="email" placeholder="sponsor@example.com" />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Linked User (optional)</label>
                    <select value={sponsorForm.user} onChange={e => setSponsorForm(p => ({ ...p, user: e.target.value }))} style={inputStyle}>
                      <option value="">— None —</option>
                      {allUsers.filter(u => u.role === 'SPONSOR' || u.role === 'ATTENDEE').map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Description</label>
                    <input value={sponsorForm.description} onChange={e => setSponsorForm(p => ({ ...p, description: e.target.value }))} style={inputStyle} placeholder="Short description…" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <button type="submit" style={btnPrimary} disabled={saving}><Plus size={16} />{saving ? 'Adding…' : 'Add Sponsor'}</button>
                  </div>
                </form>
              </div>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Event Sponsors & Deliverables ({sponsorList.length})</h3>
                {sponsorList.length === 0 ? <p style={{ color: '#94a3b8' }}>No sponsors added yet.</p> : (
                  <div>
                    {sponsorList.map(s => {
                      const asgn = assignmentList.find(a => typeof a.sponsor === 'object' ? a.sponsor._id === s._id : a.sponsor === s._id);
                      const isManaging = selectedAssignmentSponsor === s._id;
                      
                      return (
                        <div key={s._id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
                          <div style={{ background: '#f8fafc', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b' }}>{s.companyName}</div>
                              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                                Linked User: {s.user?.name || '—'} | Package: {asgn?.sponsorshipPackage?.name || <span style={{color: '#dc2626'}}>None</span>}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button style={{ ...btnPrimary, background: '#10b981', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleManageAssignment(isManaging ? null : s._id)}>
                                {isManaging ? <X size={14}/> : <Edit3 size={14} />} {isManaging ? 'Close' : 'Manage Assignment'}
                              </button>
                              <button style={{ ...btnDanger, padding: '0.4rem 0.8rem' }} onClick={() => handleRemoveSponsor(s._id)}><Trash2 size={14} /></button>
                            </div>
                          </div>
                          
                          {isManaging && (
                            <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
                              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#334155' }}>Sponsorship Package</h4>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Package</label>
                                  <select value={assignmentForm.sponsorshipPackage} onChange={e => setAssignmentForm(p => ({ ...p, sponsorshipPackage: e.target.value }))} style={inputStyle}>
                                    <option value="">— Select a package —</option>
                                    {packageList.map(p => <option key={p._id} value={p._id}>{p.name} (${p.price})</option>)}
                                  </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Payment Status</label>
                                  <select value={assignmentForm.paymentStatus} onChange={e => setAssignmentForm(p => ({ ...p, paymentStatus: e.target.value }))} style={inputStyle}>
                                    <option value="PENDING">Pending</option>
                                    <option value="PAID">Paid</option>
                                  </select>
                                </div>
                                <button style={{ ...btnPrimary, padding: '0.6rem 1rem' }} onClick={handleSaveAssignment} disabled={saving}><Save size={16} /> Save</button>
                              </div>

                              {asgn && (
                                <>
                                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#334155', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>Deliverables</h4>
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
                                    <input value={deliverableForm.title} onChange={e => setDeliverableForm(p => ({ ...p, title: e.target.value }))} style={{ ...inputStyle, flex: 1.5 }} placeholder="Title (e.g. Submit Logo)" />
                                    <input value={deliverableForm.description} onChange={e => setDeliverableForm(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, flex: 2 }} placeholder="Description..." />
                                    <input type="date" value={deliverableForm.dueDate} onChange={e => setDeliverableForm(p => ({ ...p, dueDate: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                                    <button style={{ ...btnPrimary, background: '#db2777' }} onClick={handleAddDeliverable} disabled={saving}><Plus size={16} /> Add</button>
                                  </div>
                                  
                                  {asgn.deliverables?.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                      <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                          <th style={{ padding: '0.5rem', textAlign: 'left' }}>Title</th>
                                          <th style={{ padding: '0.5rem', textAlign: 'left' }}>Description</th>
                                          <th style={{ padding: '0.5rem', textAlign: 'left' }}>Due Date</th>
                                          <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
                                          <th style={{ padding: '0.5rem', textAlign: 'right' }}></th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {asgn.deliverables.map(d => (
                                          <tr key={d._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '0.5rem', fontWeight: 600 }}>{d.title}</td>
                                            <td style={{ padding: '0.5rem', color: '#64748b' }}>{d.description}</td>
                                            <td style={{ padding: '0.5rem' }}>{d.dueDate ? new Date(d.dueDate).toLocaleDateString() : '—'}</td>
                                            <td style={{ padding: '0.5rem' }}><Badge label={d.status} color={d.status === 'COMPLETED' ? '#16a34a' : '#f59e0b'} /></td>
                                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                              <button style={btnDanger} onClick={() => handleRemoveDeliverable(asgn._id, asgn.deliverables, d._id)}><Trash2 size={13}/></button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No deliverables assigned.</p>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default EventTeamPage;
