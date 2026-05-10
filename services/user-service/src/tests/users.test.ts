import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../prisma.js';
import { env } from '../config/env.js';

const app = createApp();
const internalHeaders = { 'x-internal-secret': env.INTERNAL_SERVICE_SECRET };
const profile = { googleId: 'g-u', email: 'u@example.com', name: 'U' };

let token: string;
let userId: string;
beforeEach(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  const r = await request(app).post('/auth/google').set(internalHeaders).send(profile);
  token = r.body.data.accessToken;
  userId = r.body.data.user.id;
});
afterAll(async () => { await prisma.$disconnect(); });

describe('GET /users/me', () => {
  it('returns current user', async () => {
    const res = await request(app).get('/users/me').set('authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(userId);
  });
  it('rejects no token', async () => {
    const res = await request(app).get('/users/me');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('PA-AUTH-001');
  });
});

describe('GET /users/:id', () => {
  it('returns public profile', async () => {
    const res = await request(app).get(`/users/${userId}`).set('authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: userId, name: 'U', avatarUrl: null });
  });
  it('404 for missing', async () => {
    const res = await request(app).get('/users/missing').set('authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('PA-RES-001');
  });
});
