import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { redirectIfAuthenticatedForServerComponent } from '@/features/auth/server';

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
      <Toaster />
    </main>
  );
}
