import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    id: string;
  }
}

export const requestId: RequestHandler = (req, res, next) => {
  // Never trust a client-supplied id blindly: generate our own.
  req.id = randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};
