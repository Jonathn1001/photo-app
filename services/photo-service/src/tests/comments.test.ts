import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app.js';
import { prisma } from '../prisma.js';
import { env } from '../config/env.js';

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

const userId = 'user-comment-test-1';
const otherUserId = 'user-comment-test-2';
let token: string;
let otherToken: string;
let photoId: string;

beforeEach(async () => {
  await prisma.comment.deleteMany();
  await prisma.photo.deleteMany();
  token = makeToken(userId);
  otherToken = makeToken(otherUserId);

  // Create a photo to comment on
  const res = await request(app)
    .post('/photos')
    .set('authorization', `Bearer ${token}`)
    .send({ publicId: 'photos/comment-photo.jpg', url: 'https://res.cloudinary.com/test/image/upload/photos/comment-photo.jpg', width: 800, height: 600, bytes: 50000, format: 'jpg' });
  photoId = res.body.data.id;
});
afterAll(async () => {
  await prisma.comment.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.$disconnect();
});

describe('POST /photos/:id/comments', () => {
  it('adds a comment', async () => {
    const res = await request(app)
      .post(`/photos/${photoId}/comments`)
      .set('authorization', `Bearer ${token}`)
      .send({ content: 'Great photo!' });
    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe('Great photo!');
    expect(res.body.data.authorId).toBe(userId);
    expect(res.body.data.photoId).toBe(photoId);
  });

  it('rejects empty comment', async () => {
    const res = await request(app)
      .post(`/photos/${photoId}/comments`)
      .set('authorization', `Bearer ${token}`)
      .send({ content: '' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('PA-VAL-001');
  });

  it('rejects unauthenticated', async () => {
    const res = await request(app)
      .post(`/photos/${photoId}/comments`)
      .send({ content: 'Hello' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('PA-AUTH-001');
  });

  it('returns 404 for missing photo', async () => {
    const res = await request(app)
      .post('/photos/nonexistent-photo/comments')
      .set('authorization', `Bearer ${token}`)
      .send({ content: 'Hello' });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('PA-RES-002');
  });
});

describe('DELETE /comments/:id', () => {
  it('deletes own comment', async () => {
    const created = await request(app)
      .post(`/photos/${photoId}/comments`)
      .set('authorization', `Bearer ${token}`)
      .send({ content: 'To be deleted' });
    const commentId = created.body.data.id;

    const res = await request(app)
      .delete(`/comments/${commentId}`)
      .set('authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it('forbids deleting other user comment', async () => {
    const created = await request(app)
      .post(`/photos/${photoId}/comments`)
      .set('authorization', `Bearer ${token}`)
      .send({ content: 'Mine' });
    const commentId = created.body.data.id;

    const res = await request(app)
      .delete(`/comments/${commentId}`)
      .set('authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PA-AUTH-010');
  });
});
