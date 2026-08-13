import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * HTTP request logger middleware.
 * Logs method, URL, status, duration, and request ID.
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 400) {
      logger.warn(logData, 'Request completed with error');
    } else {
      logger.info(logData, 'Request completed');
    }
  });

  next();
}
