import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventAPI, sessionAPI, sessionAttendanceAPI, checkInAPI, venueAPI, roomAPI, staffAssignmentAPI } from '../../api';
import { LoadingSpinner } from '../../components/UI';
import {
  QrCode, Users, Building2, Headphones, ScanLine, CheckCircle,
  XCircle, AlertTriangle, UserCheck, Layers, MapPin, CalendarCheck,
  ChevronDown, Star, AlertCircle, Clock
} from 'lucide-react';

const Badge = ({ label, color = '#64748b' }) => (
  <span style={{
    background: color + '18', color, border: `1px solid ${color}35`,
    borderRadius: '999px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap'
  }}>
    {String(label).replace(/_/g, ' ')}
  </span>
);

const StaffDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('checkin');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [ticketInput, setTicketInput] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [checkinsLoading, setCheckinsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [markingSessionId, setMarkingSessionId] = useState(null);
  const [attendeeIdInput, setAttendeeIdInput] = useState('');
  const [venues, setVenues] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [flash, setFlash] = useState({ msg: '', isError: false });

  const showFlash = (msg, isError = false) => {
    setFlash({ msg, isError });
    setTimeout(() => setFlash({ msg: '', isError: false }), 4000);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (user?.role === 'EVENT_STAFF') {
          const res = await staffAssignmentAPI.getAll({ staff: user._id, status: 'ACTIVE' });
          const assignedEvents = res.data?.items?.map(a => a.event).filter(Boolean) || [];
          setEvents(assignedEvents);
        } else {
          const res = await eventAPI.getAll({ limit: 50, myEvents: user?.role === 'EVENT_ORGANIZER' });
          setEvents(res.data?.events || []);
        }
      } catch (err) {}
    };
    fetchEvents();
  }, [user]);

  useEffect(() => {
    if (!selectedEvent) return;
    if (activeTab === 'checkin') fetchCheckins();
    else if (activeTab === 'sessions') { fetchSessions(); fetchAttendance(); fetchCheckins(); }
    else if (activeTab === 'venue') { fetchVenues(); fetchSessions(); }
    else if (activeTab === 'support') { fetchCheckins(); fetchSessions(); fetchAttendance(); fetchVenues(); }
  }, [selectedEvent, activeTab]);

  const fetchCheckins = async () => {
    setCheckinsLoading(true);
    try { const res = await checkInAPI.getAll({ event: selectedEvent }); setCheckins(res.data?.items || []); }
    catch (e) {} finally { setCheckinsLoading(false); }
  };
  const fetchSessions = async () => {
    setSessionsLoading(true);
    try { const res = await sessionAPI.getAll({ event: selectedEvent }); setSessions(res.data?.sessions || res.data?.items || []); }
    catch (e) {} finally { setSessionsLoading(false); }
  };
  const fetchAttendance = async () => {
    setAttendanceLoading(true);
    try { const res = await sessionAttendanceAPI.getAll({ event: selectedEvent }); setAttendanceRecords(res.data?.items || []); }
    catch (e) {} finally { setAttendanceLoading(false); }
  };
  const fetchVenues = async () => {
    setVenuesLoading(true);
    try {
      const [vRes, rRes] = await Promise.all([venueAPI.getAll({ limit: 50 }), roomAPI.getAll({ limit: 100 })]);
      setVenues(vRes.data?.venues || vRes.data?.items || []);
      setRooms(rRes.data?.rooms || rRes.data?.items || []);
    } catch (e) {} finally { setVenuesLoading(false); }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;
    setCheckInLoading(true); setCheckInResult(null);
    try {
      const res = await checkInAPI.create({ ticket: ticketInput.trim(), event: selectedEvent || undefined });
      setCheckInResult({ type: 'success', data: res.data });
      setTicketInput('');
      fetchCheckins();
    } catch (err) {
      setCheckInResult({ type: 'error', message: err.message || 'Check-in failed' });
    } finally { setCheckInLoading(false); }
  };

  const handleMarkSessionAttendance = async (sessionId) => {
    if (!attendeeIdInput.trim()) return showFlash('Please select an attendee', true);
    try {
      await sessionAttendanceAPI.create({ event: selectedEvent, session: sessionId, attendee: attendeeIdInput.trim(), method: 'MANUAL' });
      showFlash('Session attendance recorded');
      setAttendeeIdInput('');
      fetchAttendance();
    } catch (err) { showFlash(err.message || 'Failed to record attendance', true); }
  };

  const cardStyle = { background: 'var(--cream)', borderRadius: '2px', border: '2px solid var(--dark)', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)' };
  const inputStyle = { padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' };
  const tabStyle = (active) => ({
    padding: '0.65rem 1.25rem', borderBottom: active ? '3px solid #7AB2D3' : '3px solid transparent',
    color: active ? '#1f2933' : '#5f7488', fontWeight: active ? 800 : 600, cursor: 'pointer',
    background: 'none', border: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap'
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
        <UserCheck size={28} style={{ color: '#7AB2D3' }} />
        <h1 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 700 }}>Staff Operations Dashboard</h1>
      </div>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Manage check-ins, session attendance, venue operations, and attendee support.</p>

      {flash.msg && (
        <div className={'alert ' + (flash.isError ? 'alert-danger' : 'alert-success')} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {flash.isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {flash.msg}
        </div>
      )}

      <div style={cardStyle}>
        <label style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
          <CalendarCheck size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Select Event
        </label>
        <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={{ ...inputStyle, maxWidth: '440px' }}>
          <option value="">— Select event to manage —</option>
          {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <button style={tabStyle(activeTab === 'checkin')} onClick={() => setActiveTab('checkin')}><QrCode size={16} /> Check-In Desk</button>
        <button style={tabStyle(activeTab === 'sessions')} onClick={() => setActiveTab('sessions')}><Layers size={16} /> Session Attendance</button>
        <button style={tabStyle(activeTab === 'venue')} onClick={() => setActiveTab('venue')}><Building2 size={16} /> Venue Operations</button>
        <button style={tabStyle(activeTab === 'support')} onClick={() => setActiveTab('support')}><Headphones size={16} /> Attendee Support</button>
      </div>

      {activeTab === 'checkin' && (
        <>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ScanLine size={18} style={{ color: '#0891b2' }} /> Check-In Terminal
            </h3>
            <form onSubmit={handleCheckIn} style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <ScanLine size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="text" value={ticketInput} onChange={e => setTicketInput(e.target.value)}
                  placeholder="Enter Ticket Code (e.g. TKT-123456) or scan QR…" autoFocus
                  style={{ ...inputStyle, paddingLeft: '2.5rem', fontSize: '1rem' }} />
              </div>
              <button type="submit" disabled={checkInLoading || !ticketInput.trim()}
                style={{ background: '#7AB2D3', color: '#1f2933', border: '2px solid #1f2933', borderRadius: '2px', padding: '0 1.5rem', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem', whiteSpace: 'nowrap', boxShadow: '4px 4px 0 #1f2933' }}>
                {checkInLoading ? 'Processing…' : 'Check In'}
              </button>
            </form>
            {checkInResult?.type === 'success' && (
              <div style={{ marginTop: '1rem', background: '#f0fdf4', border: '2px solid #10b981', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <CheckCircle size={28} style={{ color: '#10b981', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#047857' }}>Check-In Successful!</div>
                  <div style={{ color: '#065f46', fontSize: '0.88rem' }}><strong>{checkInResult.data.attendee?.name || 'Attendee'}</strong> — {checkInResult.data.ticket?.uniqueTicketCode}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Time: {new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            )}
            {checkInResult?.type === 'error' && (
              <div style={{ marginTop: '1rem', background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {checkInResult.message.toLowerCase().includes('already') ? <AlertTriangle size={28} style={{ color: '#b91c1c' }} /> : <XCircle size={28} style={{ color: '#b91c1c' }} />}
                <div>
                  <div style={{ fontWeight: 700, color: '#b91c1c' }}>Check-In Failed</div>
                  <div style={{ fontSize: '0.88rem', color: '#b91c1c' }}>{checkInResult.message}</div>
                </div>
              </div>
            )}
          </div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Recent Check-ins {selectedEvent && <span style={{ color: '#0891b2' }}>({checkins.length})</span>}</h3>
              {selectedEvent && <button onClick={fetchCheckins} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b' }}>Refresh</button>}
            </div>
            {!selectedEvent ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>Select an event to view check-ins.</p>
              : checkinsLoading ? <LoadingSpinner />
              : checkins.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>No check-ins yet for this event.</p>
              : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead><tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      {['Attendee', 'Email', 'Ticket Code', 'Method', 'Time'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#64748b', fontWeight: 700 }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {checkins.map(c => (
                        <tr key={c._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>{c.attendee?.name || '—'}</td>
                          <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>{c.attendee?.email || '—'}</td>
                          <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace', color: '#0891b2' }}>{c.ticket?.uniqueTicketCode || '—'}</td>
                          <td style={{ padding: '0.6rem 0.75rem' }}><Badge label={c.method || 'QR'} color="#0891b2" /></td>
                          <td style={{ padding: '0.6rem 0.75rem', color: '#94a3b8', fontSize: '0.82rem' }}>{new Date(c.checkedInAt || c.createdAt).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        </>
      )}

      {activeTab === 'sessions' && (
        !selectedEvent ? <div style={{ ...cardStyle, textAlign: 'center', color: '#94a3b8' }}>Select an event above.</div> : (
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: '#7c3aed' }} /> Sessions — Mark Attendance
            </h3>
            {sessionsLoading ? <LoadingSpinner /> : sessions.length === 0 ? <p style={{ color: '#94a3b8' }}>No sessions found for this event.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sessions.map(sess => {
                  const sessAttendees = attendanceRecords.filter(a => (typeof a.session === 'object' ? a.session._id : a.session) === sess._id);
                  const isExpanded = markingSessionId === sess._id;
                  return (
                    <div key={sess._id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ background: '#f8fafc', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => setMarkingSessionId(isExpanded ? null : sess._id)}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{sess.title}</div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
                            <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                            {new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(sess.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {sess.room && <span style={{ marginLeft: '0.75rem' }}><MapPin size={12} style={{ verticalAlign: 'middle' }} /> {sess.room}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7c3aed' }}>{sessAttendees.length}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Attended</div>
                          </div>
                          <Badge label={sess.status} color={sess.status === 'PUBLISHED' ? '#16a34a' : '#94a3b8'} />
                          <ChevronDown size={18} style={{ color: '#94a3b8', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                        </div>
                      </div>
                      {isExpanded && (
                        <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                            <select
                              value={attendeeIdInput}
                              onChange={e => setAttendeeIdInput(e.target.value)}
                              style={{ ...inputStyle, flex: 1, width: 'auto' }}
                            >
                              <option value="">— Select checked-in attendee —</option>
                              {checkins.map(c => (
                                <option key={c.attendee._id} value={c.attendee._id}>
                                  {c.attendee.name || c.attendee.email || 'Unknown'} ({c.ticket?.uniqueTicketCode})
                                </option>
                              ))}
                            </select>
                            <button onClick={() => handleMarkSessionAttendance(sess._id)}
                              style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              <UserCheck size={16} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />Mark Attended
                            </button>
                          </div>
                          {sessAttendees.length > 0 && (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                              <thead><tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                                {['Attendee', 'Recorded At', 'Method'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.4rem 0.75rem', color: '#64748b', fontWeight: 700 }}>{h}</th>)}
                              </tr></thead>
                              <tbody>
                                {sessAttendees.map(a => (
                                  <tr key={a._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{a.attendee?.name || '—'}</td>
                                    <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{new Date(a.attendedAt || a.createdAt).toLocaleString()}</td>
                                    <td style={{ padding: '0.5rem 0.75rem' }}><Badge label={a.method || 'MANUAL'} color="#0891b2" /></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      )}

      {activeTab === 'venue' && (
        venuesLoading ? <LoadingSpinner /> : (
          <div>
            {venues.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', color: '#94a3b8' }}>
                <Building2 size={32} style={{ margin: '0 auto 0.75rem', display: 'block', color: '#cbd5e1' }} />
                No venues found. Venues are configured by the event organizer.
              </div>
            ) : venues.map(venue => {
              const venueRooms = rooms.filter(r => (typeof r.venue === 'object' ? r.venue._id : r.venue) === venue._id);
              return (
                <div key={venue._id} style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <Building2 size={24} style={{ color: '#0891b2', flexShrink: 0, marginTop: '0.2rem' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{venue.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}><MapPin size={13} style={{ verticalAlign: 'middle' }} /> {venue.address}, {venue.city}, {venue.country}</div>
                      {venue.facilities?.length > 0 && <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>{venue.facilities.map(f => <Badge key={f} label={f} color="#0891b2" />)}</div>}
                    </div>
                  </div>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#334155' }}>Rooms & Status</h4>
                  {venueRooms.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No rooms configured.</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      {venueRooms.map(room => (
                        <div key={room._id} style={{ border: '1px solid #e2e8f0', background: room.status === 'ACTIVE' ? '#f0fdf4' : room.status === 'MAINTENANCE' ? '#fffbeb' : '#fef2f2', borderRadius: '8px', padding: '0.75rem' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>{room.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem' }}><Users size={12} style={{ verticalAlign: 'middle' }} /> Cap: {room.capacity}</div>
                          <Badge label={room.status} color={room.status === 'ACTIVE' ? '#16a34a' : room.status === 'MAINTENANCE' ? '#d97706' : '#dc2626'} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {sessions.length > 0 && (
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CalendarCheck size={18} style={{ color: '#0891b2' }} /> Session Room Schedule
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead><tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    {['Session', 'Room', 'Time', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#64748b', fontWeight: 700 }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {sessions.map(sess => (
                      <tr key={sess._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{sess.title}</td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#0891b2' }}>{sess.room || <span style={{ color: '#94a3b8' }}>Not assigned</span>}</td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#64748b', fontSize: '0.83rem' }}>
                          {new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(sess.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem' }}><Badge label={sess.status} color={sess.status === 'PUBLISHED' ? '#16a34a' : '#94a3b8'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}

      {activeTab === 'support' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 1rem', color: '#1e293b', fontSize: '1rem' }}>Event Stats</h3>
              {[
                { label: 'Total Checked In', value: checkins.length, bg: '#f0fdf4', color: '#16a34a' },
                { label: 'Sessions', value: sessions.length, bg: '#eff6ff', color: '#2563eb' },
                { label: 'Session Attendance Records', value: attendanceRecords.length, bg: '#faf5ff', color: '#7c3aed' },
                { label: 'Venues', value: venues.length, bg: '#fefce8', color: '#ca8a04' },
              ].map(({ label, value, bg, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem', background: bg, borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>{label}</span>
                  <span style={{ color, fontWeight: 800, fontSize: '1.1rem' }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 1rem', color: '#1e293b', fontSize: '1rem' }}>Quick Reference</h3>
              {[
                { icon: <QrCode size={16} style={{ color: '#0891b2' }} />, text: 'Check-In Issues: If a scan fails, try entering the code manually. "Already checked in" means the ticket was previously used.' },
                { icon: <Layers size={16} style={{ color: '#7c3aed' }} />, text: 'Session Attendance: Go to "Session Attendance" tab, expand the session, enter attendee\'s User ID to mark attended.' },
                { icon: <Building2 size={16} style={{ color: '#f59e0b' }} />, text: 'Room Issues: Rooms in MAINTENANCE are unavailable. Check Venue Operations for real-time schedule.' },
                { icon: <Star size={16} style={{ color: '#db2777' }} />, text: 'Feedback: Direct attendees to "My Tickets" page to rate their session experience after check-in.' },
              ].map(({ icon, text }, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem', padding: '0.65rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>{icon}</div>
                  <div style={{ color: '#475569' }}>{text}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1rem', color: '#1e293b', fontSize: '1rem' }}>
              <Headphones size={18} style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: '#0891b2' }} />Common Attendee Queries
            </h3>
            {[
              { q: "I lost my ticket / can't find it", a: "Direct them to 'My Tickets' in the app. Ticket code is visible there. You can also manually check them in using the ticket code from the Check-In tab." },
              { q: 'Which room is my session in?', a: 'Check the Venue Operations tab → Session Room Schedule. Printed schedules are also available at the registration desk.' },
              { q: "I can't access a session / room is full", a: 'Verify their ticket type includes the session. Capacity limits may apply. Check with the event organizer.' },
              { q: 'WiFi / Food / Restroom directions', a: 'WiFi password is posted at the venue entrance. Restrooms near the main hall. Food court on Floor 1. Ask at info desk for floor maps.' },
              { q: 'I want to give feedback about the event', a: "Attendees can rate from 'My Tickets' page → click the 'Rate Event' button on any ticket card." },
            ].map(({ q, a }, i) => (
              <div key={i} style={{ padding: '0.85rem', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <AlertCircle size={15} style={{ color: '#0891b2', flexShrink: 0, marginTop: '2px' }} /> {q}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.88rem', paddingLeft: '1.4rem' }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
