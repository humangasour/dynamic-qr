// ===== Database Helper Functions
// Example usage and utilities for database operations
// Integrates with your existing Supabase client setup

import type { Database } from '@/types';

import { getSupabaseClient } from './client';

// ===== Type Aliases for Easy Use

// Organization Types
export type Organization = Database['public']['Tables']['orgs']['Row'];
export type NewOrganization = Database['public']['Tables']['orgs']['Insert'];
export type UpdateOrganization = Database['public']['Tables']['orgs']['Update'];

// QR Code Types
export type QRCode = Database['public']['Tables']['qr_codes']['Row'];
export type NewQRCode = Database['public']['Tables']['qr_codes']['Insert'];
export type UpdateQRCode = Database['public']['Tables']['qr_codes']['Update'];

// User Types
export type User = Database['public']['Tables']['users']['Row'];
export type NewUser = Database['public']['Tables']['users']['Insert'];

// Organization Member Types
export type OrgMember = Database['public']['Tables']['org_members']['Row'];
export type NewOrgMember = Database['public']['Tables']['org_members']['Insert'];

// QR Version Types
export type QRVersion = Database['public']['Tables']['qr_versions']['Row'];
export type NewQRVersion = Database['public']['Tables']['qr_versions']['Insert'];

// Scan Event Types
export type ScanEvent = Database['public']['Tables']['scan_events']['Row'];
export type NewScanEvent = Database['public']['Tables']['scan_events']['Insert'];

// Daily Aggregate Types
export type DailyAggregate = Database['public']['Tables']['daily_aggregates']['Row'];
export type NewDailyAggregate = Database['public']['Tables']['daily_aggregates']['Insert'];

// ===== Organization Functions

/**
 * Create a new organization
 */
export async function createOrganization(org: NewOrganization): Promise<Organization | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('orgs').insert(org).select().single();

  if (error) {
    console.error('Error creating organization:', error);
    return null;
  }

  return data as Organization;
}

/**
 * Get organizations for the current user (respects RLS policies)
 */
export async function getUserOrganizations(): Promise<Organization[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('orgs').select('*');

  if (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }

  return (data || []) as Organization[];
}

/**
 * Update an organization
 */
export async function updateOrganization(
  id: string,
  updates: UpdateOrganization,
): Promise<Organization | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('orgs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating organization:', error);
    return null;
  }

  return data as Organization;
}

// ===== QR Code Functions

/**
 * Create a new QR code
 */
export async function createQRCode(qr: NewQRCode): Promise<QRCode | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('qr_codes').insert(qr).select().single();

  if (error) {
    console.error('Error creating QR code:', error);
    return null;
  }

  return data;
}

/**
 * Get QR codes for an organization (respects RLS policies)
 */
export async function getOrganizationQRCodes(orgId: string): Promise<QRCode[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('qr_codes').select('*').eq('org_id', orgId);

  if (error) {
    console.error('Error fetching QR codes:', error);
    return [];
  }

  return data || [];
}

/**
 * Get QR code by slug (for redirect service)
 */
export async function getQRCodeBySlug(slug: string): Promise<QRCode | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error fetching QR code by slug:', error);
    return null;
  }

  return data;
}

/**
 * Update QR code target URL
 */
export async function updateQRCodeTarget(
  id: string,
  newTargetUrl: string,
  note?: string,
): Promise<QRCode | null> {
  const supabase = getSupabaseClient();

  // Start a transaction-like operation
  const { data: qrCode, error: updateError } = await supabase
    .from('qr_codes')
    .update({ current_target_url: newTargetUrl })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating QR code:', updateError);
    return null;
  }

  // Create version history entry
  if (qrCode) {
    const { error: versionError } = await supabase.from('qr_versions').insert({
      qr_id: id,
      target_url: newTargetUrl,
      note: note || 'URL updated',
      created_by: qrCode.created_by,
    });

    if (versionError) {
      console.error('Error creating version history:', versionError);
    }
  }

  return qrCode;
}

// ===== User Management Functions

/**
 * Add user to organization
 */
export async function addUserToOrganization(
  orgId: string,
  userId: string,
  role: Database['public']['Enums']['member_role_t'] = 'viewer',
): Promise<OrgMember | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('org_members')
    .insert({
      org_id: orgId,
      user_id: userId,
      role,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding user to organization:', error);
    return null;
  }

  return data;
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(orgId: string): Promise<OrgMember[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('org_members').select('*').eq('org_id', orgId);

  if (error) {
    console.error('Error fetching organization members:', error);
    return [];
  }

  return data || [];
}

// ===== Analytics Functions

/**
 * Record a scan event
 */
export async function recordScanEvent(scan: NewScanEvent): Promise<ScanEvent | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('scan_events').insert(scan).select().single();

  if (error) {
    console.error('Error recording scan event:', error);
    return null;
  }

  return data;
}

/**
 * Get scan events for a QR code
 */
export async function getQRCodeScans(qrId: string): Promise<ScanEvent[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('scan_events')
    .select('*')
    .eq('qr_id', qrId)
    .order('ts', { ascending: false });

  if (error) {
    console.error('Error fetching scan events:', error);
    return [];
  }

  return data || [];
}
