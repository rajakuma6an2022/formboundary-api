import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { connectDb } from './config/db.js';

async function main() {
  const env = loadEnv();
  await connectDb(env.MONGODB_URI);
  console.info('MongoDB connected');

  const app = createApp({ clientOrigin: env.CLIENT_ORIGIN });
  app.listen(env.PORT, () => {
    console.info(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
}

main().catch((err: unknown) => {
  console.error('Failed to start server:', err instanceof Error ? err.message : err);
  process.exit(1);
});
