import { PrismaClient } from '@prisma/client';
import { env } from '../config/index.js';
import { logger } from '../utils/logger.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'stdout' },
            { level: 'warn', emit: 'stdout' },
          ]
        : [{ level: 'error', emit: 'stdout' }],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

if (env.NODE_ENV === 'development') {
  (prisma as any).$on('query', (e: any) => {
    logger.debug(
      {
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`,
      },
      '🐘 PostgreSQL Query',
    );
  });
}

/**
 * Connect to PostgreSQL and verify the connection.
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Neon PostgreSQL connected successfully');
  } catch (error) {
    logger.fatal({ err: error }, '❌ Neon PostgreSQL connection failed');
    process.exit(1);
  }
}

/**
 * Gracefully disconnect from PostgreSQL.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('🔌 PostgreSQL disconnected');
}
