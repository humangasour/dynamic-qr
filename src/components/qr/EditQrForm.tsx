'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { api } from '@/infrastructure/trpc/client';
import { mapTrpcError } from '@/shared/utils/trpc-ui-errors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Heading } from '@/components/typography/Heading';
import type { GetQrByIdOutput } from '@shared/schemas/qr';
import { updateQrInputSchema } from '@shared/schemas/qr';

const editQrFormSchema = updateQrInputSchema.omit({ id: true, note: true });

type EditQrFormValues = z.infer<typeof editQrFormSchema>;

interface EditQrFormProps {
  id: string;
  initialData?: GetQrByIdOutput;
}

export function EditQrForm({ id, initialData }: EditQrFormProps) {
  const router = useRouter();
  const t = useTranslations('qr.form.edit');
  const utils = api.useUtils();

  const form = useForm<EditQrFormValues>({
    resolver: zodResolver(editQrFormSchema),
    defaultValues: {
      name: '',
      targetUrl: '',
    },
  });

  const { data, isLoading, error } = api.qr.getById.useQuery(
    { id },
    {
      initialData,
      retry: 1,
    },
  );

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name,
        targetUrl: data.targetUrl,
      });
    }
  }, [data, form]);

  useEffect(() => {
    if (error) {
      const ui = mapTrpcError(error);
      const friendly =
        ui.type === 'unauthorized'
          ? t('error.unauthorized')
          : ui.type === 'not_found'
            ? t('error.notFound')
            : t('error.generic');
      toast.error(friendly);
      form.setError('root', { type: 'server', message: friendly });
    }
  }, [error, form, t]);

  const updateMutation = api.qr.update.useMutation({
    onSuccess: async (updated) => {
      utils.qr.getById.setData({ id }, updated);
      await utils.qr.list.invalidate();
      toast.success(t('toast.success'));
      form.reset({
        name: updated.name,
        targetUrl: updated.targetUrl,
      });
    },
    onError: (err) => {
      const ui = mapTrpcError(err);
      console.error('Error updating QR code:', err);
      const friendly =
        ui.type === 'bad_request'
          ? ui.message
          : ui.type === 'unauthorized'
            ? t('error.unauthorized')
            : ui.type === 'not_found'
              ? t('error.notFound')
              : t('error.generic');
      toast.error(friendly);
      form.setError('root', { type: 'server', message: friendly });
    },
  });

  const onSubmit = (values: EditQrFormValues) => {
    form.clearErrors('root');
    updateMutation.mutate({
      id,
      ...values,
    });
  };

  const isPending = isLoading || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Heading as="h2" size="h3">
            {t('heading')}
          </Heading>
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" aria-busy={isPending}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name.label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('name.placeholder')}
                      autoComplete="off"
                      maxLength={255}
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('targetUrl.label')}</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder={t('targetUrl.placeholder')}
                      autoComplete="url"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root?.message ? (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            ) : null}

            <div className="flex gap-4">
              <Button type="submit" disabled={isPending} className="flex-1">
                {updateMutation.isPending ? t('submitting') : t('submit')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
