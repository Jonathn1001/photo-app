import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app.js';
import { prisma } from '../prisma.js';
import { env } from '../config/env.js';

// Mock cloudinary so no real HTTP calls
vi.mock('../services/cloudinary.service.js', () => ({
  cloudinaryService: {
    signUpload: vi.fn(() => ({
      timestamp: 1234567890,
      upload_preset: 'test',
      folder: 'photos',
      signature: 'mock-sig',
      apiKey: 'test',
      cloudName: 'test',
    })),
    destroy: vi.fn(() => Promise.resolve()),
  },
}));

const app = createApp();

function makeToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '1h' });
}

const userId = 'user-photo-test-1';
const otherUserId = 'user-photo-test-2';
let token: string;
let otherToken: string;

beforeEach(async () => {
  await prisma.comment.deleteMany();
  await prisma.photo.deleteMany();
  token = makeToken(userId);
  otherToken = makeToken(otherUserId);
});
afterAll(async () => {
  await prisma.comment.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.$disconnect();
});

describe('POST /photos/sign-upload', () => {
  it('returns signed upload params', async () => {
    const res = await request(app)
      .post('/photos/sign-upload')
      .set('authorization', `Bearer ${token}`)
      .send({ filename: 'photo.jpg', mimeType: 'image/jpeg', bytes: 100000 });
    expect(res.status).toBe(200);
    expect(res.body.data.signature).toBeDefined();
    expect(res.body.data.cloudName).toBeDefined();
  });

  it('rejects unauthenticated', async () => {
    const res = await request(app)
      .post('/photos/sign-upload')
      .send({ filename: 'photo.jpg', mimeType: 'image/jpeg', bytes: 100000 });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('PA-AUTH-001');
  });

  it('rejects invalid body', async () => {
    const res = await request(app)
      .post('/photos/sign-upload')
      .set('authorization', `Bearer ${token}`)
      .send({ filename: '', mimeType: 'image/gif', bytes: -1 });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('PA-VAL-001');
  });
});

describe('POST /photos', () => {
  it('creates a photo', async () => {
    const res = await request(app)
      .post('/photos')
      .set('authorization', `Bearer ${token}`)
      .send({ publicId: 'photos/test.jpg', url: 'https://res.cloudinary.com/test/image/upload/photos/test.jpg', width: 1920, height: 1080, bytes: 204800, format: 'jpg' });
    expect(res.status).toBe(201);
    expect(res.body.data.ownerId).toBe(userId);
    expect(res.body.data.publicId).toBe('photos/test.jpg');
  });

  it('rejects publicId not starting with photos/', async () => {
    const res = await request(app)
      .post('/photos')
      .set('authorization', `Bearer ${token}`)
      .send({ publicId: 'bad/test.jpg', url: 'https://res.cloudinary.com/test/image/upload/bad/test.jpg', width: 1920, height: 1080, bytes: 204800, format: 'jpg' });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('PA-FILE-003');
  });

  it('rejects unauthenticated', async () => {
    const res = await request(app)
      .post('/photos')
      .send({ publicId: 'photos/test.jpg', url: 'https://res.cloudinary.com/test/image/upload/photos/test.jpg', width: 1920, height: 1080, bytes: 204800, format: 'jpg' });
    expect(res.status).toBe(401);
  });
});

describe('GET /photos/:id', () => {
  it('returns photo with comments', async () => {
    const created = await request(app)
      .post('/photos')
      .set('authorization', `Bearer ${token}`)
      .send({ publicId: 'photos/get-test.jpg', url: 'https://res.cloudinary.com/test/image/upload/photos/get-test.jpg', width: 800, height: 600, bytes: 50000, format: 'jpg' });
    const id = created.body.data.id;

    const res = await request(app).get(`/photos/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
    expect(Array.isArray(res.body.data.comments)).toBe(true);
  });

  it('returns 404 for missing photo', async () => {
    const res = await request(app).get('/photos/nonexistent-id');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('PA-RES-002');
  });
});

describe('DELETE /photos/:id', () => {
  it('deletes own photo', async () => {
    const created = await request(app)
      .post('/photos')
      .set('authorization', `Bearer ${token}`)
      .send({ publicId: 'photos/del-test.jpg', url: 'https://res.cloudinary.com/test/image/upload/photos/del-test.jpg', width: 800, height: 600, bytes: 50000, format: 'jpg' });
    const id = created.body.data.id;

    const res = await request(app).delete(`/photos/${id}`).set('authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it('forbids deleting other user photo', async () => {
    const created = await request(app)
      .post('/photos')
      .set('authorization', `Bearer ${token}`)
      .send({ publicId: 'photos/other-del.jpg', url: 'https://res.cloudinary.com/test/image/upload/photos/other-del.jpg', width: 800, height: 600, bytes: 50000, format: 'jpg' });
    const id = created.body.data.id;

    const res = await request(app).delete(`/photos/${id}`).set('authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PA-AUTH-010');
  });

  it('returns 404 for missing photo', async () => {
    const res = await request(app).delete('/photos/nonexistent-id').set('authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('PA-RES-002');
  });
});

describe('GET /photos (feed)', () => {
  it('returns paginated feed', async () => {
    await request(app)
      .post('/photos')
      .set('authorization', `Bearer ${token}`)
      .send({ publicId: 'photos/feed1.jpg', url: 'https://res.cloudinary.com/test/image/upload/photos/feed1.jpg', width: 800, height: 600, bytes: 50000, format: 'jpg' });

    const res = await request(app).get('/photos?limit=10');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });
});

describe('GET /users/:userId/photos', () => {
  it('returns photos for a specific user', async () => {
    await request(app)
      .post('/photos')
      .set('authorization', `Bearer ${token}`)
      .send({ publicId: 'photos/user-feed1.jpg', url: 'https://res.cloudinary.com/test/image/upload/photos/user-feed1.jpg', width: 800, height: 600, bytes: 50000, format: 'jpg' });

    const res = await request(app).get(`/users/${userId}/photos`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items.every((p: any) => p.ownerId === userId)).toBe(true);
  });
});
