import { AppError, AppErrorResponse, ErrorType } from '@/errors/AppError';

export interface ErrorMessage {
  message: string;
  code?: string;
  status?: number;
}

export function handleError(error: Error | unknown): {
  statusCode: number;
  message: string;
  error?: unknown;
} {
  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    };
  }

  return {
    statusCode: 500,
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  };
}

export async function handleApiError(response: Response): Promise<never> {
  const error: AppErrorResponse = await response.json();
  throw new AppError(
    error.statusCode,
    error.type,
    error.message,
    error.details
  );
}

export function handleClientError(error: unknown) {
  if (error instanceof AppError) {
    // Already formatted error, just return it
    return error.toJSON();
  }

  // Handle other types of errors
  const errorResponse: AppErrorResponse = {
    statusCode: 500,
    type: 'INTERNAL_SERVER_ERROR' as ErrorType,
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    details: error
  };

  return errorResponse;
}

export async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit
): Promise<any> {
  const response = await fetch(url, options);

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
} 