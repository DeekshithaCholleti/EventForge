import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ticketAPI, registrationAPI, sessionAPI, feedbackAPI } from '../../api';
import { TicketCard } from '../../components/TicketCard';
import { FeedbackModal } from '../../components/FeedbackModal';
import { LoadingSpinner, EmptyState } from '../../components/UI';
import { Ticket, BookmarkCheck, MessageSquare, Star } from 'lucide-react';

const MyTickets = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [feedbackSession, setFeedbackSession] = useState(null);
  const [feedbackEvent, setFeedbackEvent] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tRes, rRes] = await Promise.all([
          ticketAPI.getAll({ attendee: user._id }),
          registrationAPI.getAll({ attendee: user._id }),
        ]);
        setTickets(tRes.data?.tickets || []);
        setRegistrations(rRes.data?.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  const TAB = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
        fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: activeTab === id ? '#7AB2D3' : 'transparent',
        color: activeTab === id ? 'white' : '#64748b',
        transition: 'all 0.2s'
      }}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>My Tickets & Registrations</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Manage your event passes and registrations</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: '#DFF2EB', border: '2px solid #1f2933', padding: '0.35rem', borderRadius: '2px', width: 'fit-content', boxShadow: '4px 4px 0 #1f2933' }}>
        <TAB id="tickets" label={`Tickets (${tickets.length})`} icon={Ticket} />
        <TAB id="registrations" label={`Registrations (${registrations.length})`} icon={BookmarkCheck} />
      </div>

      {/* Tickets tab */}
      {activeTab === 'tickets' && (
        tickets.length === 0 ? (
          <EmptyState title="No tickets yet" description="Register for an event to receive your ticket." icon={Ticket} />
        ) : (
          <div className="grid-cols-3">
            {tickets.map((ticket) => (
              <div key={ticket._id}>
                <TicketCard
                  ticket={ticket}
                  event={ticket.event}
                  ticketType={ticket.ticketType}
                />
                <div style={{ marginTop: '0.5rem', textAlign: 'center', color: '#475569', fontSize: '0.82rem' }}>
                  Ticket ID: <strong style={{ fontFamily: 'monospace', color: '#1e293b' }}>{ticket.uniqueTicketCode}</strong>
                </div>
                {ticket.event && (
                  <button
                    onClick={() => {
                      // Use event as pseudo-session so we can rate event overall
                      setFeedbackSession({ _id: ticket.event._id, title: `Rate: ${ticket.event.name || 'Event'}` });
                      setFeedbackEvent(ticket.event);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '0.75rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <Star size={14} /> Rate This Event
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Registrations tab */}
      {activeTab === 'registrations' && (
        registrations.length === 0 ? (
          <EmptyState title="No registrations" description="You haven't registered for any events yet." icon={BookmarkCheck} />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Ticket ID</th>
                  <th>Ticket Type</th>
                  <th>Status</th>
                  <th>Amount Paid</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  (() => {
                    const registrationId = typeof reg._id === 'object' ? reg._id.toString() : reg._id;
                    const registrationTicket = tickets.find(ticket => {
                      const ticketRegistrationId = typeof ticket.registration === 'object' ? ticket.registration?._id : ticket.registration;
                      return String(ticketRegistrationId) === String(registrationId);
                    });
                    return (
                  <tr key={reg._id}>
                    <td style={{ fontWeight: 600 }}>{reg.event?.name || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#334155' }}>{registrationTicket?.uniqueTicketCode || '—'}</td>
                    <td>{reg.ticketType?.name || '—'}</td>
                    <td><span className={`badge badge-${reg.registrationStatus?.toLowerCase()}`}>{reg.registrationStatus}</span></td>
                    <td>${reg.finalAmount}</td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(reg.createdAt).toLocaleDateString()}</td>
                  </tr>
                    );
                  })()
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {feedbackSession && feedbackEvent && (
        <FeedbackModal
          session={feedbackSession}
          event={feedbackEvent}
          onClose={() => { setFeedbackSession(null); setFeedbackEvent(null); }}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default MyTickets;
