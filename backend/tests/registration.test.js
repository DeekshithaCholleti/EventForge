const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');
const Coupon = require('../src/models/Coupon');
const Registration = require('../src/models/Registration');
const { signToken } = require('../src/services/authService');

describe('Registration Workflow', () => {
  let attendee, token, org, event, ticketType, coupon;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    attendee = await User.create({ name: 'Attendee', email: 'attendee@test.com', passwordHash, role: 'ATTENDEE' });
    token = signToken(attendee);
    org = await Organization.create({ name: 'Test Org' });
    event = await Event.create({
      organization: org._id,
      name: 'Reg Event',
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 3 * 86400000),
      registrationStart: new Date(Date.now() - 86400000),
      registrationEnd: new Date(Date.now() + 2 * 86400000),
      createdBy: attendee._id,
    });
    ticketType = await TicketType.create({
      event: event._id,
      name: 'Regular Ticket',
      price: 100,
      capacity: 5,
      soldCount: 0,
      salesStart: new Date(Date.now() - 86400000),
      salesEnd: new Date(Date.now() + 2 * 86400000),
    });
    coupon = await Coupon.create({
      event: event._id,
      code: 'SAVE20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxUses: 10,
      validFrom: new Date(Date.now() - 86400000),
      validUntil: new Date(Date.now() + 10 * 86400000),
      isActive: true,
    });
  });

  it('completes successful registration with coupon and generates a ticket', async () => {
    const res = await request(app)
      .post('/api/v1/registrations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        event: event._id,
        ticketType: ticketType._id,
        coupon: 'SAVE20',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.registration.finalAmount).toBe(80);
    expect(res.body.data.ticket).toBeTruthy();
    expect(res.body.data.ticket.uniqueTicketCode).toBeTruthy();
    expect(res.body.data.ticket.qrCodeData).toBeTruthy();
  });

  it('prevents duplicate active registration', async () => {
    await Registration.create({
      event: event._id,
      attendee: attendee._id,
      ticketType: ticketType._id,
      originalAmount: 100,
      discountAmount: 0,
      finalAmount: 100,
      registrationStatus: 'CONFIRMED',
    });

    const res = await request(app)
      .post('/api/v1/registrations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        event: event._id,
        ticketType: ticketType._id,
      })
      .expect(409);

    expect(res.body.success).toBe(false);
  });

  it('places registration on waitlist when capacity is reached', async () => {
    await TicketType.findByIdAndUpdate(ticketType._id, { soldCount: 5 }); // Reach capacity

    const res = await request(app)
      .post('/api/v1/registrations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        event: event._id,
        ticketType: ticketType._id,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.registration.registrationStatus).toBe('WAITLISTED');
    expect(res.body.data.waitlistEntry).toBeTruthy();
  });
});
