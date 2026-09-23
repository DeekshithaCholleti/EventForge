const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const Event = require('../src/models/Event');
const Venue = require('../src/models/Venue');
const Room = require('../src/models/Room');
const Session = require('../src/models/Session');
const { signToken } = require('../src/services/authService');

describe('Sessions & Conflict Detection', () => {
  let user, token, org, event, venue, room, speaker;
  let start1, end1;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    user = await User.create({ name: 'Organizer', email: 'org@test.com', passwordHash, role: 'EVENT_ORGANIZER' });
    speaker = await User.create({ name: 'Speaker 1', email: 'speaker@test.com', passwordHash, role: 'SPEAKER' });
    token = signToken(user);
    org = await Organization.create({ name: 'Test Org' });
    event = await Event.create({
      organization: org._id,
      name: 'Session Event',
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 3 * 86400000),
      registrationStart: new Date(Date.now() - 86400000),
      registrationEnd: new Date(Date.now() + 86400000),
      createdBy: user._id,
    });
    venue = await Venue.create({ organization: org._id, name: 'Main Venue', address: '123 St', city: 'City', country: 'Country', createdBy: user._id });
    room = await Room.create({ venue: venue._id, name: 'Room 101', capacity: 100 });

    start1 = new Date(Date.now() + 86400000);
    end1 = new Date(Date.now() + 86400000 + 3600000);
  });

  it('creates a session', async () => {
    const res = await request(app)
      .post('/api/v1/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        event: event._id,
        title: 'Keynote',
        room: room._id,
        speakers: [speaker._id],
        startTime: start1.toISOString(),
        endTime: end1.toISOString(),
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.session.title).toBe('Keynote');
  });

  it('detects room conflict on overlapping time', async () => {
    await Session.create({
      event: event._id,
      title: 'Existing Session',
      room: room._id,
      speakers: [],
      startTime: start1,
      endTime: end1,
      createdBy: user._id,
    });

    const res = await request(app)
      .post('/api/v1/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        event: event._id,
        title: 'Conflicting Session',
        room: room._id,
        speakers: [],
        startTime: new Date(start1.getTime() + 1800000).toISOString(),
        endTime: new Date(end1.getTime() + 1800000).toISOString(),
      })
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Room conflict/i);
  });

  it('detects speaker conflict on overlapping time', async () => {
    const room2 = await Room.create({ venue: venue._id, name: 'Room 102', capacity: 50 });

    await Session.create({
      event: event._id,
      title: 'Speaker Session 1',
      room: room._id,
      speakers: [speaker._id],
      startTime: start1,
      endTime: end1,
      createdBy: user._id,
    });

    const res = await request(app)
      .post('/api/v1/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        event: event._id,
        title: 'Speaker Session 2',
        room: room2._id,
        speakers: [speaker._id],
        startTime: new Date(start1.getTime() + 1800000).toISOString(),
        endTime: new Date(end1.getTime() + 1800000).toISOString(),
      })
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Speaker conflict/i);
  });
});
