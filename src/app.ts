import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { requestId } from './shared/middleware/requestId.js';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler.js';

export type AppConfig = {
  clientOrigin: string;
};

export function createApp(config: AppConfig) {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // behind Render/Vercel proxy in production (needed for secure cookies + rate limit IP)

  app.use(requestId);
  app.use(helmet());
  app.use(
    cors({
      origin: config.clientOrigin, // exact origin, never "*" with credentials
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );
  app.use(express.json({ limit: '100kb' })); // body size cap (plan: cap request body)
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'formboundary-api', time: new Date().toISOString() });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
