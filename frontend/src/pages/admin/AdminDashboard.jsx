import React, { useState, useEffect } from 'react';
import { userAPI, organizationAPI, eventAPI, feedbackAPI } from '../../api';
import { LoadingSpinner } from '../../components/UI';
import { Shield, Users, Building2, Settings, Search, Calendar, BarChart2, CheckCircle2, AlertCircle, RefreshCw, Tag } from 'lucide-react';

const ALL_ROLES = ['PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF', 'SPEAKER', 'ATTENDEE', 'SPONSOR'];

const ROLE_COLORS = {
  PLATFORM_ADMIN: '#7AB2D3',
  EVENT_ORGANIZER: '#B9E5E8',
  EVENT_STAFF: '#7AB2D3',
  SPEAKER: '#d97706',
  ATTENDEE: '#16a34a',
  SPONSOR: '#db2777',
};

const Badge = ({ label, color = '#64748b' }) => (
  <span style={{ background: color + '15', color, border: `1px solid ${color}35`, borderRadius: '999px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
    {label.replace(/_/g, ' ')}
  </span>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [events, setEvents] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingRole, setEditingRole] = useState({}); // { [userId]: newRole }
  const [editingOrg, setEditingOrg] = useState(null);
  const [orgForm, setOrgForm] = useState({ name: '', description: '' });
  const [newOrg, setNewOrg] = useState({ name: '', description: '' });
  const [orgMemberUsers, setOrgMemberUsers] = useState({});
  const [selectedOrganizer, setSelectedOrganizer] = useState({});
  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState('');

  useEffect(() => { 
    fetchUsers(); 
  }, []);
  
  useEffect(() => { if (activeTab === 'organizations') fetchOrgs(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'events' || activeTab === 'overview') fetchEvents(); }, [activeTab]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await userAPI.getAll({ limit: 500 });
      setUsers(res.data?.users || []);
    } catch (e) { setError('Failed to load users'); }
    finally { setUsersLoading(false); }
  };

  const fetchEvents = async () => {
    setEventsLoading(true);
    setError('');
    try {
      const res = await eventAPI.getAll({ limit: 500, includePast: true });
      setEvents(res.data?.events || []);
    } catch (e) {
      setError('Failed to load events: ' + (e.message || 'Unknown error'));
    } finally {
      setEventsLoading(false);
    }
    // Fetch feedbacks independently so a failure here won't block events
    try {
      const fRes = await feedbackAPI.getAll();
      setFeedbacks(fRes.data?.items || []);
    } catch (_) { /* ratings are optional */ }
  };

  const fetchOrgs = async () => {
    setOrgsLoading(true);
    try {
      const res = await organizationAPI.getAll({ limit: 200 });
      setOrgs(res.data?.organizations || []);
    } catch (e) { setError('Failed to load organizations'); }
    finally { setOrgsLoading(false); }
  };

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userAPI.updateRole(userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setEditingRole(prev => { const n = { ...prev }; delete n[userId]; return n; });
      flash('Role updated successfully');
    } catch (e) { flash(e.message || 'Failed to update role', true); }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await userAPI.updateStatus(userId, newStatus);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: newStatus } : u));
      flash(`User ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (e) { flash(e.message || 'Failed to update status', true); }
  };

  const handleUpdateOrg = async (e) => {
    e.preventDefault();
    try {
      await organizationAPI.update(editingOrg._id, orgForm);
      setOrgs(prev => prev.map(o => o._id === editingOrg._id ? { ...o, ...orgForm } : o));
      setEditingOrg(null);
      flash('Organization updated');
    } catch (e) { flash(e.message || 'Failed to update org', true); }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      const res = await organizationAPI.create(newOrg);
      setOrgs(prev => [res.data.organization, ...prev]);
      setNewOrg({ name: '', description: '' });
      flash('Organization created');
    } catch (e) { flash(e.message || 'Failed to create organization', true); }
  };

  const loadOrgMembers = async (organizationId) => {
    try {
      const res = await organizationAPI.getMembers(organizationId);
      setOrgMemberUsers(prev => ({ ...prev, [organizationId]: res.data?.members || [] }));
    } catch (e) { flash(e.message || 'Failed to load organization members', true); }
  };

  const handleAddOrganizer = async (organizationId) => {
    const userId = selectedOrganizer[organizationId];
    if (!userId) return;
    try {
      await organizationAPI.addMember(organizationId, { user: userId });
      setSelectedOrganizer(prev => ({ ...prev, [organizationId]: '' }));
      await loadOrgMembers(organizationId);
      flash('Organizer added to organization');
    } catch (e) { flash(e.message || 'Failed to add organizer', true); }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const cardStyle = { background: 'var(--cream)', borderRadius: '2px', border: '2px solid var(--dark)', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)' };
  const inputStyle = { padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' };
  const tabStyle = (active) => ({ padding: '0.6rem 1.25rem', borderTop: 'none', borderRight: 'none', borderLeft: 'none', borderBottom: active ? '3px solid #7AB2D3' : '3px solid transparent', color: active ? '#1f2933' : '#5f7488', fontWeight: active ? 800 : 600, cursor: 'pointer', background: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' });
  const btnSm = { borderRadius: '2px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, border: '2px solid var(--dark)', boxShadow: '3px 3px 0 var(--dark)' };

  // Analytics Computation
  const totalUsers = users.length || 1; 
  const totalEvents = events.length || 1;
  
  const attendeeCount = users.filter(u => u.role === 'ATTENDEE').length;
  const organizerCount = users.filter(u => u.role === 'EVENT_ORGANIZER').length;
  const activeUserCount = users.filter(u => u.isActive).length;

  const activeEventsCount = events.filter(e => e.status === 'PUBLISHED').length;
  

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
        <Shield size={28} style={{ color: '#7c3aed' }} />
        <h1 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 700 }}>Platform Admin Panel</h1>
      </div>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Manage users, organizations, events, and view global analytics.</p>

      {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <button style={tabStyle(activeTab === 'overview')} onClick={() => setActiveTab('overview')}><BarChart2 size={16} /> Overview</button>
        <button style={tabStyle(activeTab === 'events')} onClick={() => setActiveTab('events')}><Calendar size={16} /> Events</button>
        <button style={tabStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}><Users size={16} /> Users</button>
        <button style={tabStyle(activeTab === 'organizations')} onClick={() => setActiveTab('organizations')}><Building2 size={16} /> Organizations</button>
        <button style={tabStyle(activeTab === 'settings')} onClick={() => setActiveTab('settings')}><Settings size={16} /> Settings</button>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ ...cardStyle, borderTop: `4px solid #7c3aed`, marginBottom: 0 }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed' }}>{users.length}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Total Registered Users</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>{Math.round((activeUserCount / totalUsers) * 100)}%</span> active accounts
              </div>
            </div>
            <div style={{ ...cardStyle, borderTop: `4px solid #2563eb`, marginBottom: 0 }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb' }}>{events.length}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Total Events Hosted</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>{Math.round((activeEventsCount / totalEvents) * 100)}%</span> currently published
              </div>
            </div>
            <div style={{ ...cardStyle, borderTop: `4px solid #10b981`, marginBottom: 0 }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{attendeeCount}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Total Attendees</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                Make up <span style={{ color: '#7c3aed', fontWeight: 700 }}>{Math.round((attendeeCount / totalUsers) * 100)}%</span> of user base
              </div>
            </div>
            <div style={{ ...cardStyle, borderTop: `4px solid #f59e0b`, marginBottom: 0 }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{organizerCount}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Total Organizers</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                Make up <span style={{ color: '#7c3aed', fontWeight: 700 }}>{Math.round((organizerCount / totalUsers) * 100)}%</span> of user base
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#1e293b' }}>User Demographics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {ALL_ROLES.map(r => {
                  const count = users.filter(u => u.role === r).length;
                  const pct = Math.round((count / totalUsers) * 100);
                  const color = ROLE_COLORS[r] || '#64748b';
                  return (
                    <div key={r}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem', fontWeight: 600 }}>
                        <span style={{ color: '#475569' }}>{r.replace(/_/g, ' ')}</span>
                        <span style={{ color }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: color, width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── EVENTS TAB ── */}
      {activeTab === 'events' && (
        <div style={cardStyle}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
                Global Event Directory
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                {events.length} event{events.length !== 1 ? 's' : ''} on the platform
              </p>
            </div>
            <button
              onClick={fetchEvents}
              disabled={eventsLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', ...btnSm, background: '#f8fafc', color: '#475569', padding: '6px 14px' }}
            >
              <RefreshCw size={14} style={{ animation: eventsLoading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                style={{ ...inputStyle, paddingLeft: '2.1rem', width: '100%', boxSizing: 'border-box' }}
                placeholder="Search by name, location…"
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
              />
            </div>
            <select
              style={{ ...inputStyle, minWidth: '150px' }}
              value={eventStatusFilter}
              onChange={(e) => setEventStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {eventsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><LoadingSpinner /></div>
          ) : (() => {
            const filtered = events.filter(e => {
              const q = eventSearch.toLowerCase();
              const matchSearch = !q ||
                e.name?.toLowerCase().includes(q) ||
                e.location?.venueName?.toLowerCase().includes(q) ||
                e.location?.city?.toLowerCase().includes(q) ||
                e.organization?.name?.toLowerCase().includes(q);
              const matchStatus = !eventStatusFilter || e.status === eventStatusFilter;
              return matchSearch && matchStatus;
            });
            return (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                      {['Event Name', 'Type', 'Organization', 'Rating', 'Status', 'Dates', 'Capacity'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '0.55rem 0.75rem', color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e, idx) => {
                      const eventFeedbacks = feedbacks.filter(f => (typeof f.event === 'object' ? f.event._id : f.event) === e._id);
                      const avgRating = eventFeedbacks.length
                        ? (eventFeedbacks.reduce((sum, f) => sum + f.rating, 0) / eventFeedbacks.length).toFixed(1)
                        : null;
                      const statusColors = { PUBLISHED: '#16a34a', DRAFT: '#f59e0b', COMPLETED: '#2563eb', CANCELLED: '#dc2626' };
                      return (
                        <tr key={e._id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                          <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#1e293b', maxWidth: '200px' }}>
                            <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.name}</span>
                            {e.isPrivate && <span style={{ marginLeft: '6px', fontSize: '0.62rem', padding: '1px 5px', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', fontWeight: 700 }}>PRIVATE</span>}
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600, background: '#f3f0ff', padding: '2px 8px', borderRadius: '999px' }}>
                              <Tag size={11} />{e.eventType?.replace(/_/g, ' ') || '—'}
                            </span>
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>{e.organization?.name || '—'}</td>
                          <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: avgRating ? '#f59e0b' : '#cbd5e1' }}>
                            {avgRating ? `${avgRating} ⭐` : '—'}
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem' }}>
                            <Badge label={e.status} color={statusColors[e.status] || '#64748b'} />
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {new Date(e.startDate).toLocaleDateString('en-IN')} – {new Date(e.endDate).toLocaleDateString('en-IN')}
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>
                            <Users size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{e.capacity || '∞'}
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          {events.length === 0 ? 'No events found on the platform.' : 'No events match your search.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === 'users' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Users</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>{filteredUsers.length} of {users.length} users</p>
            </div>
            <button onClick={fetchUsers} disabled={usersLoading} style={{ ...btnSm, background: '#f8fafc', color: '#475569', padding: '6px 14px' }}>
              <RefreshCw size={14} style={{ animation: usersLoading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input style={{ ...inputStyle, paddingLeft: '2.1rem', width: '100%', boxSizing: 'border-box' }} placeholder="Search by name or email" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select style={{ ...inputStyle, minWidth: '180px' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              {ALL_ROLES.map(role => <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          {usersLoading ? <div style={{ textAlign: 'center', padding: '2rem' }}><LoadingSpinner /></div> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead><tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                  {['Name', 'Email', 'Role', 'Status', 'Actions'].map(header => <th key={header} style={{ textAlign: 'left', padding: '0.55rem 0.75rem', color: '#64748b', fontWeight: 700 }}>{header}</th>)}
                </tr></thead>
                <tbody>
                  {filteredUsers.map(userItem => (
                    <tr key={userItem._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#1e293b' }}>{userItem.name}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>{userItem.email}</td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <select value={editingRole[userItem._id] || userItem.role} onChange={e => setEditingRole(prev => ({ ...prev, [userItem._id]: e.target.value }))} style={{ ...inputStyle, padding: '4px 6px' }}>
                          {ALL_ROLES.map(role => <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}><Badge label={userItem.isActive ? 'Active' : 'Inactive'} color={userItem.isActive ? '#16a34a' : '#dc2626'} /></td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {editingRole[userItem._id] && editingRole[userItem._id] !== userItem.role && <button onClick={() => handleRoleChange(userItem._id, editingRole[userItem._id])} style={{ ...btnSm, color: '#2563eb', background: '#eff6ff', borderColor: '#bfdbfe' }}>Save role</button>}
                          <button onClick={() => handleStatusToggle(userItem._id, userItem.isActive)} style={{ ...btnSm, color: userItem.isActive ? '#dc2626' : '#16a34a', background: 'white' }}>{userItem.isActive ? 'Deactivate' : 'Activate'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No users match your filters.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}


      {/* ── ORGANIZATIONS TAB ── */}
      {activeTab === 'organizations' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Organizations</h3>
          </div>
          <form onSubmit={handleCreateOrg} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
            <input required placeholder="Organization name" value={newOrg.name} onChange={e => setNewOrg({ ...newOrg, name: e.target.value })} style={{ ...inputStyle, flex: '1 1 220px' }} />
            <input placeholder="Description" value={newOrg.description} onChange={e => setNewOrg({ ...newOrg, description: e.target.value })} style={{ ...inputStyle, flex: '2 1 280px' }} />
            <button type="submit" style={{ ...btnSm, background: '#2563eb', color: 'white', borderColor: '#2563eb' }}>Create organization</button>
          </form>
          {orgsLoading ? <div style={{ textAlign: 'center', padding: '2rem' }}><LoadingSpinner /></div> : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    {['Organization', 'Description', 'Status', 'Created', 'Organizers', ''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#64748b', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orgs.map(o => (
                    <tr key={o._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{o.name}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#64748b', maxWidth: '280px' }}><span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{o.description || '—'}</span></td>
                      <td style={{ padding: '0.65rem 0.75rem' }}><Badge label={o.isActive ? 'Active' : 'Inactive'} color={o.isActive ? '#16a34a' : '#dc2626'} /></td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '0.65rem 0.75rem', minWidth: '250px' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                          <select value={selectedOrganizer[o._id] || ''} onChange={e => setSelectedOrganizer(prev => ({ ...prev, [o._id]: e.target.value }))} style={{ ...inputStyle, padding: '4px', minWidth: '150px' }}>
                            <option value="">Add organizer...</option>
                            {users.filter(u => u.role === 'EVENT_ORGANIZER' && u.isActive && !(orgMemberUsers[o._id] || []).some(m => m.user?._id === u._id)).map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                          </select>
                          <button type="button" onClick={() => handleAddOrganizer(o._id)} style={{ ...btnSm, background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}>Add</button>
                        </div>
                        <button type="button" onClick={() => loadOrgMembers(o._id)} style={{ ...btnSm, background: 'white', color: '#475569' }}>View assigned organizers</button>
                        {(orgMemberUsers[o._id] || []).map(member => <div key={member._id} style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.25rem' }}>{member.user?.name} ({member.user?.email})</div>)}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <button onClick={() => { setEditingOrg(o); setOrgForm({ name: o.name, description: o.description || '' }); }} style={{ ...btnSm, background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                  {orgs.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No organizations found.</td></tr>}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={18} style={{ color: '#7c3aed' }} /> Platform Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              {[['Platform', 'EventForge'], ['Version', '1.0.0'], ['Environment', 'Production'], ['Database', 'MongoDB Atlas'], ['Auth', 'JWT (7d expiry)']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>{k}</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings size={18} style={{ color: '#64748b' }} /> Global Policies</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Allow Public Event Browsing', value: true },
                { label: 'Allow Self-Registration', value: true },
                { label: 'Maintenance Mode', value: false },
                { label: 'AI Assistant', value: false },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
                  <div style={{ width: '42px', height: '22px', background: value ? '#2563eb' : '#cbd5e1', borderRadius: '999px', position: 'relative', cursor: 'not-allowed', opacity: 0.7 }}>
                    <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: value ? '22px' : '2px', transition: 'left 0.2s' }} />
                  </div>
                </div>
              ))}
              <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: 0 }}>Global policy toggles will be wired to the backend in a future release.</p>
            </div>
          </div>
          <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
            <h3 style={{ margin: '0 0 0.5rem' }}>Subscription</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ background: '#7c3aed', color: 'white', borderRadius: '10px', padding: '0.5rem 1.25rem', fontWeight: 700 }}>Enterprise Plan</div>
              <span style={{ color: '#64748b' }}>Unlimited events · Unlimited users · Priority support</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
