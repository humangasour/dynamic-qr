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
import { signInSchema } from '@/shared/schemas/auth';
import { auth } from '@/infrastructure/supabase/utils';

type SignInFormData = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('auth.form.signIn');
  const locale = useLocale();
  useTranslations();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);

    try {
      const { error } = await auth.signIn(data.email, data.password);

      if (error) {
        toast.error(error.message || t('errorToast'));
        return;
      }

      toast.success(t('successToast'));
      router.replace(withLocaleHref('/dashboard', locale));
    } catch (error) {
      toast.error(t('unexpectedError'));
      console.error('Sign in error:', error);
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
                  placeholder={t('password.placeholder')}
                  autoComplete="current-password"
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
          aria-describedby="signin-status"
        >
          {isLoading ? t('submitting') : t('submit')}
        </Button>

        <div id="signin-status" className="sr-only" aria-live="polite" aria-atomic="true">
          {isLoading ? t('submittingStatus') : ''}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <Link
            href={withLocaleHref('/sign-up', locale)}
            className="font-medium text-primary hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            {t('signUpLinkLabel')}
          </Link>
        </div>
      </form>
    </Form>
  );
}
