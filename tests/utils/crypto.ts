import { vi } from 'vitest';

// Helper to mock crypto.getRandomValues deterministically
export async function withMockedRandomValues(values: number[], fn: () => void | Promise<void>) {
  const spy = vi.spyOn(globalThis.crypto, 'getRandomValues');
  let i = 0;
  function mockGRV<T extends ArrayBufferView | null>(arr: T): T {
    if (!arr) return arr;
    const u = arr as unknown as Uint32Array | Uint8Array;
    if (u instanceof Uint32Array) {
      u[0] = (values[i++] ?? 0) >>> 0;
    } else if (u instanceof Uint8Array) {
      const v = (values[i++] ?? 0) >>> 0;
      for (let j = 0; j < u.length; j++) u[j] = v & 0xff;
    }
    return arr;
  }
  spy.mockImplementation(mockGRV as unknown as Crypto['getRandomValues']);
  try {
    await fn();
  } finally {
    spy.mockRestore();
  }
}
