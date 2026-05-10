import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../prisma.js';
import { env } from '../config/env.js';

const app = createApp();
const internalHeaders = { 'x-internal-secret': env.INTERNAL_SERVICE_SECRET };
const profile = { googleId: 'g-test-1', email: 't@example.com', name: 'Tester' };

beforeEach(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});
afterAll(async () => { await prisma.$disconnect(); });

describe('POST /auth/google', () => {
  it('rejects without internal secret', async () => {
    const res = await request(app).post('/auth/google').send(profile);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PA-AUTH-011');
  });
  it('upserts user and returns tokens', async () => {
    const res = await request(app).post('/auth/google').set(internalHeaders).send(profile);
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe(profile.email);
  });
  it('rejects invalid profile', async () => {
    const res = await request(app).post('/auth/google').set(internalHeaders).send({ googleId: '' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('PA-VAL-001');
  });
});

describe('POST /auth/refresh', () => {
  it('rotates tokens', async () => {
    const r1 = await request(app).post('/auth/google').set(internalHeaders).send(profile);
    const refreshToken = r1.body.data.refreshToken;
    const r2 = await request(app).post('/auth/refresh').send({ refreshToken });
    expect(r2.status).toBe(200);
    expect(r2.body.data.accessToken).toBeDefined();
    expect(r2.body.data.refreshToken).not.toBe(refreshToken);
  });
  it('rejects revoked token', async () => {
    const r1 = await request(app).post('/auth/google').set(internalHeaders).send(profile);
    const refreshToken = r1.body.data.refreshToken;
    await request(app).post('/auth/refresh').send({ refreshToken });
    const r3 = await request(app).post('/auth/refresh').send({ refreshToken });
    expect(r3.status).toBe(401);
    expect(r3.body.code).toBe('PA-AUTH-004');
  });
});
