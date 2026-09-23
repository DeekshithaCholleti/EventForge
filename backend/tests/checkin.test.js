const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const Event = require('../src/models/Event');
const EventMember = require('../src/models/EventMember');
const TicketType = require('../src/models/TicketType');
const Registration = require('../src/models/Registration');
const Ticket = require('../src/models/Ticket');
const CheckIn = require('../src/models/CheckIn');
const { signToken } = require('../src/services/authService');

describe('Check-In API & QR Validation', () => {
  let staff, staffToken, unauthorizedUser, unauthorizedToken, attendee, org, event, ticketType, registration, ticket;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    staff = await User.create({ name: 'Staff Member', email: 'staff@test.com', passwordHash, role: 'EVENT_STAFF' });
    unauthorizedUser = await User.create({ name: 'Rando User', email: 'rando@test.com', passwordHash, role: 'ATTENDEE' });
    attendee = await User.create({ name: 'Attendee', email: 'att@test.com', passwordHash, role: 'ATTENDEE' });

    staffToken = signToken(staff);
    unauthorizedToken = signToken(unauthorizedUser);

    org = await Organization.create({ name: 'Org' });
    event = await Event.create({
      organization: org._id,
      name: 'Checkin Event',
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 2 * 86400000),
      registrationStart: new Date(Date.now() - 86400000),
      registrationEnd: new Date(Date.now() + 86400000),
      createdBy: staff._id,
    });

    await EventMember.create({
      event: event._id,
      user: staff._id,
      eventRole: 'STAFF',
      status: 'ACTIVE',
    });

    ticketType = await TicketType.create({
      event: event._id,
      name: 'VIP',
      price: 200,
      capacity: 50,
      salesStart: new Date(Date.now() - 86400000),
      salesEnd: new Date(Date.now() + 2 * 86400000),
    });

    registration = await Registration.create({
      event: event._id,
      attendee: attendee._id,
      ticketType: ticketType._id,
      originalAmount: 200,
      discountAmount: 0,
      finalAmount: 200,
      registrationStatus: 'CONFIRMED',
    });

    ticket = await Ticket.create({
      registration: registration._id,
      event: event._id,
      attendee: attendee._id,
      ticketType: ticketType._id,
      uniqueTicketCode: 'TKT-VALID-123',
      qrCodeData: 'QR-VALID-123',
      status: 'ACTIVE',
    });
  });

  it('checks in a valid ticket successfully using QR code data', async () => {
    const res = await request(app)
      .post('/api/v1/checkins')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        ticket: 'QR-VALID-123',
        event: event._id,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.checkIn).toBeTruthy();
    expect(res.body.data.ticket.status).toBe('USED');
  });

  it('rejects duplicate check-in', async () => {
    await CheckIn.create({
      event: event._id,
      attendee: attendee._id,
      ticket: ticket._id,
      checkedInBy: staff._id,
    });

    const res = await request(app)
      .post('/api/v1/checkins')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        ticket: ticket._id.toString(),
        event: event._id,
      })
      .expect(409);

    expect(res.body.success).toBe(false);
  });

  it('rejects check-in by unauthorized user without event staff role', async () => {
    const res = await request(app)
      .post('/api/v1/checkins')
      .set('Authorization', `Bearer ${unauthorizedToken}`)
      .send({
        ticket: 'TKT-VALID-123',
        event: event._id,
      })
      .expect(403);

    expect(res.body.success).toBe(false);
  });

  it('rejects invalid/nonexistent ticket', async () => {
    const res = await request(app)
      .post('/api/v1/checkins')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        ticket: 'INVALID-CODE',
        event: event._id,
      })
      .expect(404);

    expect(res.body.success).toBe(false);
  });
});
