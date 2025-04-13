import { NextApiRequest, NextApiResponse } from 'next';

import { AppError } from '@/errors/AppError';
import { withErrorHandler } from '@/middleware/errorHandler';
import { supabaseAdmin } from '@/utils/supabase';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    throw new AppError(405, 'METHOD_NOT_ALLOWED', 'Only POST requests are allowed');
  }

  const { email, password, full_name } = req.body;

  if (!email || !password || !full_name) {
    throw new AppError(400, 'BAD_REQUEST', 'Email, password, and full name are required');
  }

  if (!supabaseAdmin) {
    throw new AppError(500, 'SERVER_ERROR', 'Admin client not configured');
  }

  // Create user with admin role using service role key
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    throw new AppError(400, 'REGISTRATION_ERROR', authError.message);
  }

  if (!authData.user) {
    throw new AppError(500, 'SERVER_ERROR', 'Failed to create user');
  }

  // Create admin profile in users table
  const { error: profileError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authData.user.id,
      email: authData.user.email,
      full_name,
      role: 'admin',
      status: 'active'
    });

  if (profileError) {
    // Cleanup: Delete the auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw new AppError(500, 'DATABASE_ERROR', 'Failed to create admin profile');
  }

  return res.status(201).json({
    message: 'Admin user created successfully',
    user: {
      id: authData.user.id,
      email: authData.user.email,
      full_name,
      role: 'admin',
      status: 'active'
    }
  });
};

export default withErrorHandler(handler); 