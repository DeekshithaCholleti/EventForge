const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'EventForge backend healthy', data: { status: 'ok' } });
});

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const eventRoutes = require('./routes/eventRoutes');
const eventMemberRoutes = require('./routes/eventMemberRoutes');
const venueRoutes = require('./routes/venueRoutes');
const roomRoutes = require('./routes/roomRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const speakerRoutes = require('./routes/speakerRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const sponsorshipPackageRoutes = require('./routes/sponsorshipPackageRoutes');
const sponsorAssignmentRoutes = require('./routes/sponsorAssignmentRoutes');
const ticketTypeRoutes = require('./routes/ticketTypeRoutes');
const couponRoutes = require('./routes/couponRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const waitlistRoutes = require('./routes/waitlistRoutes');
const checkInRoutes = require('./routes/checkInRoutes');
const sessionAttendanceRoutes = require('./routes/sessionAttendanceRoutes');
const staffAssignmentRoutes = require('./routes/staffAssignmentRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/event-members', eventMemberRoutes);
app.use('/api/v1/venues', venueRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/speakers', speakerRoutes);
app.use('/api/v1/sponsors', sponsorRoutes);
app.use('/api/v1/sponsorship-packages', sponsorshipPackageRoutes);
app.use('/api/v1/sponsor-assignments', sponsorAssignmentRoutes);
app.use('/api/v1/ticket-types', ticketTypeRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/registrations', registrationRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/waitlists', waitlistRoutes);
app.use('/api/v1/checkins', checkInRoutes);
app.use('/api/v1/session-attendance', sessionAttendanceRoutes);
app.use('/api/v1/staff-assignments', staffAssignmentRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
