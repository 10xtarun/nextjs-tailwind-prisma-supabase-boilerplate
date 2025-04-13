import { NextApiRequest, NextApiResponse } from 'next';

import { createAuthenticationError, createValidationError } from '@/errors/AppError';
import { withErrorHandler } from '@/middleware/errorHandler';
import { prisma } from '@/utils/prisma';
import { supabase } from '@/utils/supabase';

interface LoginRequest {
  email: string;
  password: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body as LoginRequest;

  if (!email || !password) {
    throw createValidationError('Email and password are required');
  }

  // Sign in with Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    throw createAuthenticationError(authError.message);
  }

  if (!authData.user) {
    throw createAuthenticationError('User not found');
  }

  // Get user profile using Prisma
  const user = await prisma.user.findUnique({
    where: { id: authData.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      isApproved: true,
    },
  });

  if (!user) {
    throw createAuthenticationError('Failed to fetch user profile');
  }

  // Check if user is an admin
  if (user.role !== 'admin') {
    throw createAuthenticationError('Access denied. Admin privileges required.');
  }

  // Set session cookie
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw createAuthenticationError('Failed to create session');
  }

  if (!sessionData.session) {
    throw createAuthenticationError('No session created');
  }

  // Set the session cookie
  const { data: { session }, error: setSessionError } = await supabase.auth.setSession({
    access_token: sessionData.session.access_token,
    refresh_token: sessionData.session.refresh_token,
  });

  if (setSessionError) {
    throw createAuthenticationError('Failed to set session');
  }

  // Return success response with user data
  return res.status(200).json({
    user,
    session,
  });
};

export default withErrorHandler(handler); 