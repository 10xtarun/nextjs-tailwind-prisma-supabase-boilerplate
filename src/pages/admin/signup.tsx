import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import Button from '@/components/buttons/Button';
import Seo from '@/components/Seo';

import { useToast } from '@/contexts/ToastContext';

export default function AdminSignUpPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      showToast({ message: 'Passwords do not match', type: 'error' });
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      showToast({ message: 'Password must be at least 8 characters long', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      showToast({ message: 'Account created successfully!', type: 'success' });
      router.push('/admin/profile');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred during registration';
      showToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo templateTitle='Admin Sign Up' />
      <main>
        <section className='bg-white py-20 min-h-screen'>
          <div className='layout'>
            <div className='max-w-md mx-auto'>
              <div className='flex justify-center mb-8'>
                <Link
                  href='/'
                  className='text-2xl font-bold text-primary-500 hover:text-primary-600'
                >
                  Admin Portal
                </Link>
              </div>
              <div className='bg-white shadow-md rounded-lg p-6 space-y-6'>
                <h1 className='text-2xl font-bold text-center text-gray-900'>
                  Create Admin Account
                </h1>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div>
                    <label htmlFor='fullName' className='block text-sm font-medium text-gray-700'>
                      Full Name
                    </label>
                    <input
                      type='text'
                      id='fullName'
                      name='fullName'
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
                    />
                  </div>

                  <div>
                    <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                      Email
                    </label>
                    <input
                      type='email'
                      id='email'
                      name='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
                    />
                  </div>

                  <div>
                    <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                      Password
                    </label>
                    <input
                      type='password'
                      id='password'
                      name='password'
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
                    />
                  </div>

                  <div>
                    <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>
                      Confirm Password
                    </label>
                    <input
                      type='password'
                      id='confirmPassword'
                      name='confirmPassword'
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
                    />
                  </div>

                  <Button
                    type='submit'
                    className='w-full'
                    variant='primary'
                    isLoading={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>

                <div className='text-center text-sm text-gray-600'>
                  Already have an account?{' '}
                  <Link
                    href='/admin/login'
                    className='font-medium text-primary-600 hover:text-primary-500'
                  >
                    Sign in
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