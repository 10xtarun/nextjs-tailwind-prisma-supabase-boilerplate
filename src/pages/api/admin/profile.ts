import { NextApiRequest, NextApiResponse } from 'next';

import { AppError } from '@/errors/AppError';
import { withErrorHandler } from '@/middleware/errorHandler';
import { supabase } from '@/utils/supabase';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    throw new AppError(405, 'METHOD_NOT_ALLOWED', 'Only GET requests are allowed');
  }

  // Get session from cookie
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new AppError(401, 'UNAUTHORIZED', 'No valid session found');
  }

  // Get user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .eq('role', 'admin')
    .single();

  if (userError) {
    throw new AppError(500, 'DATABASE_ERROR', 'Failed to fetch admin data');
  }

  if (!userData) {
    throw new AppError(403, 'FORBIDDEN', 'User is not an admin');
  }

  return res.status(200).json({
    user: {
      id: session.user.id,
      email: session.user.email,
      full_name: userData.full_name,
      role: userData.role,
      status: userData.status
    }
  });
};

export default withErrorHandler(handler); 