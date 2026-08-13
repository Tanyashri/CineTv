import type { User } from '@prisma/client';

/* eslint-disable @typescript-eslint/no-empty-object-type */

/**
 * Augment Express types with custom properties.
 */
declare global {
  namespace Express {
    interface Request {
      /** Unique request ID (UUID) */
      id: string;

      /** Authenticated user (populated by auth middleware) */
      user?: User;

      /** Bearer token string */
      token?: string;
    }
  }
}

export {};
