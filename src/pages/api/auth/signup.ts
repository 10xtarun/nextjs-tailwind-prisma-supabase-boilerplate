import { NextApiRequest, NextApiResponse } from 'next';

import {
  createAuthError,
  createDatabaseError,
  createMethodNotAllowedError,
  createValidationError,
} from '@/errors/AppError';
import { withErrorHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { prisma } from '@/utils/prisma';
import { supabase } from '@/utils/supabase';

interface SignupRequestBody {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'venue_owner' | 'attendee';
  clientId?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    throw createMethodNotAllowedError(
      'This endpoint only accepts POST requests',
      { method: req.method }
    );
  }

  const { email, password, fullName, role, clientId } = req.body as SignupRequestBody;

  // Validate required fields
  const missingFields = [];
  if (!email) missingFields.push('email');
  if (!password) missingFields.push('password');
  if (!fullName) missingFields.push('fullName');
  if (!role) missingFields.push('role');

  if (missingFields.length > 0) {
    throw createValidationError(
      'Missing required fields',
      { missingFields }
    );
  }

  try {
    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (authError) {
      logger.error('Auth Error:', authError);
      throw createAuthError(
        authError.message,
        { email }
      );
    }

    if (!authData.user) {
      throw createAuthError(
        'No user data returned from auth signup',
        { email },
        500
      );
    }

    // Create user profile in database using Prisma
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        fullName,
        role,
        clientId,
      },
    });

    return res.status(201).json({
      message: 'Account created successfully! Please check your email to confirm your account.',
      user,
    });
  } catch (error) {
    logger.error('Signup error:', error);

    // If database operation fails, cleanup auth user
    const authData = await supabase.auth.getUser();
    if (authData.data?.user) {
      await supabase.auth.admin.deleteUser(authData.data.user.id);
    }

    // Convert Prisma error to our AppError format
    if (error instanceof Error) {
      throw createDatabaseError(
        'Failed to create user profile',
        { error: error.message }
      );
    }

    throw error;
  }
};

export default withErrorHandler(handler);