import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../errors/AppError.js';

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(AppError.notFound('Route not found'));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // body-parser errors (malformed JSON / too large) come with a status + type
  const bodyStatus = typeof err?.status === 'number' ? (err.status as number) : undefined;

  if (err instanceof AppError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        requestId: req.id,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (bodyStatus === 413) {
    res.status(413).json({
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large', requestId: req.id },
    });
    return;
  }

  if (bodyStatus === 400 && err?.type === 'entity.parse.failed') {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON body', requestId: req.id },
    });
    return;
  }

  // Unknown error: log server-side with requestId, return a generic message to the client.
  console.error(`[${req.id}] Unhandled error:`, err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong', requestId: req.id },
  });
};
