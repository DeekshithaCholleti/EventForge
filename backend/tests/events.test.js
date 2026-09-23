const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const Event = require('../src/models/Event');
const EventMember = require('../src/models/EventMember');
const { signToken } = require('../src/services/authService');

describe('Events API', () => {
  let organizer, token, org;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    organizer = await User.create({ name: 'Organizer', email: 'org@test.com', passwordHash, role: 'EVENT_ORGANIZER' });
    token = signToken(organizer);
    org = await Organization.create({ name: 'Test Org' });
  });

  it('creates an event successfully', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        organization: org._id,
        name: 'New Event',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        registrationStart: new Date(Date.now() - 86400000).toISOString(),
        registrationEnd: new Date(Date.now() + 86400000).toISOString(),
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.event.name).toBe('New Event');
  });

  it('rejects invalid dates (endDate before startDate)', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        organization: org._id,
        name: 'Invalid Dates Event',
        startDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        registrationStart: new Date(Date.now() - 86400000).toISOString(),
        registrationEnd: new Date(Date.now() + 86400000).toISOString(),
      })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('updates an event', async () => {
    const event = await Event.create({
      organization: org._id,
      name: 'Old Title',
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 2 * 86400000),
      registrationStart: new Date(Date.now() - 86400000),
      registrationEnd: new Date(Date.now() + 86400000),
      createdBy: organizer._id,
    });

    await EventMember.create({
      event: event._id,
      user: organizer._id,
      eventRole: 'ORGANIZER',
      status: 'ACTIVE',
    });

    const res = await request(app)
      .patch(`/api/v1/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Title' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.event.name).toBe('New Title');
  });

  it('deletes an event', async () => {
    const event = await Event.create({
      organization: org._id,
      name: 'To Delete',
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 2 * 86400000),
      registrationStart: new Date(Date.now() - 86400000),
      registrationEnd: new Date(Date.now() + 86400000),
      createdBy: organizer._id,
    });

    await EventMember.create({
      event: event._id,
      user: organizer._id,
      eventRole: 'ORGANIZER',
      status: 'ACTIVE',
    });

    const res = await request(app)
      .delete(`/api/v1/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});
