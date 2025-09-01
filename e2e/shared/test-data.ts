import { resolve } from 'path';

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '../../src/types';

import { safetyCheck, logSafetyInfo } from './safety';

/**
 * Load environment variables from .env.e2e file
 */
config({ path: resolve(process.cwd(), '.env.e2e') });

/**
 * Helper functions for setting up test data in E2E tests
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for E2E tests. Check .env.e2e file.');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface TestQRCode {
  id: string;
  slug: string;
  targetUrl: string;
  orgId: string;
  userId: string;
}

export interface TestData {
  orgId: string;
  userId: string;
  qrCode: TestQRCode;
}

/**
 * Creates test data for E2E tests using the same approach as seed.ts
 */
export async function createTestData(): Promise<TestData> {
  // Safety check before creating test data
  safetyCheck('Creating test data');

  const timestamp = Date.now();
  const testEmail = `e2e-test-${timestamp}@example.com`;
  const testPassword = 'e2e-test-password';

  try {
    // 1) Create auth user first (this resolves the foreign key constraint)
    console.log('Creating auth user for E2E test...');

    // Add retry logic for auth user creation
    let userId: string | undefined;
    let lastError: Error | null = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const result = await supabase.auth.admin.createUser({
          email: testEmail,
          password: testPassword,
          email_confirm: true,
        });

        if (!result.error && result.data?.user) {
          userId = result.data.user.id;
          console.log(`✅ Created auth user: ${userId}`);
          break;
        }

        lastError = result.error || new Error('Unknown auth error');
        console.log(`Auth user creation failed (attempt ${retryCount + 1}): ${lastError.message}`);
        retryCount++;

        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * retryCount, 3000);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`Auth user creation exception (attempt ${retryCount + 1}): ${error}`);
        retryCount++;

        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * retryCount, 3000);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }

    if (!userId) {
      throw new Error(
        `Failed to create auth user after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
      );
    }

    // 2) Create test organization
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .insert({
        name: `E2E Test Org ${timestamp}`,
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // 3) Create user profile in public.users table
    const { error: profileError } = await supabase.from('users').insert({
      id: userId,
      email: testEmail,
      name: 'E2E Test User',
      avatar_url: null,
    });

    if (profileError) throw profileError;

    // 4) Create org membership
    const { error: membershipError } = await supabase.from('org_members').insert({
      org_id: org.id,
      user_id: userId,
      role: 'owner',
    });

    if (membershipError) throw membershipError;

    // 5) Create test QR code
    const testSlug = `e2e-test-${timestamp}`;

    // No prefix validation needed for local testing
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .insert({
        org_id: org.id,
        name: 'E2E Test QR Code',
        slug: testSlug,
        current_target_url: 'https://example.com/e2e-test-target',
        status: 'active',
        created_by: userId,
      })
      .select()
      .single();

    if (qrError) throw qrError;

    return {
      orgId: org.id,
      userId: userId,
      qrCode: {
        id: qrCode.id,
        slug: qrCode.slug,
        targetUrl: qrCode.current_target_url,
        orgId: org.id,
        userId: userId,
      },
    };
  } catch (error) {
    console.error('Failed to create test data:', error);
    throw error;
  }
}

/**
 * Cleans up test data after E2E tests
 */
export async function cleanupTestData(testData: TestData | undefined): Promise<void> {
  if (!testData) return;

  // Log safety information for debugging
  logSafetyInfo();

  try {
    // Delete in reverse order to respect foreign key constraints
    await supabase.from('qr_codes').delete().eq('id', testData.qrCode.id);
    await supabase
      .from('org_members')
      .delete()
      .eq('org_id', testData.orgId)
      .eq('user_id', testData.userId);
    await supabase.from('users').delete().eq('id', testData.userId);
    await supabase.from('orgs').delete().eq('id', testData.orgId);

    // Delete the auth user
    await supabase.auth.admin.deleteUser(testData.userId);

    console.log('✅ Test data cleaned up successfully');
  } catch (error) {
    console.warn('Error during test data cleanup:', error);
  }
}

/**
 * Creates a QR code that will return null (for testing fallback)
 */
export async function createInactiveQRCode(): Promise<TestData> {
  const timestamp = Date.now();
  const testEmail = `e2e-test-inactive-${timestamp}@example.com`;
  const testPassword = 'e2e-test-inactive-password';

  try {
    // 1) Create auth user first
    console.log('Creating auth user for inactive QR code test...');

    // Add retry logic for auth user creation
    let userRes, userErr;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const result = await supabase.auth.admin.createUser({
          email: testEmail,
          password: testPassword,
          email_confirm: true,
        });

        userRes = result.data;
        userErr = result.error;

        if (!userErr && userRes?.user) {
          break; // Success, exit retry loop
        }

        // If we get here, there was an error
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(
            `Auth user creation failed, retrying (${retryCount}/${maxRetries}): ${userErr?.message}`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
        }
      } catch (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(
            `Auth user creation exception, retrying (${retryCount}/${maxRetries}): ${error}`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
        } else {
          throw error;
        }
      }
    }

    if (userErr || !userRes?.user) {
      console.error('Auth user creation failed after all retries:', userErr);
      throw new Error(
        `Failed to create auth user after ${maxRetries} attempts: ${userErr?.message || 'Unknown error'}`,
      );
    }

    const userId = userRes.user.id;

    // 2) Create test organization
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .insert({
        name: `E2E Test Org Inactive ${timestamp}`,
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // 3) Create user profile
    const { error: profileError } = await supabase.from('users').insert({
      id: userId,
      email: testEmail,
      name: 'E2E Test User Inactive',
      avatar_url: null,
    });

    if (profileError) throw profileError;

    // 4) Create org membership
    const { error: membershipError } = await supabase.from('org_members').insert({
      org_id: org.id,
      user_id: userId,
      role: 'owner',
    });

    if (membershipError) throw membershipError;

    // 5) Create inactive QR code
    const testSlug = `e2e-inactive-${timestamp}`;
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .insert({
        org_id: org.id,
        name: 'E2E Test Inactive QR Code',
        slug: testSlug,
        current_target_url: 'https://example.com/inactive-target',
        status: 'archived', // This will cause the redirect to fail
        created_by: userId,
      })
      .select()
      .single();

    if (qrError) throw qrError;

    return {
      orgId: org.id,
      userId: userId,
      qrCode: {
        id: qrCode.id,
        slug: qrCode.slug,
        targetUrl: qrCode.current_target_url,
        orgId: org.id,
        userId: userId,
      },
    };
  } catch (error) {
    console.error('Failed to create inactive QR code test data:', error);
    throw error;
  }
}
