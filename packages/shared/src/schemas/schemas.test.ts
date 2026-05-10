import { describe, it, expect } from 'vitest';
import { CommentSchema } from './comment.js';
import { SignUploadSchema, ALLOWED_MIME, MAX_BYTES } from './photo.js';
import { GoogleProfileSchema } from './auth.js';

describe('CommentSchema', () => {
  it('accepts a normal comment', () => { expect(CommentSchema.parse({ content: 'hello world' }).content).toBe('hello world'); });
  it('rejects empty', () => { expect(() => CommentSchema.parse({ content: '' })).toThrow(); });
  it('rejects whitespace-only', () => { expect(() => CommentSchema.parse({ content: '   ' })).toThrow(); });
  it('rejects > 500 chars', () => { expect(() => CommentSchema.parse({ content: 'a'.repeat(501) })).toThrow(); });
  it('trims content', () => { expect(CommentSchema.parse({ content: '  hi  ' }).content).toBe('hi'); });
});

describe('SignUploadSchema', () => {
  const ok = { filename: 'x.jpg', mimeType: 'image/jpeg', bytes: 1024 };
  it('accepts valid input', () => { expect(SignUploadSchema.parse(ok)).toEqual(ok); });
  it('rejects bad mime', () => { expect(() => SignUploadSchema.parse({ ...ok, mimeType: 'image/gif' })).toThrow(); });
  it('rejects too large', () => { expect(() => SignUploadSchema.parse({ ...ok, bytes: MAX_BYTES + 1 })).toThrow(); });
  it('exposes ALLOWED_MIME', () => { expect(ALLOWED_MIME).toContain('image/jpeg'); });
});

describe('GoogleProfileSchema', () => {
  it('accepts a Google profile', () => {
    const p = { googleId: 'g1', email: 'x@y.com', name: 'X', avatarUrl: 'https://x' };
    expect(GoogleProfileSchema.parse(p)).toEqual(p);
  });
  it('makes avatarUrl optional', () => {
    expect(GoogleProfileSchema.parse({ googleId: 'g', email: 'x@y.com', name: 'X' }).avatarUrl).toBeUndefined();
  });
});
