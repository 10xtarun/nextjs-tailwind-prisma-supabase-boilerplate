import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

import Button from '@/components/buttons/Button';
import ArrowLink from '@/components/links/ArrowLink';
import Seo from '@/components/Seo';
import Skeleton from '@/components/Skeleton';

import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/utils/supabase';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  clientId?: string;
  client?: {
    id: string;
    name: string;
  };
  isApproved: boolean;
}

interface ProfileFormData {
  fullName: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (!session && router.pathname !== "/login") {
        router.push('/user/login');
        return;
      }

      // Get access token
      const access_token = session?.access_token;

      if (!access_token && router.pathname !== "/login") {
        router.push('/user/login');
        return;
      }

      if (!access_token) {
        throw new Error('Access token is required');
      }

      await fetchProfile(access_token);
    } catch (error) {
      console.log(error);
      showToast({
        message: error instanceof Error ? error.message : 'Authentication failed',
        type: 'error',
      });
      // router.push('/user/login');
    }
  };

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/user/login');
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch profile');
      }

      setProfile(result.user);
      setValue('fullName', result.user.fullName);
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Failed to fetch profile',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token && router.pathname !== "/login") {
        router.push('/user/login');
        return;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        router.push('/user/login');
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      setProfile(result.user);
      setIsEditing(false);
      showToast({ message: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Failed to update profile',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Seo templateTitle='Profile' />
      <main>
        <section className='bg-white'>
          <div className='layout min-h-screen py-20'>
            <div className='mx-auto max-w-2xl'>
              <div className='flex items-center justify-between'>
                <ArrowLink href='/' className='mb-8'>
                  Back to Home
                </ArrowLink>
              </div>

              <div className='bg-white p-8 shadow-lg rounded-lg border border-gray-200'>
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <h1 className='text-2xl font-bold'>Profile</h1>
                    {!isEditing && (
                      <Button
                        variant='outline'
                        onClick={() => setIsEditing(true)}
                        disabled={isLoading}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  {isLoading ? (
                    <div className='space-y-4'>
                      <Skeleton className='h-8 w-full' />
                      <Skeleton className='h-8 w-full' />
                      <Skeleton className='h-8 w-full' />
                    </div>
                  ) : isEditing ? (
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
                        />
                        {errors.fullName && (
                          <p className='mt-1 text-sm text-red-600'>{errors.fullName.message}</p>
                        )}
                      </div>

                      <div className='flex space-x-4'>
                        <Button
                          type='submit'
                          variant='primary'
                          isLoading={isLoading}
                        >
                          Save Changes
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          onClick={() => setIsEditing(false)}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : profile ? (
                    <div className='space-y-6'>
                      <div>
                        <h3 className='text-sm font-medium text-gray-500'>Full Name</h3>
                        <p className='mt-1 text-sm text-gray-900'>{profile.fullName}</p>
                      </div>

                      <div>
                        <h3 className='text-sm font-medium text-gray-500'>Email</h3>
                        <p className='mt-1 text-sm text-gray-900'>{profile.email}</p>
                      </div>

                      <div>
                        <h3 className='text-sm font-medium text-gray-500'>Role</h3>
                        <p className='mt-1 text-sm text-gray-900'>{profile.role}</p>
                      </div>

                      {profile.client && (
                        <div>
                          <h3 className='text-sm font-medium text-gray-500'>Client</h3>
                          <p className='mt-1 text-sm text-gray-900'>{profile.client.name}</p>
                        </div>
                      )}

                      <div>
                        <h3 className='text-sm font-medium text-gray-500'>Account Status</h3>
                        <p className='mt-1 text-sm'>
                          {profile.isApproved ? (
                            <span className='text-green-600'>Approved</span>
                          ) : (
                            <span className='text-yellow-600'>Pending Approval</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
} 