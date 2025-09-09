import { describe, it, expect } from 'vitest';

import { cn } from '@/lib/utils';

describe('utils: cn', () => {
  it('handles duplicates and conditionals', () => {
    // Non-Tailwind duplicates are kept (clsx behavior)
    expect(cn('foo', 'foo', 'bar')).toBe('foo foo bar');
    // Tailwind duplicates collapse
    expect(cn('p-2', 'p-2', 'p-2')).toBe('p-2');
    // Conditionals via object
    expect(cn('base', { hidden: true, 'text-red-500': false })).toBe('base hidden');
    // Arrays and falsy values are ignored
    expect(cn(['a', null, undefined, false, 0 && 'b'], 'c')).toBe('a c');
  });

  it('applies Tailwind class merges (keeps the last in a group)', () => {
    // Spacing
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('px-2', 'px-4', 'px-1')).toBe('px-1');
    // Colors
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    // States/variants
    expect(cn('hover:bg-red-500', 'hover:bg-blue-500')).toBe('hover:bg-blue-500');
    // Ring/shadow merge examples
    expect(cn('ring-1', 'ring-2')).toBe('ring-2');
  });
});
