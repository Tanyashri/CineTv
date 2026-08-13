import type { Request, Response } from 'express';
import { HttpStatus } from '../constants/http-status.js';
import { GenericMessages } from '../constants/messages.js';

/**
 * 404 handler for unmatched routes.
 */
export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    message: GenericMessages.NOT_FOUND,
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl,
  });
}
