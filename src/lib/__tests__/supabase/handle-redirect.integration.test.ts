import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { supabase, supabaseAdmin } from '@/lib/supabase/client';

// Integration tests that require a real database connection
// These tests are skipped by default and should only be run when a test database is available
describe.skip('handle_redirect Integration Tests', () => {
  let testOrgId: string;
  let testUserId: string;
  let testQrId: string;
  let testSlug: string;

  beforeAll(async () => {
    // Skip if no admin client is available
    if (!supabaseAdmin.client) {
      console.log('Skipping integration tests: No admin client available');
      return;
    }

    try {
      // Create test organization
      const { data: orgData, error: orgError } = await supabaseAdmin.client
        .from('orgs')
        .insert({ name: 'Test Org for Integration Tests' })
        .select()
        .single();

      if (orgError) throw orgError;
      testOrgId = orgData.id;

      // Create test user
      const { data: userData, error: userError } = await supabaseAdmin.client
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
      testSlug = `test-integration-${Date.now()}`;
      const { data: qrData, error: qrError } = await supabaseAdmin.client
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
      console.error('Failed to set up integration test data:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (!supabaseAdmin.client) return;

    try {
      // Clean up test data
      if (testQrId) {
        await supabaseAdmin.client.from('qr_codes').delete().eq('id', testQrId);
      }
      if (testUserId) {
        await supabaseAdmin.client.from('users').delete().eq('id', testUserId);
      }
      if (testOrgId) {
        await supabaseAdmin.client.from('orgs').delete().eq('id', testOrgId);
      }
    } catch (error) {
      console.error('Failed to clean up integration test data:', error);
    }
  });

  it('should successfully redirect valid active QR code and verify database state', async () => {
    if (!supabaseAdmin.client) return;

    // Verify QR code exists in database before test
    const { data: qrData } = await supabaseAdmin.client
      .from('qr_codes')
      .select('*')
      .eq('slug', testSlug)
      .single();

    expect(qrData).toBeTruthy();
    expect(qrData!.status).toBe('active');

    const { data, error } = await supabase.client.rpc('handle_redirect', {
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
    if (!supabaseAdmin.client) return;
    // Get initial scan count (removed unused variable to fix lint error)
    await supabaseAdmin.client.from('scan_events').select('id').eq('qr_id', testQrId);

    // Call redirect function
    const { data, error } = await supabase.client.rpc('handle_redirect', {
      p_slug: testSlug,
      p_ip: '192.168.1.100',
      p_user_agent: 'Integration Test Browser 2',
      p_referrer: 'https://google.com',
      p_country: 'CA',
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(1);

    // Check that scan event was logged
    const { data: newScans } = await supabaseAdmin.client
      .from('scan_events')
      .select('*')
      .eq('qr_id', testQrId)
      .order('ts', { ascending: false })
      .limit(1);

    expect(newScans).toHaveLength(1);
    expect(newScans![0].user_agent).toBe('Integration Test Browser 2');
    expect(newScans![0].referrer).toBe('https://google.com');
    expect(newScans![0].country).toBe('CA');
    expect(newScans![0].ip_hash).toBeTruthy(); // Should be hashed
  });

  it('should verify database constraints and relationships work correctly', async () => {
    if (!supabaseAdmin.client) return;

    // Test that the function respects database constraints
    // by verifying it only returns active QR codes
    const { data: allQrCodes } = await supabaseAdmin.client
      .from('qr_codes')
      .select('slug, status')
      .eq('org_id', testOrgId);

    expect(allQrCodes).toBeTruthy();
    expect(allQrCodes!.length).toBeGreaterThan(0);

    // Verify our test QR code is active
    const testQr = allQrCodes!.find((qr) => qr.slug === testSlug);
    expect(testQr).toBeTruthy();
    expect(testQr!.status).toBe('active');

    // Test with non-existent slug (database-level verification)
    const { data, error } = await supabase.client.rpc('handle_redirect', {
      p_slug: 'definitely-does-not-exist-in-database',
      p_ip: '127.0.0.1',
      p_user_agent: 'Integration Test Browser',
      p_referrer: 'https://example.com',
      p_country: 'US',
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it('should test archived QR code filtering at database level', async () => {
    if (!supabaseAdmin.client) return;

    // Create an archived QR code to test database-level filtering
    const archivedSlug = `test-archived-${Date.now()}`;
    const { data: archivedQr, error: qrError } = await supabaseAdmin.client
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
      // Verify the archived QR code exists in database
      const { data: dbQr } = await supabaseAdmin.client
        .from('qr_codes')
        .select('*')
        .eq('slug', archivedSlug)
        .single();

      expect(dbQr).toBeTruthy();
      expect(dbQr!.status).toBe('archived');

      // Test that function respects the WHERE status = 'active' clause
      const { data, error } = await supabase.client.rpc('handle_redirect', {
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
      await supabaseAdmin.client.from('qr_codes').delete().eq('id', archivedQr.id);
    }
  });

  it('should handle IP hashing correctly', async () => {
    if (!supabaseAdmin.client) return;

    const testIp = '203.0.113.42';

    // Call redirect function
    const { data, error } = await supabase.client.rpc('handle_redirect', {
      p_slug: testSlug,
      p_ip: testIp,
      p_user_agent: 'IP Test Browser',
      p_referrer: 'https://example.com',
      p_country: 'US',
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(1);

    // Check that IP was hashed
    const { data: scanEvent } = await supabaseAdmin.client
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
