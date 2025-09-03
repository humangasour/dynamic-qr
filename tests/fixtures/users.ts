import type { Database } from '@shared/types';

type User = Database['public']['Tables']['users']['Row'];

export const testUsers: User[] = [
  {
    id: 'user-001',
    email: 'test1@example.com',
    name: 'Test User 1',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-002',
    email: 'test2@example.com',
    name: 'Test User 2',
    avatar_url: 'https://example.com/avatar2.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-003',
    email: 'admin@example.com',
    name: 'Admin User',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export const getUserById = (id: string): User | undefined => {
  return testUsers.find((user) => user.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return testUsers.find((user) => user.email === email);
};
