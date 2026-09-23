import React, { useState } from 'react';
import { checkInAPI } from '../../api';
import { ScanLine, CheckCircle, XCircle, AlertTriangle, User, Ticket as TicketIcon } from 'lucide-react';
import { LoadingSpinner } from '../../components/UI';

const CheckInPage = () => {
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;
    
    setLoading(true);
    setResult(null);
    try {
      const res = await checkInAPI.create({ ticket: ticketInput.trim() });
      setResult({ type: 'success', data: res.data });
      setTicketInput('');
    } catch (err) {
      setResult({ type: 'error', message: err.message || 'Check-in failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Staff Check-in Terminal</h1>
        <p style={{ color: '#64748b' }}>Scan QR code or enter ticket ID to check in attendees</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleCheckIn} style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <ScanLine size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="form-control"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Enter Ticket Code (e.g., TKT-123456) or scan QR"
              autoFocus
              style={{ paddingLeft: '2.75rem', fontSize: '1.1rem', padding: '1rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !ticketInput.trim()} style={{ padding: '0 1.5rem' }}>
            Check In
          </button>
        </form>
      </div>

      {loading && <LoadingSpinner />}

      {result?.type === 'success' && (
        <div className="card" style={{ border: '2px solid #10b981', background: '#f0fdf4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: '#047857' }}>
            <CheckCircle size={32} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Check-in Successful!</h2>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Time: {new Date(result.data.checkIn?.checkedInAt || new Date()).toLocaleTimeString()}</p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User size={20} style={{ color: '#64748b' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Attendee</div>
                <div style={{ fontWeight: 600 }}>{result.data.attendee?.name || 'Unknown'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <TicketIcon size={20} style={{ color: '#64748b' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Ticket</div>
                <div style={{ fontWeight: 600 }}>{result.data.ticket?.uniqueTicketCode || 'Valid Ticket'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {result?.type === 'error' && (
        <div className="card" style={{ border: '2px solid #ef4444', background: '#fef2f2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#b91c1c' }}>
            {result.message.toLowerCase().includes('already') ? <AlertTriangle size={32} /> : <XCircle size={32} />}
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Check-in Failed</h2>
              <p style={{ margin: 0, fontWeight: 500 }}>{result.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInPage;
