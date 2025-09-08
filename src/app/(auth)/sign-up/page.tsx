import type { Metadata } from 'next';

import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { redirectIfAuthenticatedForServerComponent } from '@/features/auth/server';

export const metadata: Metadata = {
  title: 'Sign up | Dynamic QR',
  description: 'Create a Dynamic QR account',
};

export default async function SignUpPage() {
  await redirectIfAuthenticatedForServerComponent();
  return (
    <main role="main" aria-labelledby="signup-heading">
      <Card>
        <CardHeader className="space-y-1">
          <h2 id="signup-heading" className="text-2xl font-semibold">
            Sign up
          </h2>
          <CardDescription>Create a new account to get started with Dynamic QR</CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </main>
  );
}
