import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('GET /api/v1/health', () => {
  it('should return health check response with correct shape', async () => {
    const res = await request(app).get('/api/v1/health').expect('Content-Type', /json/);

    expect([200, 503]).toContain(res.status);

    expect(res.body).toHaveProperty('backend');
    expect(res.body).toHaveProperty('supabase');
    expect(res.body).toHaveProperty('prisma');
    expect(res.body).toHaveProperty('latency');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('timestamp');

    // Type checks
    expect(typeof res.body.backend).toBe('string');
    expect(typeof res.body.supabase).toBe('string');
    expect(typeof res.body.prisma).toBe('string');
    expect(typeof res.body.latency).toBe('string');
    expect(typeof res.body.version).toBe('string');
    expect(typeof res.body.timestamp).toBe('string');

    // Value checks
    expect(['healthy', 'unhealthy']).toContain(res.body.backend);
    expect(['connected', 'disconnected']).toContain(res.body.supabase);
    expect(['connected', 'disconnected']).toContain(res.body.prisma);
    expect(res.body.version).toBe('0.1.0');
  });

  it('should include X-Request-Id header in response', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.headers['x-request-id']).toBeDefined();
    expect(typeof res.headers['x-request-id']).toBe('string');
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent').expect(404);

    expect(res.body).toMatchObject({
      success: false,
      code: 'ROUTE_NOT_FOUND',
    });
  });
});
