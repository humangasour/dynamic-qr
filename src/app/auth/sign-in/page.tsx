import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { SignInForm } from '@/components/auth/SignInForm';
import { redirectIfAuthenticatedForServerComponent } from '@/features/auth/server';

export default async function SignInPage() {
  await redirectIfAuthenticatedForServerComponent();
  return (
    <main role="main" aria-labelledby="signin-heading">
      <Card>
        <CardHeader className="space-y-1">
          <h2 id="signin-heading" className="text-2xl font-semibold">
            Sign in
          </h2>
          <CardDescription>
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
      <Toaster />
    </main>
  );
}
