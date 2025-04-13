import { NextApiRequest, NextApiResponse } from 'next';

import { AppError } from '@/errors/AppError';
import { logger } from '@/utils/logger';

export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void | NextApiResponse>;

export const withErrorHandler = (handler: ApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error: unknown) {
      logger.error('API Error:', error);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json(error.toJSON());
      }

      // Handle Supabase errors
      if (error instanceof Error && error.message?.includes('Supabase')) {
        const appError = new AppError(
          500,
          'SUPABASE_ERROR',
          'Database operation failed',
          error
        );
        return res.status(appError.statusCode).json(appError.toJSON());
      }

      // Handle unknown errors
      const appError = new AppError(
        500,
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred',
        error instanceof Error ? error.message : error
      );
      return res.status(appError.statusCode).json(appError.toJSON());
    }
  };
}; 