import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Button from '@/components/buttons/Button';
import Seo from '@/components/Seo';

import { useToast } from '@/contexts/ToastContext';
import { AppError } from '@/errors/AppError';
import { logger } from '@/utils/logger';
import { supabase } from '@/utils/supabase';

interface LoginFormData {
  email: string;
  password: string;
}

export default function UserLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new AppError(response.status, result.code, result.message);
      }

      // Set the session in Supabase client
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });

      if (sessionError) {
        throw new AppError(500, 'SESSION_ERROR', 'Failed to set session');
      }

      showToast({ message: 'Login successful!', type: 'success' });

      // Redirect to user profile
      router.push('/user/profile');
    } catch (error) {
      if (error instanceof AppError) {
        showToast({ message: error.message, type: 'error' });
      } else {
        showToast({ message: 'An unexpected error occurred', type: 'error' });
        logger.error('Login error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Seo templateTitle='User Login' />
      <main>
        <section className='bg-white'>
          <div className='layout min-h-screen flex items-center justify-center py-20'>
            <div className='w-full max-w-md space-y-8'>
              <div className='text-center'>
                <h1 className='text-4xl font-bold'>User Login</h1>
                <p className='mt-2 text-gray-600'>
                  Sign in to access your profile
                </p>
              </div>

              <div className='mt-8 space-y-6 bg-white p-8 shadow-lg rounded-lg border border-gray-200'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                  <div>
                    <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                      Email address
                    </label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      id='email'
                      type='email'
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
                      placeholder='you@example.com'
                    />
                    {errors.email && (
                      <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                      Password
                    </label>
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      id='password'
                      type='password'
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
                      placeholder='••••••••'
                    />
                    {errors.password && (
                      <p className='mt-1 text-sm text-red-600'>{errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type='submit'
                    variant='primary'
                    className='w-full'
                    isLoading={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>

                <div className='text-center text-sm'>
                  <Link
                    href='/user/forgot-password'
                    className='text-primary-600 hover:text-primary-500'
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
} 