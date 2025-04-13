import { NextApiRequest, NextApiResponse } from 'next';

import { AppError } from '@/errors/AppError';
import { withErrorHandler } from '@/middleware/errorHandler';

import { supabase } from '../../../utils/supabase';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    throw new AppError(405, 'BAD_REQUEST', 'Method not allowed');
  }

  // Get the authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AppError(401, 'AUTHENTICATION_ERROR', 'No authorization header');
  }

  // Extract the token
  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AppError(401, 'AUTHENTICATION_ERROR', 'Invalid authorization header');
  }

  // Set the session
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError) {
    throw new AppError(401, 'AUTHENTICATION_ERROR', authError.message);
  }

  if (!user) {
    throw new AppError(401, 'AUTHENTICATION_ERROR', 'No user found');
  }

  // Fetch user profile
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    throw new AppError(500, 'SUPABASE_ERROR', 'Failed to fetch user profile');
  }

  if (!profileData) {
    throw new AppError(404, 'NOT_FOUND', 'User profile not found');
  }

  return res.status(200).json({
    email: user.email,
    full_name: profileData.full_name,
    role: profileData.role,
    status: profileData.status
  });
};

export default withErrorHandler(handler); 