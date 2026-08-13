import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject } from 'zod';
import { HttpStatus } from '../constants/http-status.js';

/**
 * Express middleware to validate request body against a Zod schema.
 */
export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (error: unknown) {
      const zodError = error as { errors?: Array<{ path: (string | number)[]; message: string }> };
      const formattedErrors = zodError.errors
        ? zodError.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        : [];

      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: formattedErrors[0]?.message || 'Validation failed.',
        code: 'VALIDATION_ERROR',
        errors: formattedErrors,
      });
    }
  };
}
