const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Authentication', () => {
  it('registers a user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  it('logs in a user', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Login User',
      email: 'login@example.com',
      passwordHash,
      role: 'ATTENDEE',
      isActive: true,
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'password123' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
  });

  it('rejects invalid login', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'missing@example.com', password: 'wrongpass' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('protects a route without token', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('rejects inactive user', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Inactive User',
      email: 'inactive@example.com',
      passwordHash,
      role: 'ATTENDEE',
      isActive: false,
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'inactive@example.com', password: 'password123' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });
});
