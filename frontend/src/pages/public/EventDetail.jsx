import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventAPI, sessionAPI, ticketTypeAPI, couponAPI, speakerAPI, sponsorAPI, staffAssignmentAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { RegistrationModal } from '../../components/RegistrationModal';
import { LoadingSpinner } from '../../components/UI';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Ticket, Tag, Mic2, Building2, UserCheck, Globe, Linkedin, Twitter } from 'lucide-react';

// Determine registration state for display
const getRegistrationState = (event, ticketTypes) => {
  if (!event) return { label: 'Loading...', canRegister: false };

  const now = new Date();
  const regStart = event.registrationStart ? new Date(event.registrationStart) : null;
  const regEnd = event.registrationEnd ? new Date(event.registrationEnd) : null;
  const eventEnd = event.endDate ? new Date(event.endDate) : null;
  const eventStart = event.startDate ? new Date(event.startDate) : null;

  if (event.status === 'CANCELLED') {
    return { label: 'Event Cancelled', canRegister: false, color: '#ef4444', variant: 'danger' };
  }
  if (event.status === 'COMPLETED' || (eventEnd && now > eventEnd)) {
    return { label: 'Event Completed', canRegister: false, color: '#6366f1', variant: 'info' };
  }
  if (event.status === 'ONGOING' || (eventStart && now >= eventStart && eventEnd && now <= eventEnd)) {
    return { label: 'Event In Progress', canRegister: false, color: '#0ea5e9', variant: 'info' };
  }
  if (regStart && now < regStart) {
    return { label: `Registration Opens ${regStart.toLocaleDateString()}`, canRegister: false, color: '#f59e0b', variant: 'warning' };
  }
  if (regEnd && now > regEnd) {
    return { label: 'Registration Closed', canRegister: false, color: '#ef4444', variant: 'danger' };
  }
  if (event.status !== 'PUBLISHED') {
    return { label: 'Not Available', canRegister: false, color: '#94a3b8', variant: 'secondary' };
  }

  // Check ticket availability
  const activeTickets = ticketTypes.filter(tt => tt.status !== 'ARCHIVED');
  const hasAvailableTickets = activeTickets.some(tt => !tt.capacity || tt.soldCount < tt.capacity);
  const hasWaitlist = activeTickets.length > 0;

  if (activeTickets.length === 0) {
    return { label: 'No Tickets Available', canRegister: false, color: '#94a3b8', variant: 'secondary' };
  }
  if (!hasAvailableTickets && hasWaitlist) {
    return { label: 'Join Waitlist', canRegister: true, color: '#f59e0b', variant: 'warning', waitlist: true };
  }
  if (!hasAvailableTickets) {
    return { label: 'Sold Out', canRegister: false, color: '#ef4444', variant: 'danger' };
  }

  return { label: 'Register Now', canRegister: true, color: '#4f46e5', variant: 'primary' };
};

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [evRes, sessRes, ttRes, cpRes, spkRes, sponRes, staffRes] = await Promise.all([
          eventAPI.getById(id),
          sessionAPI.getAll({ event: id }),
          ticketTypeAPI.getAll({ event: id }),
          couponAPI.getAll({ event: id }),
          speakerAPI.getAll({ event: id }),
          sponsorAPI.getAll({ event: id }),
          staffAssignmentAPI.getAll({ event: id }),
        ]);
        setEvent(evRes.data.event);
        setSessions(sessRes.data?.sessions || []);
        setTicketTypes(ttRes.data?.items || []);
        setCoupons(cpRes.data?.items || []);
        setSpeakers(spkRes.data?.profiles || []);
        setSponsors(sponRes.data?.sponsors || []);
        setStaff(staffRes.data?.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleRegSuccess = (data) => {
    setShowRegModal(false);
    const status = data.registration?.registrationStatus;
    setSuccessMsg(status === 'WAITLISTED'
      ? '✓ You have been added to the waitlist!'
      : `✓ Registered! Ticket: ${data.ticket?.uniqueTicketCode}`);
    setTimeout(() => setSuccessMsg(''), 8000);
  };

  if (loading) return <div className="main-content"><LoadingSpinner /></div>;
  if (!event) return <div className="main-content"><p>Event not found.</p></div>;

  const regState = getRegistrationState(event, ticketTypes);

  const handleRegisterClick = () => {
    if (!user) { window.location.href = '/login'; return; }
    setShowRegModal(true);
  };

  return (
    <div>
      <Link to="/events" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        <ArrowLeft size={16} /> Back to Events
      </Link>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white', borderRadius: '16px', padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
            {event.status}
          </span>
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
            {event.eventType?.replace(/_/g, ' ')}
          </span>
        </div>
        <h1 style={{ color: 'white', fontSize: '2.25rem', marginBottom: '1rem' }}>{event.name}</h1>
        <p style={{ opacity: 0.85, maxWidth: '700px', lineHeight: 1.6 }}>{event.description}</p>

        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', opacity: 0.9 }}>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <Calendar size={16} />
            <span>{new Date(event.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} – {new Date(event.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
          </div>
          {event.location?.city && (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <MapPin size={16} />
              <span>{[event.location.venueName, event.location.city, event.location.country].filter(Boolean).join(', ')}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <Users size={16} />
            <span>Capacity: {event.capacity}</span>
          </div>
        </div>

        {/* Registration CTA in hero */}
        <div style={{ marginTop: '1.5rem' }}>
          {regState.canRegister ? (
            <button
              onClick={handleRegisterClick}
              className="btn"
              style={{ background: 'white', color: regState.waitlist ? '#f59e0b' : '#4f46e5', fontWeight: 700 }}
            >
              <Ticket size={18} /> {regState.label}
            </button>
          ) : (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.15)', padding: '0.5rem 1.25rem',
              borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem'
            }}>
              {regState.label}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Sessions */}
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Sessions ({sessions.length})</h2>
          {sessions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No sessions published yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sessions.map((session) => (
                <div key={session._id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0 }}>{session.title}</h3>
                    <span style={{ fontSize: '0.7rem', background: '#f0f4ff', color: '#4f46e5', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                      {session.sessionType || 'Session'}
                    </span>
                  </div>
                  {session.description && <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{session.description}</p>}
                  <div style={{ display: 'flex', gap: '1.25rem', color: '#64748b', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                      <Clock size={13} /> {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {session.room?.name && <span>📍 {session.room.name}</span>}
                  </div>
                  {session.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {session.tags.map((tag) => <span key={tag} style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>{tag}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h4 style={{ marginBottom: '1rem' }}><Tag size={16} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />Ticket Types</h4>
            {ticketTypes.filter(tt => tt.status !== 'ARCHIVED').length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No tickets available.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {ticketTypes.filter(tt => tt.status !== 'ARCHIVED').map((tt) => {
                  const remaining = tt.capacity - tt.soldCount;
                  const now = new Date();
                  const saleOpen = (!tt.salesStart || now >= new Date(tt.salesStart)) && (!tt.salesEnd || now <= new Date(tt.salesEnd));
                  return (
                    <div key={tt._id} style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', opacity: saleOpen ? 1 : 0.6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{tt.name}</span>
                        <span style={{ color: '#4f46e5', fontWeight: 700, fontSize: '1.1rem' }}>${tt.price}</span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                        {!saleOpen ? 'Sales closed' : remaining > 0 ? `${remaining} remaining` : 'Sold out – waitlist available'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Register button in sidebar */}
            <div style={{ marginTop: '1rem' }}>
              {regState.canRegister ? (
                <button
                  onClick={handleRegisterClick}
                  className="btn btn-primary"
                  style={{ width: '100%', background: regState.waitlist ? '#f59e0b' : undefined, borderColor: regState.waitlist ? '#f59e0b' : undefined }}
                >
                  <Ticket size={16} /> {regState.label}
                </button>
              ) : (
                <div style={{
                  width: '100%', textAlign: 'center', padding: '0.6rem',
                  background: '#f1f5f9', borderRadius: '8px',
                  color: regState.color || '#64748b', fontWeight: 600, fontSize: '0.9rem',
                  border: `1px solid ${regState.color || '#e2e8f0'}22`
                }}>
                  {regState.label}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h4 style={{ marginBottom: '0.75rem' }}>Event Info</h4>
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#64748b' }}>
              {event.registrationStart && event.registrationEnd && (
                <div><strong>Registration:</strong> {new Date(event.registrationStart).toLocaleDateString()} – {new Date(event.registrationEnd).toLocaleDateString()}</div>
              )}
              {event.location?.onlineLink && <div><strong>Online:</strong> <a href={event.location.onlineLink} target="_blank" rel="noopener noreferrer">Join Link</a></div>}
            </div>
          </div>
        </div>
      </div>

      {/* ── SPEAKERS ── */}
      {speakers.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mic2 size={22} style={{ color: '#7c3aed' }} /> Speakers ({speakers.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {speakers.map((s, i) => (
              <div key={i} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                    {(s.user?.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{s.user?.name || 'Speaker'}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {[s.profile?.designation, s.profile?.company].filter(Boolean).join(' · ') || 'Speaker'}
                    </div>
                  </div>
                </div>
                {s.profile?.bio && <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 0.75rem', lineHeight: 1.6 }}>{s.profile.bio.slice(0, 180)}{s.profile.bio.length > 180 ? '…' : ''}</p>}
                {s.profile?.expertise?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {s.profile.expertise.slice(0, 3).map(e => (
                      <span key={e} style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>{e}</span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {s.profile?.socialLinks?.linkedin && <a href={s.profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#0a66c2' }}><Linkedin size={16} /></a>}
                  {s.profile?.socialLinks?.twitter && <a href={s.profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#1da1f2' }}><Twitter size={16} /></a>}
                  {s.profile?.socialLinks?.website && <a href={s.profile.socialLinks.website} target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed' }}><Globe size={16} /></a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SPONSORS ── */}
      {sponsors.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={22} style={{ color: '#db2777' }} /> Sponsors ({sponsors.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {sponsors.map((s) => (
              <div key={s._id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'linear-gradient(135deg, #db2777, #f472b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                  {s.companyName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{s.companyName}</div>
                  {s.description && <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>{s.description.slice(0, 80)}{s.description.length > 80 ? '…' : ''}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STAFF ── */}
      {staff.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={22} style={{ color: '#0891b2' }} /> Event Staff ({staff.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {staff.map((s) => {
              const respLabels = { CHECK_IN: 'Check-In Desk', SESSION_SUPPORT: 'Session Support', VENUE_OPERATION: 'Venue Operations', ATTENDEE_SUPPORT: 'Attendee Support' };
              return (
                <div key={s._id} style={{ padding: '0.9rem 1.1rem', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <UserCheck size={18} style={{ color: '#0891b2', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.staff?.name || 'Staff'}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{respLabels[s.responsibility] || s.responsibility}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showRegModal && (
        <RegistrationModal
          event={event}
          ticketTypes={ticketTypes}
          coupons={coupons}
          onClose={() => setShowRegModal(false)}
          onSuccess={handleRegSuccess}
        />
      )}
    </div>
  );
};

export default EventDetail;
