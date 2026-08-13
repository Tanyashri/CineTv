/**
 * User roles — mirrors the Prisma `Role` enum.
 * Use these constants for role checks in middleware and services.
 */
export const Roles = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const;

export type UserRole = (typeof Roles)[keyof typeof Roles];

/**
 * Auth providers — mirrors the Prisma `AuthProvider` enum.
 */
export const AuthProviders = {
  EMAIL: 'EMAIL',
  GOOGLE: 'GOOGLE',
} as const;

export type AuthProviderType = (typeof AuthProviders)[keyof typeof AuthProviders];
