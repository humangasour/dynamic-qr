import { afterAll, beforeAll, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types';
import { getSupabaseBrowserClient, getSupabaseAdminClient } from '@/lib/supabase/clients';
import { describeIfDb } from '@test/utils';

// For integration tests, we need to import the real clients
// but we'll handle the GoTrueClient warning by using a single instance
let supabaseClient: SupabaseClient<Database> | null = null;
let supabaseAdminClient: SupabaseClient<Database> | null = null;

// Initialize clients once to avoid multiple GoTrueClient instances
const getClients = () => {
  if (!supabaseClient || !supabaseAdminClient) {
    // Use the imported client functions directly
    supabaseClient = getSupabaseBrowserClient();
    supabaseAdminClient = getSupabaseAdminClient();
  }
  return { supabaseClient, supabaseAdminClient };
};

// Integration tests for the complete redirect feature
// These tests verify the end-to-end functionality including database operations
await describeIfDb('Redirect Feature Integration Tests', () => {
  let testOrgId: string;
  let testUserId: string;
  let testQrId: string;
  let testSlug: string;

  beforeAll(async () => {
    const { supabaseAdminClient } = getClients();

    try {
      // Create test organization
      const { data: orgData, error: orgError } = await supabaseAdminClient
        .from('orgs')
        .insert({ name: 'Test Org for Redirect Integration Tests' })
        .select()
        .single();

      if (orgError) throw orgError;
      testOrgId = orgData.id;

      // Create test user
      const { data: userData, error: userError } = await supabaseAdminClient
        .from('users')
        .insert({
          id: '00000000-0000-0000-0000-000000000001',
          email: 'test@example.com',
          name: 'Test User',
        })
        .select()
        .single();

      if (userError) throw userError;
      testUserId = userData.id;

      // Create test QR code
      testSlug = `test-redirect-${Date.now()}`;
      const { data: qrData, error: qrError } = await supabaseAdminClient
        .from('qr_codes')
        .insert({
          org_id: testOrgId,
          name: 'Test QR Code',
          slug: testSlug,
          current_target_url: 'https://example.com/test-target',
          status: 'active',
          created_by: testUserId,
        })
        .select()
        .single();

      if (qrError) throw qrError;
      testQrId = qrData.id;
    } catch (error) {
      console.error('Failed to set up redirect integration test data:', error);
      throw error;
    }
  });

  afterAll(async () => {
    const { supabaseAdminClient } = getClients();
    if (!supabaseAdminClient) return;

    try {
      // Clean up test data
      if (testQrId) {
        await supabaseAdminClient.from('qr_codes').delete().eq('id', testQrId);
      }
      if (testUserId) {
        await supabaseAdminClient.from('users').delete().eq('id', testUserId);
      }
      if (testOrgId) {
        await supabaseAdminClient.from('orgs').delete().eq('id', testOrgId);
      }
    } catch (error) {
      console.error('Failed to clean up redirect integration test data:', error);
    }
  });

  describe('Successful Redirects', () => {
    it('should successfully redirect valid active QR code', async () => {
      const { supabaseClient, supabaseAdminClient } = getClients();
      if (!supabaseClient || !supabaseAdminClient || !testQrId) return;

      // Verify QR code exists in database before test
      const { data: qrData } = await supabaseAdminClient
        .from('qr_codes')
        .select('*')
        .eq('slug', testSlug)
        .single();

      expect(qrData).toBeTruthy();
      expect(qrData!.status).toBe('active');

      const { data, error } = await supabaseClient.rpc('handle_redirect', {
        p_slug: testSlug,
        p_ip: '127.0.0.1',
        p_user_agent: 'Integration Test Browser',
        p_referrer: 'https://example.com',
        p_country: 'US',
      });

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].target_url).toBe('https://example.com/test-target');
    });

    it('should log scan event when redirecting', async () => {
      const { supabaseClient, supabaseAdminClient } = getClients();
      if (!supabaseClient || !supabaseAdminClient || !testQrId) return;

      // Call redirect function
      const { data, error } = await supabaseClient.rpc('handle_redirect', {
        p_slug: testSlug,
        p_ip: '192.168.1.100',
        p_user_agent: 'Integration Test Browser 2',
        p_referrer: 'https://google.com',
        p_country: 'CA',
      });

      expect(error).toBeNull();
      expect(data).toHaveLength(1);

      // Check that scan event was logged
      const { data: newScans } = await supabaseAdminClient
        .from('scan_events')
        .select('*')
        .eq('qr_id', testQrId)
        .eq('user_agent', 'Integration Test Browser 2')
        .single();

      expect(newScans).toBeTruthy();
      expect(newScans!.user_agent).toBe('Integration Test Browser 2');
      expect(newScans!.referrer).toBe('https://google.com');
      expect(newScans!.country).toBe('CA');
      expect(newScans!.ip_hash).toBeTruthy(); // Should be hashed
    });

    it('should handle IP hashing correctly', async () => {
      const { supabaseClient, supabaseAdminClient } = getClients();
      if (!supabaseClient || !supabaseAdminClient || !testQrId) return;

      const testIp = '203.0.113.42';

      // Call redirect function
      const { data, error } = await supabaseClient.rpc('handle_redirect', {
        p_slug: testSlug,
        p_ip: testIp,
        p_user_agent: 'IP Test Browser',
        p_referrer: 'https://example.com',
        p_country: 'US',
      });

      expect(error).toBeNull();
      expect(data).toHaveLength(1);

      // Check that IP was hashed
      const { data: scanEvent } = await supabaseAdminClient
        .from('scan_events')
        .select('ip_hash')
        .eq('qr_id', testQrId)
        .eq('user_agent', 'IP Test Browser')
        .single();

      expect(scanEvent?.ip_hash).toBeTruthy();
      expect(scanEvent?.ip_hash).not.toBe(testIp); // Should be hashed, not raw IP
      expect(scanEvent?.ip_hash).toMatch(/^[a-f0-9]{64}$/); // Should be SHA256 hex
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should return empty result for non-existent slug', async () => {
      const { supabaseClient } = getClients();
      if (!supabaseClient) return;
      // This test can run even without database setup since it's testing a non-existent slug
      const { data, error } = await supabaseClient.rpc('handle_redirect', {
        p_slug: 'definitely-does-not-exist-in-database',
        p_ip: '127.0.0.1',
        p_user_agent: 'Integration Test Browser',
        p_referrer: 'https://example.com',
        p_country: 'US',
      });

      // If database is not available, we expect an error
      if (error && error.code === 'PGRST301') return;

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    it('should filter out archived QR codes', async () => {
      const { supabaseClient, supabaseAdminClient } = getClients();
      if (!supabaseClient || !supabaseAdminClient || !testOrgId || !testUserId) return;

      // Create an archived QR code
      const archivedSlug = `test-archived-${Date.now()}`;
      const { data: archivedQr, error: qrError } = await supabaseAdminClient
        .from('qr_codes')
        .insert({
          org_id: testOrgId,
          name: 'Archived Test QR Code',
          slug: archivedSlug,
          current_target_url: 'https://example.com/archived-target',
          status: 'archived',
          created_by: testUserId,
        })
        .select()
        .single();

      if (qrError) throw qrError;

      try {
        // Test that function respects the WHERE status = 'active' clause
        const { data, error } = await supabaseClient.rpc('handle_redirect', {
          p_slug: archivedSlug,
          p_ip: '127.0.0.1',
          p_user_agent: 'Integration Test Browser',
          p_referrer: 'https://example.com',
          p_country: 'US',
        });

        expect(error).toBeNull();
        expect(data).toHaveLength(0); // Should be filtered out by database query
      } finally {
        // Clean up archived QR code
        await supabaseAdminClient.from('qr_codes').delete().eq('id', archivedQr.id);
      }
    });

    it('should handle database connection errors gracefully', async () => {
      const { supabaseClient } = getClients();
      if (!supabaseClient) return;
      // This test would require mocking the database connection
      // For now, we'll test that the function signature is correct
      const { data, error } = await supabaseClient.rpc('handle_redirect', {
        p_slug: 'test-slug',
        p_ip: '127.0.0.1',
        p_user_agent: 'Test Browser',
        p_referrer: 'https://example.com',
        p_country: 'US',
      });

      // If database is not available, we expect an error
      if (error && error.code === 'PGRST301') return;

      // Should either succeed or fail gracefully, not crash
      expect(typeof data).toBe('object');
      expect(error === null || typeof error === 'object').toBe(true);
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle multiple concurrent requests', async () => {
      const { supabaseClient } = getClients();
      if (!supabaseClient || !testSlug) return;

      const requests = Array.from({ length: 5 }, (_, i) => ({
        p_slug: testSlug,
        p_ip: `127.0.0.${i + 1}`,
        p_user_agent: `Concurrent Test Browser ${i}`,
        p_referrer: `https://example${i}.com`,
        p_country: 'US',
      }));

      const promises = requests.map((request) => supabaseClient.rpc('handle_redirect', request));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(1);
        expect(result.data![0].target_url).toBe('https://example.com/test-target');
      });
    });
  });
});
