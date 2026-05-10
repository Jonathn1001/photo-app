import type { ErrorRequestHandler } from 'express';
import { AppError, ErrorCode } from '@photo-app/shared';

function isZodError(err: unknown): err is { errors: Array<{ path: (string | number)[]; message: string }> } {
  return typeof err === 'object' && err !== null && err.constructor?.name === 'ZodError' && 'errors' in err;
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = (req as any).requestId;
  if (isZodError(err)) {
    return res.status(400).json({
      status: 'error',
      code: ErrorCode.PA_VAL_001.code,
      message: ErrorCode.PA_VAL_001.message,
      errors: (err as any).errors.map((e: any) => ({ field: e.path.join('.'), message: e.message })),
      requestId,
    });
  }
  if (err instanceof AppError) {
    return res.status(err.httpStatus).json({
      status: 'error',
      code: err.code,
      message: err.message,
      errors: err.details ? [err.details] : undefined,
      requestId,
    });
  }
  (req as any).log?.error({ err, stack: err.stack }, 'unhandled error');
  return res.status(500).json({
    status: 'error',
    code: ErrorCode.PA_SYS_001.code,
    message: ErrorCode.PA_SYS_001.message,
    requestId,
  });
};
