'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { auth } from '@/infrastructure/supabase/utils';
import { getInitials } from '@/shared/utils/user';

type Props = {
  user: {
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
};

export function AccountMenu({ user }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const t = useTranslations();
  const locale = useLocale();

  const initials = useMemo(() => getInitials(user?.name, user?.email), [user?.name, user?.email]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await auth.signOut();
      if (error) {
        toast.error(t('dashboard.nav.signOutError'));
        return;
      }
      toast.success(t('dashboard.nav.signOutSuccess'));
      router.replace(`/${locale}/sign-in`);
    } catch (err) {
      toast.error(t('dashboard.nav.unexpectedError'));
      console.error('Sign out error:', err);
    } finally {
      setIsSigningOut(false);
      setOpen(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 -mr-3"
          aria-label={t('dashboard.accountMenu.ariaLabel')}
          data-testid="account-menu-trigger"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={user?.avatarUrl}
              alt={
                user?.name
                  ? t('dashboard.accountMenu.avatarAltNamed', { name: user.name })
                  : t('dashboard.accountMenu.avatarAlt')
              }
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm">
            {user?.name || user?.email || t('dashboard.accountMenu.fallbackAccount')}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>
          <div className="text-xs text-muted-foreground">
            <div className="truncate font-medium text-foreground">
              {user?.name || t('dashboard.accountMenu.fallbackUser')}
            </div>
            <div className="truncate">{user?.email}</div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          {isSigningOut ? t('dashboard.nav.signingOut') : t('dashboard.nav.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
