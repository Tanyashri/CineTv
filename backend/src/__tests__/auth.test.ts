import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('Auth Endpoints & Input Validation', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should fail validation when email is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should fail validation when password is too short', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'user@example.com',
          password: '123',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should fail validation when email is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'password123',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should fail validation when email is missing or invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'not-an-email' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Protected Routes Security', () => {
    it('GET /api/v1/auth/me should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/auth/me').expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/v1/auth/logout should reject unauthenticated requests', async () => {
      const res = await request(app).post('/api/v1/auth/logout').expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('PUT /api/v1/auth/profile should reject unauthenticated requests', async () => {
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .send({ fullName: 'New Name' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/v1/auth/google', () => {
    it('should return Google OAuth authorization URL', async () => {
      const res = await request(app).get('/api/v1/auth/google').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toContain('provider=google');
    });
  });
});
