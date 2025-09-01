export interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
  organizationId: string;
}

export const testUsers = {
  admin: {
    id: 'admin-user-id',
    email: 'admin@example.com',
    password: 'admin-password-123',
    name: 'Admin User',
    organizationId: 'admin-org-id',
  },
  regular: {
    id: 'regular-user-id',
    email: 'user@example.com',
    password: 'user-password-123',
    name: 'Regular User',
    organizationId: 'regular-org-id',
  },
  readonly: {
    id: 'readonly-user-id',
    email: 'readonly@example.com',
    password: 'readonly-password-123',
    name: 'Readonly User',
    organizationId: 'readonly-org-id',
  },
} as const;

export type TestUserRole = keyof typeof testUsers;
