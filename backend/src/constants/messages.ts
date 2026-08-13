/**
 * Reusable string constants for API responses.
 */

export const AuthMessages = {
  LOGIN_SUCCESS: 'Login successful.',
  REGISTER_SUCCESS: 'Registration successful.',
  LOGOUT_SUCCESS: 'Logout successful.',
  TOKEN_REFRESHED: 'Token refreshed successfully.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  TOKEN_EXPIRED: 'Token has expired.',
  TOKEN_INVALID: 'Invalid or malformed token.',
  UNAUTHORIZED: 'Authentication required.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_IMPLEMENTED: 'This feature is not yet implemented.',
} as const;

export const ValidationMessages = {
  INVALID_EMAIL: 'Please provide a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_UUID: 'Invalid ID format.',
  INVALID_PAGINATION: 'Invalid pagination parameters.',
} as const;

export const GenericMessages = {
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  METHOD_NOT_ALLOWED: 'This HTTP method is not supported for this endpoint.',
  RATE_LIMITED: 'Too many requests. Please slow down.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable.',
  HEALTH_OK: 'All systems operational.',
} as const;
