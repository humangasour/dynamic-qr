import { describe, it, expect, vi } from 'vitest';

import {
  ROLE_ORDER,
  report,
  hasRolePermission,
  getHighestRole,
  isAdminRole,
  isOwnerRole,
  type MemberRole,
} from '@/lib/auth/utils';

describe('Auth Utils', () => {
  describe('ROLE_ORDER', () => {
    it('should have correct role hierarchy', () => {
      expect(ROLE_ORDER.viewer).toBe(1);
      expect(ROLE_ORDER.editor).toBe(2);
      expect(ROLE_ORDER.admin).toBe(3);
      expect(ROLE_ORDER.owner).toBe(4);
    });
  });

  describe('report', () => {
    it('should log errors in development', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock the report function to test development behavior
      const originalEnv = process.env.NODE_ENV;
      // @ts-expect-error - Testing environment variable override
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      report(error);

      expect(consoleSpy).toHaveBeenCalledWith(error);

      consoleSpy.mockRestore();
      // @ts-expect-error - Restoring environment variable
      process.env.NODE_ENV = originalEnv;
    });

    it('should log errors in production (without Sentry)', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock the report function to test production behavior
      const originalEnv = process.env.NODE_ENV;
      // @ts-expect-error - Testing environment variable override
      process.env.NODE_ENV = 'production';

      const error = new Error('Test error');
      report(error);

      expect(consoleSpy).toHaveBeenCalledWith('Production error (Sentry not configured):', error);

      consoleSpy.mockRestore();
      // @ts-expect-error - Restoring environment variable
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('hasRolePermission', () => {
    const testCases: Array<{
      userRole: MemberRole;
      requiredRole: MemberRole;
      expected: boolean;
      description: string;
    }> = [
      // Same role
      {
        userRole: 'viewer',
        requiredRole: 'viewer',
        expected: true,
        description: 'viewer can access viewer',
      },
      {
        userRole: 'editor',
        requiredRole: 'editor',
        expected: true,
        description: 'editor can access editor',
      },
      {
        userRole: 'admin',
        requiredRole: 'admin',
        expected: true,
        description: 'admin can access admin',
      },
      {
        userRole: 'owner',
        requiredRole: 'owner',
        expected: true,
        description: 'owner can access owner',
      },

      // Higher role accessing lower role
      {
        userRole: 'editor',
        requiredRole: 'viewer',
        expected: true,
        description: 'editor can access viewer',
      },
      {
        userRole: 'admin',
        requiredRole: 'viewer',
        expected: true,
        description: 'admin can access viewer',
      },
      {
        userRole: 'admin',
        requiredRole: 'editor',
        expected: true,
        description: 'admin can access editor',
      },
      {
        userRole: 'owner',
        requiredRole: 'viewer',
        expected: true,
        description: 'owner can access viewer',
      },
      {
        userRole: 'owner',
        requiredRole: 'editor',
        expected: true,
        description: 'owner can access editor',
      },
      {
        userRole: 'owner',
        requiredRole: 'admin',
        expected: true,
        description: 'owner can access admin',
      },

      // Lower role accessing higher role
      {
        userRole: 'viewer',
        requiredRole: 'editor',
        expected: false,
        description: 'viewer cannot access editor',
      },
      {
        userRole: 'viewer',
        requiredRole: 'admin',
        expected: false,
        description: 'viewer cannot access admin',
      },
      {
        userRole: 'viewer',
        requiredRole: 'owner',
        expected: false,
        description: 'viewer cannot access owner',
      },
      {
        userRole: 'editor',
        requiredRole: 'admin',
        expected: false,
        description: 'editor cannot access admin',
      },
      {
        userRole: 'editor',
        requiredRole: 'owner',
        expected: false,
        description: 'editor cannot access owner',
      },
      {
        userRole: 'admin',
        requiredRole: 'owner',
        expected: false,
        description: 'admin cannot access owner',
      },
    ];

    testCases.forEach(({ userRole, requiredRole, expected, description }) => {
      it(`should return ${expected} for ${description}`, () => {
        expect(hasRolePermission(userRole, requiredRole)).toBe(expected);
      });
    });
  });

  describe('getHighestRole', () => {
    it('should return the highest role from a list', () => {
      expect(getHighestRole(['viewer', 'editor', 'admin'])).toBe('admin');
      expect(getHighestRole(['viewer', 'owner', 'editor'])).toBe('owner');
      expect(getHighestRole(['admin', 'viewer', 'editor'])).toBe('admin');
      expect(getHighestRole(['viewer'])).toBe('viewer');
      expect(getHighestRole(['owner'])).toBe('owner');
    });

    it('should return viewer for empty array', () => {
      expect(getHighestRole([])).toBe('viewer');
    });

    it('should handle duplicate roles', () => {
      expect(getHighestRole(['viewer', 'viewer', 'editor'])).toBe('editor');
      expect(getHighestRole(['admin', 'admin', 'admin'])).toBe('admin');
    });
  });

  describe('isAdminRole', () => {
    it('should return true for admin and owner roles', () => {
      expect(isAdminRole('admin')).toBe(true);
      expect(isAdminRole('owner')).toBe(true);
    });

    it('should return false for viewer and editor roles', () => {
      expect(isAdminRole('viewer')).toBe(false);
      expect(isAdminRole('editor')).toBe(false);
    });
  });

  describe('isOwnerRole', () => {
    it('should return true only for owner role', () => {
      expect(isOwnerRole('owner')).toBe(true);
    });

    it('should return false for all other roles', () => {
      expect(isOwnerRole('viewer')).toBe(false);
      expect(isOwnerRole('editor')).toBe(false);
      expect(isOwnerRole('admin')).toBe(false);
    });
  });
});
