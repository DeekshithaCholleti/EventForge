import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      // Navigate based on role
      const roleRoutes = {
        PLATFORM_ADMIN: '/admin/dashboard',
        EVENT_ORGANIZER: '/organizer/dashboard',
        EVENT_STAFF: '/staff/checkin',
        ATTENDEE: '/events',
        SPEAKER: '/events',
        SPONSOR: '/events',
      };
      navigate(roleRoutes[user.role] || '/events');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (email, pass) => {
    setFormData({ email, password: pass });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8efff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Calendar size={36} style={{ color: '#4f46e5' }} />
            <span style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>EventForge</span>
          </div>
          <p style={{ color: '#64748b' }}>Sign in to your account</p>
        </div>

        <div className="card">
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: 600 }}>🚀 Quick Login:</p>
            <button
              type="button"
              onClick={() => quickFill('admin@eventforge.dev', 'admin123')}
              style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500, textAlign: 'left', transition: 'all 0.15s' }}
            >
              🛡 Platform Admin
              <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>admin@eventforge.dev · admin123</div>
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: '#64748b' }}>
            No account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
