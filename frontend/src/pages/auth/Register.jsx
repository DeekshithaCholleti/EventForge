import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, AlertCircle } from 'lucide-react';

const ROLES = [
  { value: 'ATTENDEE', label: '🎟 Attendee' },
  { value: 'EVENT_ORGANIZER', label: '🎪 Event Organizer' },
  { value: 'EVENT_STAFF', label: '📋 Event Staff' },
  { value: 'SPEAKER', label: '🎤 Speaker' },
  { value: 'SPONSOR', label: '💼 Sponsor' },
];

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'ATTENDEE' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await register(formData);
      navigate(user.role === 'EVENT_ORGANIZER' ? '/organizer/dashboard' : user.role === 'EVENT_STAFF' ? '/staff/checkin' : '/events');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8efff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Calendar size={32} style={{ color: '#4f46e5' }} />
            <span style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>EventForge</span>
          </div>
          <p style={{ color: '#64748b' }}>Create your account</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-danger"><AlertCircle size={16} /> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Jane Doe" required minLength={2} autoFocus />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-control" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="At least 6 characters" required />
            </div>
            <div className="form-group">
              <label>Your Role</label>
              <select className="form-control" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: '#64748b' }}>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
