import { describe, expect, it, vi } from 'vitest';

import { GET } from '../test-env/route';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  },
}));

describe('API Route: /api/test-env', () => {
  it('should return environment variables status', async () => {
    const response = await GET();

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('message', 'Environment variables check');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('environment');
    expect(data).toHaveProperty('variables');

    // Check that environment variables are detected as "Set"
    expect(data.variables.supabaseUrl).toBe('Set');
    expect(data.variables.supabaseAnonKey).toBe('Set');
    expect(data.variables.serviceRoleKey).toBe('Set');
    expect(data.variables.hasServiceRoleKey).toBe(true);
  });

  it('should handle missing environment variables', async () => {
    // Mock missing env vars
    const originalEnv = process.env;
    process.env = { NODE_ENV: 'test' };

    try {
      const response = await GET();

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.variables.supabaseUrl).toBe('Missing');
      expect(data.variables.supabaseAnonKey).toBe('Missing');
      expect(data.variables.serviceRoleKey).toBe('Missing');
      expect(data.variables.hasServiceRoleKey).toBe(false);
    } finally {
      // Restore original environment
      process.env = originalEnv;
    }
  });
});
