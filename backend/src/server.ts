import { createApp } from './app.js';
import { env } from './config/index.js';
import { logger } from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './database/prisma.js';
import { connectRedis, disconnectRedis } from './cache/index.js';

async function bootstrap(): Promise<void> {
  logger.info('⚙️ Initializing CineVerse AI Backend...');
  logger.info(`📊 Environment: ${env.NODE_ENV}`);

  // ─── Connect to services ──────────────────────────
  logger.info('🔌 Connecting to Neon PostgreSQL...');
  await connectDatabase();

  logger.info('🔌 Connecting to Upstash Redis...');
  await connectRedis();

  // ─── Create and start server ──────────────────────
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 CineVerse AI Backend running on http://localhost:${env.PORT}`);
    logger.info(`📚 API Docs: http://localhost:${env.PORT}/api/docs`);
    logger.info(`🏥 Health: http://localhost:${env.PORT}/api/v1/health`);
  });

  // ─── Graceful Shutdown ─────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`\n${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed');

      await disconnectDatabase();
      await disconnectRedis();

      logger.info('All connections closed. Goodbye! 👋');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.fatal({ err: reason }, 'Unhandled promise rejection');
    throw reason;
  });

  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Uncaught exception');
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start server');
  process.exit(1);
});
