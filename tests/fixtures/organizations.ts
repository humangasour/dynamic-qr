import type { Database } from '@shared/types';

type Organization = Database['public']['Tables']['orgs']['Row'];

export const testOrganizations: Organization[] = [
  {
    id: 'org-001',
    name: 'Test Organization 1',
    plan: 'free',
    stripe_customer_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'org-002',
    name: 'Test Organization 2',
    plan: 'pro',
    stripe_customer_id: 'cus_test123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export const getOrganizationById = (id: string): Organization | undefined => {
  return testOrganizations.find((org) => org.id === id);
};

export const getOrganizationsByPlan = (plan: 'free' | 'pro'): Organization[] => {
  return testOrganizations.filter((org) => org.plan === plan);
};
