// Central auth-related types and constants derived from generated Database types
import type { Database } from './database';
import { Constants } from './database';

// Types from Supabase generated enums
export type PlanType = Database['public']['Enums']['plan_t'];
export type MemberRole = Database['public']['Enums']['member_role_t'];
export type QRStatus = Database['public']['Enums']['qr_status_t'];

// Canonical enum arrays derived from generated constants (single source of truth)
export const PLAN_TYPES = Constants.public.Enums.plan_t as readonly PlanType[];
export const MEMBER_ROLES = Constants.public.Enums.member_role_t as readonly MemberRole[];
export const QR_STATUSES = Constants.public.Enums.qr_status_t as readonly QRStatus[];
