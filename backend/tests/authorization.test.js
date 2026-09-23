const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const Event = require('../src/models/Event');
const EventMember = require('../src/models/EventMember');
const { signToken } = require('../src/services/authService');

describe('Authorization', () => {
  let admin, adminToken;
  let organizer1, organizer1Token;
  let user2, user2Token;
  let org, event1;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    admin = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash, role: 'PLATFORM_ADMIN' });
    organizer1 = await User.create({ name: 'Organizer 1', email: 'org1@test.com', passwordHash, role: 'EVENT_ORGANIZER' });
    user2 = await User.create({ name: 'User 2', email: 'user2@test.com', passwordHash, role: 'ATTENDEE' });

    adminToken = signToken(admin);
    organizer1Token = signToken(organizer1);
    user2Token = signToken(user2);

    org = await Organization.create({ name: 'Org 1' });
    event1 = await Event.create({
      organization: org._id,
      name: 'Event 1',
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 2 * 86400000),
      registrationStart: new Date(Date.now() - 86400000),
      registrationEnd: new Date(Date.now() + 86400000),
      createdBy: organizer1._id,
    });

    await EventMember.create({
      event: event1._id,
      user: organizer1._id,
      eventRole: 'ORGANIZER',
      status: 'ACTIVE',
    });
  });

  it('restricts role actions (non-admin cannot access admin-only users endpoint)', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(403);

    expect(res.body.success).toBe(false);

    const adminRes = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(adminRes.body.success).toBe(true);
  });

  it('enforces event-scoped access and prevents unauthorized event modification', async () => {
    const res = await request(app)
      .patch(`/api/v1/events/${event1._id}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ name: 'Hacked Event Name' })
      .expect(403);

    expect(res.body.success).toBe(false);
  });

  it('allows event organizer to update their event', async () => {
    const res = await request(app)
      .patch(`/api/v1/events/${event1._id}`)
      .set('Authorization', `Bearer ${organizer1Token}`)
      .send({ name: 'Updated Event Name' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.event.name).toBe('Updated Event Name');
  });
});
