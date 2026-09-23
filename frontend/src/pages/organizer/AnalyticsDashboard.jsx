import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { analyticsAPI, eventAPI } from '../../api';
import { LoadingSpinner, StatCard, EmptyState } from '../../components/UI';
import { Users, CheckCircle, Clock, BarChart2, Star, TrendingUp } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(searchParams.get('event') || '');
  const [eventStats, setEventStats] = useState(null);
  const [sessionStats, setSessionStats] = useState([]);
  const [sponsorStats, setSponsorStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    eventAPI.getAll({ limit: 50, myEvents: true, includePast: true }).then(res => {
      const evs = res.data?.events || [];
      setEvents(evs);
      if (!selectedEvent && evs.length > 0) setSelectedEvent(evs[0]._id);
    });
  }, []);

  useEffect(() => {
    if (selectedEvent) fetchStats();
  }, [selectedEvent]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [evStat, sessStat, sponsorStat] = await Promise.all([
        analyticsAPI.getEvent(selectedEvent),
        analyticsAPI.getSession(selectedEvent),
        analyticsAPI.getSponsor(selectedEvent),
      ]);
      setEventStats(evStat.data?.totals || null);
      setSessionStats(sessStat.data?.results || []);
      setSponsorStats(sponsorStat.data?.summary || []);
    } catch (err) {
      console.error(err);
      setEventStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>Event Analytics</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Real-time insights powered by MongoDB aggregation pipelines</p>

      <div className="form-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
        <label>Select Event</label>
        <select className="form-control" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
          <option value="">— Choose Event —</option>
          {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
        </select>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && eventStats && (
        <>
          <h2 style={{ marginBottom: '1rem' }}>Registration Overview</h2>
          <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
            <StatCard label="Total Registrations" value={eventStats.totalRegistrations} icon={Users} color="#4f46e5" />
            <StatCard label="Confirmed" value={eventStats.confirmed} icon={CheckCircle} color="#10b981" />
            <StatCard label="Pending" value={eventStats.pending} icon={Clock} color="#f59e0b" />
            <StatCard label="Waitlisted" value={eventStats.waitlisted} icon={TrendingUp} color="#0ea5e9" />
            <StatCard label="Cancelled" value={eventStats.cancelled} icon={CheckCircle} color="#ef4444" />
            <StatCard label="Check-Ins" value={eventStats.checkIns} icon={CheckCircle} color="#8b5cf6" />
            <StatCard label="Attendance Rate" value={`${eventStats.attendanceRate}%`} icon={BarChart2} color="#10b981" sub="Check-ins / confirmed" />
          </div>

          {sessionStats.length > 0 && (
            <>
              <h2 style={{ marginBottom: '1rem' }}>Session Analytics</h2>
              <div className="table-container" style={{ marginBottom: '2rem' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Session</th>
                      <th>Attendance</th>
                      <th>Avg Rating</th>
                      <th>Popularity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionStats.map((s, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{s.title}</td>
                        <td>{s.attendance}</td>
                        <td>
                          {s.averageRating > 0 ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                              {Number(s.averageRating).toFixed(1)}
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ background: '#e2e8f0', borderRadius: '9999px', height: '8px', flex: 1 }}>
                              <div style={{ background: '#4f46e5', borderRadius: '9999px', height: '100%', width: `${Math.min(100, s.popularity || 0)}%` }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.popularity || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {sponsorStats.length > 0 && (
            <>
              <h2 style={{ marginBottom: '1rem' }}>Sponsor Analytics</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Sponsor</th>
                      <th>Package</th>
                      <th>Status</th>
                      <th>Deliverable Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sponsorStats.map((s, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{s.sponsor}</td>
                        <td>{s.package}</td>
                        <td><span className={`badge badge-${s.status?.toLowerCase()}`}>{s.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ background: '#e2e8f0', borderRadius: '9999px', height: '8px', flex: 1 }}>
                              <div style={{ background: '#10b981', borderRadius: '9999px', height: '100%', width: `${s.completion || 0}%` }} />
                            </div>
                            <span style={{ fontSize: '0.8rem' }}>{Math.round(s.completion || 0)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {!loading && !eventStats && selectedEvent && (
        <EmptyState title="No analytics data" description="Register attendees and record check-ins to see analytics." icon={BarChart2} />
      )}
    </div>
  );
};

export default AnalyticsDashboard;
