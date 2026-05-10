import { describe, it, expect } from 'vitest';
import { Writable } from 'node:stream';
import { createLogger } from './createLogger.js';

function captureLine(fn: (logger: ReturnType<typeof createLogger>) => void): any {
  let buf = '';
  const stream = new Writable({
    write(chunk, _enc, cb) { buf += chunk.toString(); cb(); },
  });
  const logger = createLogger({ service: 'test', stream, level: 'debug' });
  fn(logger);
  return JSON.parse(buf.trim().split('\n')[0]);
}

describe('createLogger', () => {
  it('emits canonical fields', () => {
    const line = captureLine(l => l.info({ requestId: 'r1', userId: 'u1', code: 'PA-X-1' }, 'hi'));
    expect(line.service).toBe('test');
    expect(line.requestId).toBe('r1');
    expect(line.userId).toBe('u1');
    expect(line.code).toBe('PA-X-1');
    expect(line.msg).toBe('hi');
  });
  it.each([
    'password', 'token', 'accessToken', 'refreshToken', 'authorization',
    'cookie', 'api_secret', 'apiKey',
  ])('redacts %s', (key) => {
    const line = captureLine(l => l.info({ [key]: 'SECRET_VALUE' }, 'x'));
    expect(JSON.stringify(line)).not.toContain('SECRET_VALUE');
    expect(JSON.stringify(line)).toContain('[REDACTED]');
  });
  it('redacts nested authorization header', () => {
    const line = captureLine(l => l.info({ req: { headers: { authorization: 'Bearer xyz' } } }, 'x'));
    expect(JSON.stringify(line)).not.toContain('xyz');
  });
});
