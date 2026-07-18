import mongoose from 'mongoose';
import createApp from './app.js';
import env from './config/env.js';

async function bootstrap() {
  if (env.MONGO_URI) {
    await mongoose.connect(env.MONGO_URI);
    // eslint-disable-next-line no-console
    console.log('[mongo] connected');
  } else {
    // eslint-disable-next-line no-console
    console.warn('[mongo] MONGO_URI not set — skipping connection (standalone route inspection only)');
  }

  const app = createApp();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] DataGrid demo API listening on port ${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[bootstrap] failed to start server', err);
  process.exit(1);
});
