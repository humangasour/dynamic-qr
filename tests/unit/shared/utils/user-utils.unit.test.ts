import { describe, it, expect } from 'vitest';

import { getInitials } from '@shared/utils/user';

describe('User Utils - getInitials', () => {
  it('returns two initials for two-word names', () => {
    expect(getInitials('John Doe')).toBe('JD');
    // Uses first two words only
    expect(getInitials('Mary Ann Smith')).toBe('MA');
  });

  it('returns single initial for single-word names', () => {
    expect(getInitials('alice')).toBe('A');
    expect(getInitials('Bob')).toBe('B');
  });

  it('trims and handles extra whitespace', () => {
    expect(getInitials('  bob   marley  ')).toBe('BM');
    expect(getInitials('   single   ')).toBe('S');
  });

  it('falls back to email local-part when name is missing/empty', () => {
    expect(getInitials(undefined, 'foo.bar@example.com')).toBe('F');
    expect(getInitials('', 'z_user+tag@domain.test')).toBe('Z');
    expect(getInitials('   ', 'alice@example.com')).toBe('A');
  });

  it('returns U when both name and email are missing/empty', () => {
    expect(getInitials()).toBe('U');
    expect(getInitials('', '')).toBe('U');
  });
});
