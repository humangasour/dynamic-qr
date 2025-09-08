'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { api } from '@/infrastructure/trpc/client';
import { createQrInputSchema, type CreateQrInput } from '@shared/schemas/qr';
import { mapTrpcError } from '@/shared/utils/trpc-ui-errors';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/typography/Heading';

export function CreateQrForm() {
  const router = useRouter();
  const form = useForm<CreateQrInput>({
    resolver: zodResolver(createQrInputSchema),
    defaultValues: {
      name: '',
      targetUrl: '',
    },
  });

  const createQrMutation = api.qr.create.useMutation({
    onSuccess: (result) => {
      toast.success('QR code created successfully!');
      router.push(`/qr/${result.id}`);
    },
    onError: (error) => {
      const ui = mapTrpcError(error);
      console.error('Error creating QR code:', error);
      const friendly =
        ui.type === 'bad_request'
          ? ui.message
          : ui.type === 'unauthorized'
            ? 'You do not have permission to create QR codes.'
            : 'Failed to create QR code. Please try again.';
      toast.error(friendly);
      form.setError('root', { type: 'server', message: friendly });
    },
  });

  const onSubmit = async (data: CreateQrInput) => {
    form.clearErrors('root');
    createQrMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Heading as="h2" size="h3">
            QR Code Details
          </Heading>
        </CardTitle>
        <CardDescription>
          Enter the details for your new QR code. It will redirect users to your target URL.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            aria-busy={createQrMutation.isPending}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My QR Code"
                      autoComplete="off"
                      maxLength={255}
                      {...field}
                      disabled={createQrMutation.isPending}
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
                  <FormLabel>Target URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      autoComplete="url"
                      {...field}
                      disabled={createQrMutation.isPending}
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
              <Button type="submit" disabled={createQrMutation.isPending} className="flex-1">
                {createQrMutation.isPending ? 'Creating...' : 'Create QR Code'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={createQrMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
