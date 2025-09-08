import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('generateSlug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('produces 10-char lowercase/number slug', async () => {
    const { generateSlug } = await import('@/lib/slug');
    const slug = generateSlug();
    expect(slug).toHaveLength(10);
    expect(/^[a-z0-9]+$/.test(slug)).toBe(true);
  });

  it('regenerates when reserved or banned is produced first', async () => {
    // Mock nanoid/non-secure to first return a reserved/banned word then a safe value
    vi.doMock('nanoid/non-secure', () => {
      return {
        customAlphabet: () => {
          let called = 0;
          return () => {
            called += 1;
            if (called === 1) return 'admin'; // reserved word
            return 'abcdefghij'; // safe
          };
        },
      };
    });

    // Clear module cache to ensure fresh import with mock
    vi.resetModules();

    const { generateSlug: mockedGen } = await import('@/lib/slug');
    const slug = mockedGen();
    expect(slug).toBe('abcdefghij');
  });
});
