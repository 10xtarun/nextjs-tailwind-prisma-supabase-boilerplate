export type ErrorType =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'SERVER_ERROR'
  | 'SESSION_ERROR'
  | 'REGISTRATION_ERROR'
  | 'AUTH_ERROR'
  | 'SUPABASE_ERROR'
  | 'INTERNAL_SERVER_ERROR';

export interface AppErrorResponse {
  statusCode: number;
  type: ErrorType;
  message: string;
  details?: unknown;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(process.env.NODE_ENV === 'development' && {
        originalError: this.originalError,
      }),
    };
  }
}

export function createError(
  statusCode: number,
  type: ErrorType,
  message: string,
  details?: unknown
): AppError {
  return new AppError(statusCode, type, message, details);
}

// Helper functions for common errors
export const createAuthenticationError = (message: string, details?: unknown) =>
  createError(401, 'AUTHENTICATION_ERROR', message, details);

export const createAuthorizationError = (message: string, details?: unknown) =>
  createError(403, 'AUTHORIZATION_ERROR', message, details);

export const createValidationError = (message: string, details?: unknown) =>
  createError(400, 'VALIDATION_ERROR', message, details);

export const createNotFoundError = (message: string, details?: unknown) =>
  createError(404, 'NOT_FOUND', message, details);

export const createSupabaseError = (message: string, details?: unknown) =>
  createError(500, 'SUPABASE_ERROR', message, details);

export const createMethodNotAllowedError = (message: string, details?: unknown) =>
  createError(405, 'METHOD_NOT_ALLOWED', message, details);

export const createAuthError = (message: string, details?: unknown, statusCode = 400) =>
  createError(statusCode, 'AUTH_ERROR', message, details);

export const createDatabaseError = (message: string, details?: unknown) =>
  createError(500, 'DATABASE_ERROR', message, details); 