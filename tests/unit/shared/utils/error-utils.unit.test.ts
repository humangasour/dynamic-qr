import { describe, it, expect, vi } from 'vitest';

import * as errorUtils from '@shared/utils/error';

describe('Error Utils - withErrorReporting', () => {
  it('invokes reporting (console.error) on thrown errors and rethrows the original error', async () => {
    const err = new Error('boom');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      errorUtils.withErrorReporting(async () => {
        throw err;
      }),
    ).rejects.toBe(err);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('returns value untouched when no error and does not report', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const value = await errorUtils.withErrorReporting(async () => 42);
    expect(value).toBe(42);
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
