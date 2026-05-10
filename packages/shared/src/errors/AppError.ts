import type { ErrorCodeDef } from './codes.js';

export class AppError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly details?: Record<string, unknown>;

  constructor(def: ErrorCodeDef, details?: Record<string, unknown>) {
    super(def.message);
    this.code = def.code;
    this.httpStatus = def.http;
    this.details = details;
    this.name = 'AppError';
    Error.captureStackTrace?.(this, AppError);
  }
}
