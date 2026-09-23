const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/database');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Event = require('../models/Event');
const EventMember = require('../models/EventMember');
const Venue = require('../models/Venue');
const Room = require('../models/Room');
const Session = require('../models/Session');
const TicketType = require('../models/TicketType');
const Coupon = require('../models/Coupon');
const Registration = require('../models/Registration');
const Announcement = require('../models/Announcement');
const Feedback = require('../models/Feedback');
const CheckIn = require('../models/CheckIn');

const seedData = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Organization.deleteMany({}),
    Event.deleteMany({}),
    EventMember.deleteMany({}),
    Venue.deleteMany({}),
    Room.deleteMany({}),
    Session.deleteMany({}),
    TicketType.deleteMany({}),
    Coupon.deleteMany({}),
    Registration.deleteMany({}),
    Announcement.deleteMany({}),
    Feedback.deleteMany({}),
    CheckIn.deleteMany({}),
  ]);

  const adminPassword = await bcrypt.hash('admin123', 10);
  const organizerPassword = await bcrypt.hash('organizer123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const attendeePassword = await bcrypt.hash('attendee123', 10);

  const admin = await User.create({ name: 'Platform Admin', email: 'admin@eventforge.dev', passwordHash: adminPassword, role: 'PLATFORM_ADMIN' });
  const organizer = await User.create({ name: 'Event Organizer', email: 'organizer@eventforge.dev', passwordHash: organizerPassword, role: 'EVENT_ORGANIZER' });
  const staff = await User.create({ name: 'Event Staff', email: 'staff@eventforge.dev', passwordHash: staffPassword, role: 'EVENT_STAFF' });
  const attendee = await User.create({ name: 'Event Attendee', email: 'attendee@eventforge.dev', passwordHash: attendeePassword, role: 'ATTENDEE' });

  const org = await Organization.create({ name: 'EventForge Labs', description: 'Demo organization', contactInformation: { email: 'hello@eventforge.dev' } });
  const event = await Event.create({
    organization: org._id,
    name: 'AI Summit 2026',
    description: 'Conference for AI and enterprise transformation',
    eventType: 'CONFERENCE',
    startDate: new Date(Date.now() + 86400000),
    endDate: new Date(Date.now() + 3 * 86400000),
    registrationStart: new Date(Date.now() - 86400000),
    registrationEnd: new Date(Date.now() + 2 * 86400000),
    location: { venueName: 'Innovation Center', city: 'Seattle', country: 'USA' },
    capacity: 200,
    status: 'PUBLISHED',
    createdBy: admin._id,
  });

  await EventMember.create({ event: event._id, user: organizer._id, eventRole: 'ORGANIZER', status: 'ACTIVE' });
  await EventMember.create({ event: event._id, user: staff._id, eventRole: 'STAFF', status: 'ACTIVE' });
  await EventMember.create({ event: event._id, user: attendee._id, eventRole: 'ATTENDEE', status: 'ACTIVE' });

  const venue = await Venue.create({ organization: org._id, name: 'Innovation Center', address: '101 Main St', city: 'Seattle', state: 'WA', country: 'USA', createdBy: admin._id });
  const room = await Room.create({ venue: venue._id, name: 'Hall A', capacity: 150, facilities: ['Projector', 'WiFi'], status: 'ACTIVE' });

  const session = await Session.create({
    event: event._id,
    title: 'Keynote on AI Operations',
    description: 'A keynote session on AI adoption.',
    sessionType: 'KEYNOTE',
    tags: ['AI', 'Strategy'],
    speakers: [organizer._id],
    room: room._id,
    startTime: new Date(Date.now() + 86400000),
    endTime: new Date(Date.now() + 86400000 + 3600000),
    capacity: 80,
    status: 'PUBLISHED',
    createdBy: admin._id,
  });

  const ticketType = await TicketType.create({ event: event._id, name: 'Early Bird', description: 'Intro offer', price: 150, capacity: 100, salesStart: new Date(Date.now() - 86400000), salesEnd: new Date(Date.now() + 2 * 86400000), status: 'ACTIVE' });
  const coupon = await Coupon.create({ event: event._id, code: 'EARLY10', discountType: 'PERCENTAGE', discountValue: 10, maxUses: 50, validFrom: new Date(Date.now() - 86400000), validUntil: new Date(Date.now() + 10 * 86400000), minimumAmount: 50, isActive: true });
  const registration = await Registration.create({ event: event._id, attendee: attendee._id, ticketType: ticketType._id, coupon: coupon._id, originalAmount: 150, discountAmount: 15, finalAmount: 135, registrationStatus: 'CONFIRMED', paymentStatus: 'PAID', approvalStatus: 'APPROVED' });
  await Announcement.create({ event: event._id, title: 'Welcome note', message: 'Welcome to the event!', targetAudience: 'ALL', status: 'PUBLISHED', publishedAt: new Date(), createdBy: organizer._id });
  await Feedback.create({ event: event._id, session: session._id, attendee: attendee._id, rating: 5, comment: 'Excellent session.' });
  await CheckIn.create({ event: event._id, attendee: attendee._id, ticket: (await require('../models/Ticket').create({ registration: registration._id, event: event._id, attendee: attendee._id, ticketType: ticketType._id, uniqueTicketCode: 'TKT-1001', qrCodeData: 'opaque-id-1001', status: 'ACTIVE', issuedAt: new Date() }))._id, checkedInBy: staff._id, method: 'QR' });

  console.log('Seed data created successfully');
  process.exit(0);
};

seedData().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
