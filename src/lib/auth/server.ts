// Server-side authentication utilities
// This file handles server-side auth operations, session management, and user validation

import { unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import { Session } from '@supabase/supabase-js';

import { getSupabaseServerClient } from '@/lib/supabase/clients/server-client';
import type { Database } from '@/types';

import { report, hasRolePermission } from './utils';

export type UserWithOrg = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  org_id: string;
  org_name: string;
  org_role: Database['public']['Enums']['member_role_t'];
};

/**
 * Get user ID for access control (preferred over getSession for guards)
 * Revalidates access token and is most reliable for authentication checks
 */

export async function getUserId(): Promise<string | null> {
  noStore();
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Get the current user session from cookies
 * Use getUserId() for access control, keep this only if you need session metadata
 */
export async function getSession(): Promise<Session | null> {
  noStore();
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ?? null;
}

/**
 * Get the current authenticated user with organization details
 * Minimal query - only fetches what's needed for rendering
 */
export async function getCurrentUser(): Promise<UserWithOrg | null> {
  noStore();
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('org_members')
    .select(
      `
      role,
      org:orgs ( id, name ),
      user:users ( id, email, name, avatar_url )
    `,
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: true }) // deterministic if multiple in future
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (error) report(error);
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email,
    name: data.user.name,
    avatar_url: data.user.avatar_url,
    org_id: data.org.id,
    org_name: data.org.name,
    org_role: data.role,
  };
}

/**
 * Ensure user exists and has an organization
 * Uses atomic RPC function to avoid race conditions
 */
export async function ensureUserAndOrg(
  userId: string,
  userEmail: string,
  userName?: string,
): Promise<string> {
  noStore();
  const supabase = await getSupabaseServerClient();

  try {
    const { data: orgId, error } = await supabase.rpc('ensure_user_and_org', {
      p_user_id: userId,
      p_email: userEmail,
      p_name: userName ?? '',
    });

    if (error) {
      report(error);
      throw new Error(`Failed to ensure user and org: ${error.message}`);
    }

    if (!orgId) {
      throw new Error('RPC function returned null org ID');
    }

    return orgId;
  } catch (error) {
    report(error);
    throw error;
  }
}

/**
 * Redirect unauthenticated users to sign-in page
 * Uses getUserId() for better performance and reliability
 */
export async function redirectIfUnauthenticated() {
  noStore();
  const uid = await getUserId();
  if (!uid) redirect('/auth/sign-in');
}

/**
 * Redirect authenticated users away from auth pages
 */
export async function redirectIfAuthenticated() {
  noStore();
  const u = await getCurrentUser();
  if (u) redirect('/app');
}

/**
 * Check if user has required role in organization
 * Optimized with role order map outside function
 */
export async function hasOrgRole(
  orgId: string,
  requiredRole: Database['public']['Enums']['member_role_t'],
): Promise<boolean> {
  noStore();
  const u = await getCurrentUser();
  return !!u && u.org_id === orgId && hasRolePermission(u.org_role, requiredRole);
}

/**
 * Get user's organization ID
 * Throws error if user is not authenticated or has no org
 */
export async function getUserOrgId(): Promise<string> {
  noStore();
  const u = await getCurrentUser();
  if (!u) throw new Error('User not authenticated');
  return u.org_id;
}

// ===== ERGONOMIC HELPERS =====
// Throwing versions you can use directly in loaders / server components

/**
 * Require user ID or redirect to sign-in
 * Throws redirect() if not authenticated
 */
export async function requireUserId(): Promise<string> {
  const uid = await getUserId();
  if (!uid) redirect('/auth/sign-in');
  return uid;
}

/**
 * Require current user or redirect to sign-in
 * Throws redirect() if not authenticated
 */
export async function requireCurrentUser(): Promise<UserWithOrg> {
  const u = await getCurrentUser();
  if (!u) redirect('/auth/sign-in');
  return u;
}
