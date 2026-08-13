import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async Express handler to automatically catch rejections
 * and forward them to the global error handler.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
