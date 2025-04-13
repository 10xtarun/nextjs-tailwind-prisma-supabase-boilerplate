import { NextApiRequest, NextApiResponse } from 'next';

import { createValidationError } from '@/errors/AppError';
import { withErrorHandler } from '@/middleware/errorHandler';
import { supabaseAdmin } from '@/utils/supabase';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw createValidationError('Missing required fields');
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ message: 'Supabase admin client not initialized' });
  }

  // Authenticate user with Supabase
  const { data, error: authError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !data.session) {
    return res.status(401).json({ message: authError?.message || 'Invalid credentials' });
  }

  const { access_token, refresh_token } = data.session;

  return res.status(200).json({
    message: 'Login successful',
    session: {
      access_token,
      refresh_token,
    },
  });
};

export default withErrorHandler(handler); 