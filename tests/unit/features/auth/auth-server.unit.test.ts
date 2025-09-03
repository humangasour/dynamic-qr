import { describe, it, expect } from 'vitest';

import { createTestUserFromFixtures as createTestUser } from '@test/utils';
import { hasRolePermission, getHighestRole, isAdminRole, isOwnerRole } from '@/lib/auth/utils';

// Unit tests for auth server functions that don't require Next.js context
describe('Auth Server Unit Tests', () => {
  describe('Role-based utilities', () => {
    it('should work with test user data', () => {
      const testUser = createTestUser({ name: 'Test User' });

      // Test that our utility functions work with fixture data
      expect(hasRolePermission('admin', 'editor')).toBe(true);
      expect(hasRolePermission('viewer', 'admin')).toBe(false);
      expect(getHighestRole(['viewer', 'admin', 'editor'])).toBe('admin');
      expect(isAdminRole('admin')).toBe(true);
      expect(isOwnerRole('owner')).toBe(true);

      // Test that we can create test users with fixtures
      expect(testUser.name).toBe('Test User');
      expect(testUser.email).toBeDefined();
      expect(testUser.id).toBeDefined();
    });

    it('should handle role permission edge cases', () => {
      // Test all role combinations
      const roles = ['viewer', 'editor', 'admin', 'owner'] as const;

      roles.forEach((userRole) => {
        roles.forEach((requiredRole) => {
          const expected = hasRolePermission(userRole, requiredRole);
          const userIndex = roles.indexOf(userRole);
          const requiredIndex = roles.indexOf(requiredRole);

          expect(expected).toBe(userIndex >= requiredIndex);
        });
      });
    });

    it('should handle empty role arrays', () => {
      expect(getHighestRole([])).toBe('viewer');
    });

    it('should identify admin roles correctly', () => {
      expect(isAdminRole('admin')).toBe(true);
      expect(isAdminRole('owner')).toBe(true);
      expect(isAdminRole('editor')).toBe(false);
      expect(isAdminRole('viewer')).toBe(false);
    });

    it('should identify owner role correctly', () => {
      expect(isOwnerRole('owner')).toBe(true);
      expect(isOwnerRole('admin')).toBe(false);
      expect(isOwnerRole('editor')).toBe(false);
      expect(isOwnerRole('viewer')).toBe(false);
    });
  });

  describe('Test data validation', () => {
    it('should create test users with proper structure', () => {
      const testUser = createTestUser({ name: 'Custom Name' });

      expect(testUser).toHaveProperty('id');
      expect(testUser).toHaveProperty('email');
      expect(testUser).toHaveProperty('name');
      expect(testUser).toHaveProperty('avatar_url');
      expect(testUser).toHaveProperty('created_at');
      expect(testUser).toHaveProperty('updated_at');

      expect(testUser.name).toBe('Custom Name');
      expect(typeof testUser.id).toBe('string');
      expect(typeof testUser.email).toBe('string');
    });

    it('should override test user properties correctly', () => {
      const customUser = createTestUser({
        name: 'Override Name',
        email: 'override@example.com',
      });

      expect(customUser.name).toBe('Override Name');
      expect(customUser.email).toBe('override@example.com');
    });
  });
});
