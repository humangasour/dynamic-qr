'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { auth } from '@/infrastructure/supabase/utils';

export function DashboardNav() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      const { error } = await auth.signOut();

      if (error) {
        toast.error('Failed to sign out');
        return;
      }

      toast.success('Signed out successfully');
      router.replace('/auth/sign-in');
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav
      className="bg-white shadow-sm border-b border-gray-200"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Dynamic QR</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-label="Sign out of your account"
            >
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
