import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import Button from '@/components/buttons/Button';

import { useToast } from '@/contexts/ToastContext';
import { logger } from '@/utils/logger';
import { supabase } from '@/utils/supabase';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Components', href: '/components' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        logger.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      showToast({ message: 'Logged out successfully', type: 'success' });
      router.push('/');
    } catch (error) {
      showToast({ message: 'Error logging out', type: 'error' });
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">Your Brand</span>
            </Link>
          </div>
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-8">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link href="/user/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/user/signup">
                  <Button variant="primary">Sign Up</Button>
                </Link>
              </>
            ) : (
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
