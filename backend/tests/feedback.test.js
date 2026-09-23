const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const Event = require('../src/models/Event');
const Room = require('../src/models/Room');
const Venue = require('../src/models/Venue');
const Session = require('../src/models/Session');
const Feedback = require('../src/models/Feedback');
const { signToken } = require('../src/services/authService');

describe('Feedback API', () => {
  let attendee, token, org, event, session;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    attendee = await User.create({ name: 'Feedback Attendee', email: 'fb@test.com', passwordHash, role: 'ATTENDEE' });
    token = signToken(attendee);
    org = await Organization.create({ name: 'Org' });
    event = await Event.create({
      organization: org._id,
      name: 'FB Event',
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 2 * 86400000),
      registrationStart: new Date(Date.now() - 86400000),
      registrationEnd: new Date(Date.now() + 86400000),
      createdBy: attendee._id,
    });
    const venue = await Venue.create({ organization: org._id, name: 'V', address: '123 St', city: 'City', country: 'Country', createdBy: attendee._id });
    const room = await Room.create({ venue: venue._id, name: 'R', capacity: 50 });

    session = await Session.create({
      event: event._id,
      title: 'Session 1',
      room: room._id,
      startTime: new Date(Date.now() + 86400000),
      endTime: new Date(Date.now() + 86400000 + 3600000),
      createdBy: attendee._id,
    });
  });

  it('submits valid feedback', async () => {
    const res = await request(app)
      .post('/api/v1/feedback')
      .set('Authorization', `Bearer ${token}`)
      .send({
        event: event._id,
        session: session._id,
        rating: 5,
        comment: 'Great session!',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.item.rating).toBe(5);
  });

  it('rejects invalid rating (< 1 or > 5)', async () => {
    const res = await request(app)
      .post('/api/v1/feedback')
      .set('Authorization', `Bearer ${token}`)
      .send({
        event: event._id,
        session: session._id,
        rating: 10,
      })
      .expect(422);

    expect(res.body.success).toBe(false);
  });

  it('updates feedback on duplicate submission for same session and attendee', async () => {
    await Feedback.create({
      event: event._id,
      session: session._id,
      attendee: attendee._id,
      rating: 3,
      comment: 'Initial comment',
    });

    const res = await request(app)
      .post('/api/v1/feedback')
      .set('Authorization', `Bearer ${token}`)
      .send({
        event: event._id,
        session: session._id,
        rating: 4,
        comment: 'Updated comment',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.item.rating).toBe(4);
    expect(res.body.data.item.comment).toBe('Updated comment');
  });
});
