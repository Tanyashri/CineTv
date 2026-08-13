import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error.js';
import { logger } from '../utils/logger.js';
import { HttpStatus } from '../constants/http-status.js';
import { GenericMessages } from '../constants/messages.js';

/**
 * Global error handler middleware.
 * Maps known error types to structured JSON responses.
 */
export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log the error
  logger.error(
    {
      err,
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
    },
    'Unhandled error',
  );

  // ─── AppError (operational) ───────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  // ─── Zod Validation Error ─────────────────────────
  if (err instanceof ZodError) {
    res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // ─── Prisma Known Request Error ───────────────────
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as Error & { code: string; meta?: Record<string, unknown> };

    if (prismaErr.code === 'P2002') {
      res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: 'A record with this value already exists.',
        code: 'DUPLICATE_ENTRY',
      });
      return;
    }

    if (prismaErr.code === 'P2025') {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Record not found.',
        code: 'NOT_FOUND',
      });
      return;
    }
  }

  // ─── Generic fallback ─────────────────────────────
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: GenericMessages.INTERNAL_ERROR,
    code: 'INTERNAL_ERROR',
  });
}
