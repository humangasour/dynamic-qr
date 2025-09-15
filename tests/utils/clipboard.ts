import { vi } from 'vitest';

export function mockNavigatorClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const write = vi.fn().mockResolvedValue(undefined);
  if (!global.navigator) global.navigator = {} as Navigator;
  // @ts-expect-error - partial implementation
  global.navigator.clipboard = { writeText, write };
  return { writeText, write };
}
