import { type CookieOptions,createServerClient } from '@supabase/ssr';
import { NextApiRequest, NextApiResponse } from 'next';

import { createAuthenticationError } from '@/errors/AppError';
import { withErrorHandler } from '@/middleware/errorHandler';
import { prisma } from '@/utils/prisma';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Create Supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set(name: string, value: string, options: CookieOptions) {
          res.setHeader('Set-Cookie', `${name}=${value}; Path=${options.path}; Max-Age=${options.maxAge}; HttpOnly; Secure; SameSite=Lax`);
        },
        remove(name: string, options: CookieOptions) {
          res.setHeader('Set-Cookie', `${name}=; Path=${options.path}; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
        },
      },
    }
  );

  // Validate session using getUser
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw createAuthenticationError('Not authenticated');
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw createAuthenticationError('Invalid token');
  }

  const userId = user.id;

  if (req.method === 'GET') {
    // Get user profile from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
      },
    });

    if (!user) {
      throw createAuthenticationError('User not found');
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        clientId: user.clientId,
        client: user.client,
        isApproved: user.isApproved,
      },
    });
  }

  if (req.method === 'PUT') {
    const { fullName } = req.body;

    if (!fullName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { fullName },
      include: {
        client: true,
      },
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        clientId: updatedUser.clientId,
        client: updatedUser.client,
        isApproved: updatedUser.isApproved,
      },
    });
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default withErrorHandler(handler); 