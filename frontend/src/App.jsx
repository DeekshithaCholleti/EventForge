import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoadingSpinner } from './components/UI';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EventsPage from './pages/public/EventsPage';
import EventDetail from './pages/public/EventDetail';
import MyTickets from './pages/attendee/MyTickets';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import SessionsManager from './pages/organizer/SessionsManager';
import AnalyticsDashboard from './pages/organizer/AnalyticsDashboard';
import AIAssistantPage from './pages/organizer/AIAssistantPage';
import TicketTypesPage from './pages/organizer/TicketTypesPage';
import CouponsPage from './pages/organizer/CouponsPage';
import AnnouncementsPage from './pages/organizer/AnnouncementsPage';
import EventTeamPage from './pages/organizer/EventTeamPage';
import CheckInPage from './pages/staff/CheckInPage';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import SpeakerDashboard from './pages/speaker/SpeakerDashboard';
import SponsorDashboard from './pages/sponsor/SponsorDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>;
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to default home based on role
    if (user.role === 'PLATFORM_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'EVENT_ORGANIZER') return <Navigate to="/organizer/dashboard" replace />;
    if (user.role === 'EVENT_STAFF') return <Navigate to="/staff/checkin" replace />;
    if (user.role === 'SPEAKER') return <Navigate to="/speaker/dashboard" replace />;
    if (user.role === 'SPONSOR') return <Navigate to="/sponsor/dashboard" replace />;
    return <Navigate to="/events" replace />;
  }

  return children;
};

const App = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollMotion = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      setScrollProgress(progress);
      document.documentElement.style.setProperty('--parallax-back', `${window.scrollY * -0.04}px`);
      document.documentElement.style.setProperty('--parallax-front', `${window.scrollY * -0.1}px`);
    };

    updateScrollMotion();
    window.addEventListener('scroll', updateScrollMotion, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollMotion);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} aria-hidden="true" />
      <Navbar />
      <main className="main-content" style={{ flex: 1 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetail />} />

          {/* Attendee Routes */}
          <Route path="/my-tickets" element={
            <ProtectedRoute allowedRoles={['ATTENDEE', 'SPEAKER', 'SPONSOR', 'EVENT_ORGANIZER', 'PLATFORM_ADMIN']}>
              <MyTickets />
            </ProtectedRoute>
          } />

          {/* Organizer Routes */}
          <Route path="/organizer/dashboard" element={
            <ProtectedRoute allowedRoles={['EVENT_ORGANIZER', 'PLATFORM_ADMIN']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/organizer/sessions" element={
            <ProtectedRoute allowedRoles={['EVENT_ORGANIZER', 'PLATFORM_ADMIN']}>
              <SessionsManager />
            </ProtectedRoute>
          } />
          <Route path="/organizer/analytics" element={
            <ProtectedRoute allowedRoles={['EVENT_ORGANIZER', 'PLATFORM_ADMIN']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/organizer/ticket-types" element={
            <ProtectedRoute allowedRoles={['EVENT_ORGANIZER', 'PLATFORM_ADMIN']}>
              <TicketTypesPage />
            </ProtectedRoute>
          } />
          <Route path="/organizer/coupons" element={
            <ProtectedRoute allowedRoles={['EVENT_ORGANIZER', 'PLATFORM_ADMIN']}>
              <CouponsPage />
            </ProtectedRoute>
          } />
          <Route path="/organizer/announcements" element={
            <ProtectedRoute allowedRoles={['EVENT_ORGANIZER', 'PLATFORM_ADMIN']}>
              <AnnouncementsPage />
            </ProtectedRoute>
          } />
          <Route path="/organizer/ai-assistant" element={
            <ProtectedRoute allowedRoles={['EVENT_ORGANIZER', 'PLATFORM_ADMIN']}>
              <AIAssistantPage />
            </ProtectedRoute>
          } />
          <Route path="/organizer/team" element={
            <ProtectedRoute allowedRoles={['EVENT_ORGANIZER', 'PLATFORM_ADMIN']}>
              <EventTeamPage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Speaker Routes */}
          <Route path="/speaker/dashboard" element={
            <ProtectedRoute allowedRoles={['SPEAKER', 'PLATFORM_ADMIN']}>
              <SpeakerDashboard />
            </ProtectedRoute>
          } />

          {/* Sponsor Routes */}
          <Route path="/sponsor/dashboard" element={
            <ProtectedRoute allowedRoles={['SPONSOR', 'PLATFORM_ADMIN']}>
              <SponsorDashboard />
            </ProtectedRoute>
          } />

          {/* Staff Routes */}
          <Route path="/staff/dashboard" element={
            <ProtectedRoute allowedRoles={['EVENT_STAFF', 'EVENT_ORGANIZER', 'PLATFORM_ADMIN']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/staff/checkin" element={
            <ProtectedRoute allowedRoles={['EVENT_STAFF', 'EVENT_ORGANIZER', 'PLATFORM_ADMIN']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
