'use client';

import { createContext, useContext, useMemo } from 'react';

type UserOrgContextValue = {
  userId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  orgId: string;
  orgName: string;
  orgRole: string; // keep as string to avoid importing enums here
};

const UserOrgContext = createContext<UserOrgContextValue | null>(null);

export function UserOrgProvider({
  value,
  children,
}: {
  value: UserOrgContextValue;
  children: React.ReactNode;
}) {
  // Memoize to avoid unnecessary re-renders of consumers
  const memo = useMemo(
    () => value,
    [
      value.userId,
      value.email,
      value.name,
      value.avatarUrl,
      value.orgId,
      value.orgName,
      value.orgRole,
    ],
  );

  return <UserOrgContext.Provider value={memo}>{children}</UserOrgContext.Provider>;
}

export function useUserOrg() {
  const ctx = useContext(UserOrgContext);
  if (!ctx) throw new Error('useUserOrg must be used within <UserOrgProvider>');
  return ctx;
}
