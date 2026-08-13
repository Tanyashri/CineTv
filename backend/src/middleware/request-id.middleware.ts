import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique request ID per incoming request.
 * Attaches to `req.id` and sets `X-Request-Id` response header.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) ?? uuidv4();

  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  next();
}
