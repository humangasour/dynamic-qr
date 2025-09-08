import { redirect } from 'next/navigation';

import { getUserIdForServerComponent } from '@/features/auth/server';

export default async function Home() {
  // Check if user is authenticated
  const userId = await getUserIdForServerComponent();

  if (userId) {
    // User is authenticated, redirect to dashboard
    redirect('/dashboard');
  } else {
    // User is not authenticated, redirect to sign-in
    redirect('/sign-in');
  }
}
