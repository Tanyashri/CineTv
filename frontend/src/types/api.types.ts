/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Paginated API response.
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Health check response from GET /api/v1/health.
 */
export interface HealthResponse {
  backend: 'healthy' | 'unhealthy' | 'degraded';
  postgres: 'connected' | 'disconnected';
  redis: 'connected' | 'disconnected';
  tmdb: 'configured' | 'not_configured';
  gemini: 'configured' | 'not_configured';
  tmdbKeyMasked?: string;
  geminiKeyMasked?: string;
  uptime: string;
  version: string;
  timestamp: string;
}

/**
 * User type (placeholder — matches backend Prisma User model).
 */
export interface User {
  id: string;
  email: string;
  fullName: string | null;
  name: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  authProvider?: 'EMAIL' | 'GOOGLE';
  provider: 'EMAIL' | 'GOOGLE';
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  createdAt: string;
  updatedAt: string;
}
