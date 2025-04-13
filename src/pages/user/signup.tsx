import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { useEffect,useState } from 'react';
import { useForm } from 'react-hook-form';

import Button from '@/components/buttons/Button';
import Seo from '@/components/Seo';

import { useToast } from '@/contexts/ToastContext';

interface SignupFormData {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'venue_owner' | 'attendee';
}

export default function UserSignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>();

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables are not set');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/user/profile');
      }
    };
    checkSession();
  }, [router]);

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      showToast({ message: 'Signup successful! Redirecting to profile...', type: 'success' });
      router.push('/user/profile');
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Failed to create account',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Seo templateTitle='Sign Up' />
      <main>
        <section className='bg-white'>
          <div className='layout min-h-screen flex items-center justify-center py-20'>
            <div className='w-full max-w-md space-y-8'>
              <div className='text-center'>
                <h1 className='text-4xl font-bold'>Create Account</h1>
                <p className='mt-2 text-gray-600'>
                  Sign up to get started
                </p>
              </div>

              <div className='mt-8 space-y-6 bg-white p-8 shadow-lg rounded-lg border border-gray-200'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                  <div>
                    <label htmlFor='fullName' className='block text-sm font-medium text-gray-700'>
                      Full Name
                    </label>
                    <input
                      {...register('fullName', {
                        required: 'Full name is required',
                      })}
                      id='fullName'
                      type='text'
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
                      placeholder='John Doe'
                    />
                    {errors.fullName && (
                      <p className='mt-1 text-sm text-red-600'>{errors.fullName.message}</p>
                    )}
                  </div>

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

                  <div>
                    <label htmlFor='role' className='block text-sm font-medium text-gray-700'>
                      Role
                    </label>
                    <select
                      {...register('role', {
                        required: 'Role is required'
                      })}
                      id='role'
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
                    >
                      <option value=''>Select a role</option>
                      <option value='venue_owner'>Venue Owner</option>
                      <option value='attendee'>Attendee</option>
                    </select>
                    {errors.role && (
                      <p className='mt-1 text-sm text-red-600'>{errors.role.message}</p>
                    )}
                  </div>

                  <Button
                    type='submit'
                    variant='primary'
                    className='w-full'
                    isLoading={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
} 