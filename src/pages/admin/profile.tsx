import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Button from '@/components/buttons/Button';
import Seo from '@/components/Seo';
import Skeleton from '@/components/Skeleton';

import { useToast } from '@/contexts/ToastContext';
import { AppError } from '@/errors/AppError';
import { logger } from '@/utils/logger';
import { supabase } from '@/utils/supabase';

type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
};

export default function AdminProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Check if we have a session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new AppError(401, 'AUTH_ERROR', 'No valid session found');
        }

        const response = await fetch('/api/admin/profile');
        const result = await response.json();

        if (!response.ok) {
          throw new AppError(response.status, result.code, result.message);
        }

        setUser(result.user);
      } catch (error) {
        if (error instanceof AppError) {
          showToast({ message: error.message, type: 'error' });
        } else {
          showToast({ message: 'Failed to load profile', type: 'error' });
          logger.error('Profile load error:', error);
        }
        // Use window.location for a hard redirect to ensure middleware runs
        window.location.href = '/admin/login';
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [showToast]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      showToast({ message: 'Signed out successfully', type: 'success' });
      // Use window.location for a hard redirect to ensure middleware runs
      window.location.href = '/admin/login';
    } catch (error) {
      showToast({ message: 'Error signing out', type: 'error' });
      logger.error('Sign out error:', error);
    }
  };

  return (
    <>
      <Seo templateTitle="Admin Profile" />
      <main>
        <section className='bg-white'>
          <div className='layout min-h-screen py-20'>
            <div className='mx-auto max-w-3xl'>
              <div className='mb-8 flex items-center justify-between'>
                <h1 className='text-3xl font-bold'>Admin Profile</h1>
                <Button
                  onClick={handleSignOut}
                  variant='ghost'
                  isDarkBg={false}
                >
                  Sign Out
                </Button>
              </div>

              <div className='rounded-lg border bg-white shadow-sm'>
                {isLoading ? (
                  <div className='space-y-4 p-6'>
                    <Skeleton className='h-4 w-2/3' />
                    <Skeleton className='h-4 w-1/2' />
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-4 w-1/3' />
                  </div>
                ) : user ? (
                  <dl className='divide-y divide-gray-200'>
                    <div className='px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4'>
                      <dt className='text-sm font-medium text-gray-500'>Full name</dt>
                      <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                        {user.full_name}
                      </dd>
                    </div>
                    <div className='px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4'>
                      <dt className='text-sm font-medium text-gray-500'>Email address</dt>
                      <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                        {user.email}
                      </dd>
                    </div>
                    <div className='px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4'>
                      <dt className='text-sm font-medium text-gray-500'>Role</dt>
                      <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                        <span className='inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800'>
                          {user.role}
                        </span>
                      </dd>
                    </div>
                    <div className='px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4'>
                      <dt className='text-sm font-medium text-gray-500'>Status</dt>
                      <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {user.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
} 