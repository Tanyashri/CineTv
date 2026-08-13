import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { HttpStatus } from '../constants/http-status.js';
import { AuthMessages, GenericMessages } from '../constants/messages.js';
import { supabaseAdmin } from '../config/supabase.js';
import { authService } from './auth.service.js';

/**
 * Rate limiter middleware for authentication endpoints.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: GenericMessages.RATE_LIMITED,
    code: 'RATE_LIMITED',
  },
});

/**
 * Authentication middleware verifying Bearer tokens with Supabase Auth
 * and loading synchronized user record from Prisma database.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: AuthMessages.UNAUTHORIZED,
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: AuthMessages.UNAUTHORIZED,
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: AuthMessages.TOKEN_INVALID,
        code: 'UNAUTHORIZED',
      });
      return;
    }

    // Synchronize / load user record from Prisma
    const user = await authService.syncUserToPrisma(data.user);

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message: error instanceof Error ? error.message : AuthMessages.UNAUTHORIZED,
      code: 'UNAUTHORIZED',
    });
  }
}

/**
 * Optional authentication middleware: if Authorization Bearer header is present,
 * populates req.user; otherwise proceeds anonymously without erroring.
 */
export async function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    if (!token) return next();

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && data.user) {
      const user = await authService.syncUserToPrisma(data.user);
      req.user = user;
      req.token = token;
    }
  } catch {
    // Continue anonymously if token verification fails
  }
  next();
}

/**
 * Role-based authorization guard middleware.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: AuthMessages.UNAUTHORIZED,
        code: 'UNAUTHORIZED',
      });
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: AuthMessages.FORBIDDEN,
        code: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
}
