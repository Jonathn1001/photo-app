import { describe, it, expect } from 'vitest';
import { AppError } from './AppError.js';
import { ErrorCode } from './codes.js';

describe('AppError', () => {
  it('exposes code, http status, and default message from catalog', () => {
    const e = new AppError(ErrorCode.PA_FILE_002);
    expect(e.code).toBe('PA-FILE-002');
    expect(e.httpStatus).toBe(400);
    expect(e.message).toBe('File exceeds size limit');
  });
  it('attaches details', () => {
    const e = new AppError(ErrorCode.PA_FILE_002, { limitBytes: 5242880, actualBytes: 9000000 });
    expect(e.details).toEqual({ limitBytes: 5242880, actualBytes: 9000000 });
  });
  it('is instanceof Error', () => {
    expect(new AppError(ErrorCode.PA_SYS_001)).toBeInstanceOf(Error);
  });
});
