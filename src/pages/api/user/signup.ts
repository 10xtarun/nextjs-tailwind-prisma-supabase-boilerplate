import { NextApiRequest, NextApiResponse } from 'next';

import { createValidationError } from '@/errors/AppError';
import { withErrorHandler } from '@/middleware/errorHandler';
import { supabaseAdmin } from '@/utils/supabase';

import { prisma } from '../../../utils/prisma';

interface SignupRequestBody {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'venue_owner' | 'attendee';
  clientId?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized');
  }

  const { email, password, fullName, role, clientId } = req.body as SignupRequestBody;

  // Validate required fields
  if (!email || !password || !fullName || !role) {
    throw createValidationError('Missing required fields');
  }

  // Validate role
  const validRoles = ['admin', 'venue_owner', 'attendee'];
  if (!validRoles.includes(role)) {
    throw createValidationError('Invalid role');
  }

  // Create user in Supabase
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return res.status(400).json({ message: authError.message });
  }

  // Create user in database
  const user = await prisma.user.create({
    data: {
      id: authData.user.id,
      email,
      fullName,
      role,
      ...(clientId && { clientId }),
    },
  });

  return res.status(201).json({
    message: 'User created successfully. Please log in.',
    redirect: '/user/login',
  });
};

export default withErrorHandler(handler); 