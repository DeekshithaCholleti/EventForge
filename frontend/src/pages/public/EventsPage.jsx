import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI, ticketTypeAPI, couponAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { RegistrationModal } from '../../components/RegistrationModal';
import { LoadingSpinner, EmptyState, MagneticButton } from '../../components/UI';
import { Calendar, MapPin, Users, Search, Filter, Clock, Ticket } from 'lucide-react';

const STATUS_COLORS = {
  PUBLISHED: '#3f7d70', ONGOING: '#4A628A', DRAFT: '#a47742', COMPLETED: '#7AB2D3', CANCELLED: '#a6535b',
};

const EventCard = ({ event, onRegister }) => {
  const statusColor = STATUS_COLORS[event.status] || '#94a3b8';
  return (
    <div className="card clip-reveal" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', '--stagger-index': event.staggerIndex }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: statusColor, background: statusColor + '18', padding: '0.2rem 0.6rem', borderRadius: '9999px', textTransform: 'uppercase' }}>
            {event.status}
          </span>
          <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: '#6d819b', background: '#DFF2EB', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
            {event.eventType?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
        <Link to={`/events/${event._id}`} className="text-shift" style={{ color: '#23364d', textDecoration: 'none' }}>{event.name}</Link>
      </h3>

      {event.description && (
        <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {event.description}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#64748b', fontSize: '0.82rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={14} />
          <span>{new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        {event.location?.city && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} />
            <span>{event.location.city}{event.location.country ? `, ${event.location.country}` : ''}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={14} />
          <span>Capacity: {event.capacity}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
        <Link to={`/events/${event._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>View Details</Link>
        {event.status === 'PUBLISHED' && (
          <MagneticButton onClick={() => onRegister(event)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
            <Ticket size={14} /> Register
          </MagneticButton>
        )}
      </div>
    </div>
  );
};

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await eventAPI.getAll(params);
      setEvents(res.data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = async (event) => {
    if (!user) { window.location.href = '/login'; return; }
    setSelectedEvent(event);
    try {
      const [ttRes, cpRes] = await Promise.all([
        ticketTypeAPI.getAll({ event: event._id }),
        couponAPI.getAll({ event: event._id }),
      ]);
      setTicketTypes(ttRes.data?.items || []);
      setCoupons(cpRes.data?.items || []);
    } catch (err) {
      setTicketTypes([]);
      setCoupons([]);
    }
  };

  const handleRegSuccess = (data) => {
    setSelectedEvent(null);
    const status = data.registration?.registrationStatus;
    setSuccessMsg(status === 'WAITLISTED'
      ? '✓ Added to waitlist successfully!'
      : `✓ Registration confirmed! Your ticket code: ${data.ticket?.uniqueTicketCode}`);
    setTimeout(() => setSuccessMsg(''), 8000);
  };

  const filtered = events.filter((e) =>
    search === '' || e.name.toLowerCase().includes(search.toLowerCase()) || e.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-intro fade-lift">
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Browse Events</h1>
        <p style={{ color: '#64748b' }}>Discover conferences, workshops, seminars and more</p>
      </div>

      {successMsg && (
        <div className="alert alert-success state-sent" style={{ marginBottom: '1.5rem' }}>✓ {successMsg}</div>
      )}

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.2rem' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: '#64748b' }} />
          <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="No events found" description="Try adjusting your search or check back later." icon={Calendar} />
      ) : (
        <div className="grid-cols-3">
          {filtered.map((event, index) => (
            <EventCard key={event._id} event={{ ...event, staggerIndex: index }} onRegister={handleRegisterClick} />
          ))}
        </div>
      )}

      {selectedEvent && (
        <RegistrationModal
          event={selectedEvent}
          ticketTypes={ticketTypes}
          coupons={coupons}
          onClose={() => setSelectedEvent(null)}
          onSuccess={handleRegSuccess}
        />
      )}
    </div>
  );
};

export default EventsPage;
