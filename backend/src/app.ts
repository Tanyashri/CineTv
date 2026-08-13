import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/index.js';
import { swaggerSpec } from './config/swagger.js';
import { API } from './constants/index.js';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware.js';
import { errorHandlerMiddleware } from './middleware/error-handler.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { apiRouter } from './routes/index.js';

export function createApp(): express.Application {
  const app = express();

  // ─── Security ───────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    }),
  );

  // ─── Dynamic CORS Configuration ─────────────────────
  const allowedOrigins = env.CORS_ORIGIN
    ? env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:5174'];

  const isDevelopment = env.NODE_ENV === 'development';

  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!requestOrigin) {
          return callback(null, true);
        }

        // Allow explicitly configured origins in CORS_ORIGIN
        if (allowedOrigins.includes(requestOrigin)) {
          return callback(null, true);
        }

        // In development, dynamically allow any local dev server port (e.g. localhost:5173, 5174, 5175)
        if (isDevelopment && /^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(requestOrigin)) {
          return callback(null, true);
        }

        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // ─── Body Parsing ──────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ─── Compression ───────────────────────────────────
  app.use(compression());

  // ─── Request Tracking ──────────────────────────────
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);

  // ─── Swagger Docs ──────────────────────────────────
  app.use(
    API.DOCS_PATH,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'CineVerse AI — API Docs',
    }),
  );

  // ─── Global API Rate Limiting ──────────────────────
  const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests. Please slow down.',
      code: 'RATE_LIMITED',
    },
  });

  // ─── API Routes ────────────────────────────────────
  app.use(API.FULL_PREFIX, apiRateLimiter, apiRouter);

  // ─── Error Handling ────────────────────────────────
  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
}
