import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, LogOut, Shield, QrCode, Sparkles, BarChart2, PlusCircle, BookmarkCheck, CheckSquare, Layers, Users, Mic2, Building2 } from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header-wrapper">

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="brand-logo">
            <Calendar size={28} />
            <span>EventForge</span>
          </Link>

          <ul className="nav-links">
            <li>
              <Link to="/events" className={`nav-item ${isActive('/events') ? 'active' : ''}`}>
                <Calendar size={18} />
                <span>Events</span>
              </Link>
            </li>

            {user ? (
              <>
                {/* Role Specific Routes */}
                {(role === 'ATTENDEE') && (
                  <li>
                    <Link to="/my-tickets" className={`nav-item ${isActive('/my-tickets') ? 'active' : ''}`}>
                      <BookmarkCheck size={18} />
                      <span>My Tickets</span>
                    </Link>
                  </li>
                )}

                {(role === 'EVENT_ORGANIZER') && (
                  <>
                    <li>
                      <Link to="/organizer/dashboard" className={`nav-item ${isActive('/organizer/dashboard') ? 'active' : ''}`}>
                        <Layers size={18} />
                        <span>Organizer Dashboard</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/organizer/team" className={`nav-item ${isActive('/organizer/team') ? 'active' : ''}`}>
                        <Users size={18} />
                        <span>Event Team</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/organizer/ai-assistant" className={`nav-item ${isActive('/organizer/ai-assistant') ? 'active' : ''}`}>
                        <Sparkles size={18} style={{ color: '#8b5cf6' }} />
                        <span>AI Assistant</span>
                      </Link>
                    </li>
                  </>
                )}

                {(role === 'PLATFORM_ADMIN') && (
                  <li>
                    <Link to="/admin/dashboard" className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}>
                      <Shield size={18} style={{ color: '#7c3aed' }} />
                      <span>Admin Panel</span>
                    </Link>
                  </li>
                )}

                {(role === 'SPEAKER') && (
                  <li>
                    <Link to="/speaker/dashboard" className={`nav-item ${isActive('/speaker/dashboard') ? 'active' : ''}`}>
                      <Mic2 size={18} style={{ color: '#db2777' }} />
                      <span>Speaker Dashboard</span>
                    </Link>
                  </li>
                )}

                {(role === 'SPONSOR') && (
                  <li>
                    <Link to="/sponsor/dashboard" className={`nav-item ${isActive('/sponsor/dashboard') ? 'active' : ''}`}>
                      <Building2 size={18} style={{ color: '#10b981' }} />
                      <span>Sponsor Dashboard</span>
                    </Link>
                  </li>
                )}

                {(role === 'EVENT_STAFF') && (
                  <li>
                    <Link to="/staff/dashboard" className={`nav-item ${isActive('/staff/dashboard') || isActive('/staff/checkin') ? 'active' : ''}`}>
                      <QrCode size={18} />
                      <span>Staff Dashboard</span>
                    </Link>
                  </li>
                )}

                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.85rem', textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    <span className={`badge badge-${role.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{role}</span>
                  </div>
                  <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log Out">
                    <LogOut size={16} />
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                </li>
                <li>
                  <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};
