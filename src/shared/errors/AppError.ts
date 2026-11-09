/**
 * One error shape for the whole API (see docs/API-CONTRACT.md):
 * { error: { code, message, requestId, details? } }
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PAYLOAD_TOO_LARGE'
  | 'INTERNAL_ERROR';

export type ErrorDetail = { path: string; message: string };

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details?: ErrorDetail[];

  constructor(status: number, code: ErrorCode, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    if (details) this.details = details;
  }

  static validation(message: string, details?: ErrorDetail[]) {
    return new AppError(400, 'VALIDATION_ERROR', message, details);
  }
  static unauthenticated(message = 'Authentication required') {
    return new AppError(401, 'UNAUTHENTICATED', message);
  }
  static forbidden(message = 'You do not have access to this resource') {
    return new AppError(403, 'FORBIDDEN', message);
  }
  static notFound(message = 'Resource not found') {
    return new AppError(404, 'NOT_FOUND', message);
  }
  static conflict(message: string) {
    return new AppError(409, 'CONFLICT', message);
  }
}
