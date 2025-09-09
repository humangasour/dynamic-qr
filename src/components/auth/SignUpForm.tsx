'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';

import { withLocaleHref } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { signUpSchema } from '@/shared/schemas/auth';
import { auth } from '@/infrastructure/supabase/utils';
import { api } from '@/infrastructure/trpc/client';

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const ensureUserAndOrgMutation = api.auth.ensureUserAndOrg.useMutation();
  const t = useTranslations('auth.form.signUp');
  const locale = useLocale();
  useTranslations();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await auth.signUp(data.email, data.password);

      if (signUpError) {
        toast.error(signUpError.message || t('errorCreate'));
        return;
      }

      // If email confirmation is enabled, user/session may be missing
      if (!authData.session) {
        toast.success(t('emailVerify'));
        return;
      }

      // Call tRPC mutation to ensure user and organization (identity derived server-side)
      const result = await ensureUserAndOrgMutation.mutateAsync({ userName: data.name });

      if (!result.success) {
        toast.error(t('setupError'));
        return;
      }

      toast.success(t('success'));
      router.replace(withLocaleHref('/dashboard', locale));
    } catch (error) {
      toast.error(t('unexpectedError'));
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        aria-label={t('ariaLabel')}
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name.label')}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder={t('name.placeholder')}
                  autoComplete="name"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email.label')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('email.placeholder')}
                  autoComplete="email"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('password.label')}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('password.createPlaceholder')}
                  autoComplete="new-password"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('passwordConfirm.label')}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('passwordConfirm.placeholder')}
                  autoComplete="new-password"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          aria-describedby="signup-status"
        >
          {isLoading ? t('creating') : t('create')}
        </Button>

        <div id="signup-status" className="sr-only" aria-live="polite" aria-atomic="true">
          {isLoading ? t('creatingStatus') : ''}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {t('alreadyHave')}{' '}
          <Link
            href={withLocaleHref('/sign-in', locale)}
            className="font-medium text-primary hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            {t('signInLinkLabel')}
          </Link>
        </div>
      </form>
    </Form>
  );
}
