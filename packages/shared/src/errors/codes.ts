export type ErrorCodeDef = { code: string; http: number; message: string };

export const ErrorCode = {
  PA_AUTH_001: { code: 'PA-AUTH-001', http: 401, message: 'Authentication token missing' },
  PA_AUTH_002: { code: 'PA-AUTH-002', http: 401, message: 'Authentication token invalid' },
  PA_AUTH_003: { code: 'PA-AUTH-003', http: 401, message: 'Authentication token expired' },
  PA_AUTH_004: { code: 'PA-AUTH-004', http: 401, message: 'Refresh token revoked' },
  PA_AUTH_010: { code: 'PA-AUTH-010', http: 403, message: 'Not the resource owner' },
  PA_AUTH_011: { code: 'PA-AUTH-011', http: 403, message: 'Internal endpoint — gateway only' },
  PA_VAL_001:  { code: 'PA-VAL-001',  http: 400, message: 'Request validation failed' },
  PA_FILE_001: { code: 'PA-FILE-001', http: 400, message: 'Unsupported file type' },
  PA_FILE_002: { code: 'PA-FILE-002', http: 400, message: 'File exceeds size limit' },
  PA_FILE_003: { code: 'PA-FILE-003', http: 409, message: 'Uploaded asset does not match signed params' },
  PA_CMT_001:  { code: 'PA-CMT-001',  http: 400, message: 'Comment cannot be empty' },
  PA_CMT_002:  { code: 'PA-CMT-002',  http: 400, message: 'Comment exceeds 500 characters' },
  PA_RES_001:  { code: 'PA-RES-001',  http: 404, message: 'User not found' },
  PA_RES_002:  { code: 'PA-RES-002',  http: 404, message: 'Photo not found' },
  PA_RES_003:  { code: 'PA-RES-003',  http: 404, message: 'Comment not found' },
  PA_RATE_001: { code: 'PA-RATE-001', http: 429, message: 'Too many requests' },
  PA_UP_001:   { code: 'PA-UP-001',   http: 502, message: 'Cloudinary unavailable' },
  PA_UP_002:   { code: 'PA-UP-002',   http: 502, message: 'User service unavailable' },
  PA_UP_003:   { code: 'PA-UP-003',   http: 503, message: 'Database unavailable' },
  PA_SYS_001:  { code: 'PA-SYS-001',  http: 500, message: 'Internal server error' },
} as const satisfies Record<string, ErrorCodeDef>;

export type ErrorCodeKey = keyof typeof ErrorCode;
export type ErrorCodeString = typeof ErrorCode[ErrorCodeKey]['code'];
