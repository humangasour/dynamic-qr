import { describe, it, expect, vi, afterEach } from 'vitest';

import {
  randomInt,
  randomString,
  slugify,
  generateSlug,
  randomUUID,
  generateEmail,
} from '@shared/utils/random';
import { withMockedRandomValues } from '@test/utils';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Random Utils', () => {
  describe('randomInt', () => {
    it('validates inputs: finite integers and max >= min', () => {
      expect(() => randomInt(1.5, 3)).toThrow(/integers/);
      expect(() => randomInt(1, Number.POSITIVE_INFINITY)).toThrow(/finite/);
      expect(() => randomInt(5, 4)).toThrow(/>=/);
    });

    it('returns values within inclusive range and can hit bounds', () => {
      const min = 10;
      const max = 15;
      const range = max - min + 1; // 6

      // Force modulo to 0 -> should return min
      withMockedRandomValues([0], () => {
        expect(randomInt(min, max)).toBe(min);
      });

      // Force modulo to range-1 -> should return max
      withMockedRandomValues([123456 + (range - 1)], () => {
        expect(randomInt(min, max)).toBe(max);
      });

      // Several random values map inside [min, max]
      withMockedRandomValues([1, 2, 3, 1000, 2 ** 31], () => {
        for (let k = 0; k < 5; k++) {
          const n = randomInt(min, max);
          expect(n).toBeGreaterThanOrEqual(min);
          expect(n).toBeLessThanOrEqual(max);
        }
      });
    });
  });

  describe('randomString', () => {
    it('returns the requested length (including zero)', () => {
      expect(randomString(0)).toBe('');
      expect(randomString(1)).toHaveLength(1);
      expect(randomString(12)).toHaveLength(12);
      expect(randomString(50)).toHaveLength(50);
    });

    it('uses only lowercase base36 characters', () => {
      const s = randomString(64);
      expect(/^[a-z0-9]+$/.test(s)).toBe(true);
      expect(s).toBe(s.toLowerCase());
    });
  });

  describe('slugify', () => {
    it('normalizes to lowercase, removes diacritics and punctuation, collapses spaces/dashes', () => {
      expect(slugify(' Hello, World! ')).toBe('hello-world');
      expect(slugify('Café Déjà Vu')).toBe('cafe-deja-vu');
      expect(slugify('foo---bar   baz')).toBe('foo-bar-baz');
      // Non-ASCII dash is removed (not treated as hyphen)
      expect(slugify('Hello—World')).toBe('helloworld');
    });
  });

  describe('generateSlug', () => {
    it('returns slugified base when provided', () => {
      expect(generateSlug({ base: ' My Title!! ' })).toBe('my-title');
      expect(generateSlug({ base: 'Café – Déjà Vu' })).toBe('cafe-deja-vu');
    });

    it('prefixes slug when prefix is provided', () => {
      const res = generateSlug({ base: 'Hello World', prefix: 'qr' });
      expect(res).toBe('qr-hello-world');
    });

    it('uses random core when no base; respects randomLength and charset', () => {
      // Mock to make the random core deterministic in length and charset
      const randomLen = 8;
      withMockedRandomValues([7], () => {
        const res = generateSlug({ prefix: 'p', randomLength: randomLen });
        const [prefix, core] = res.split('-');
        expect(prefix).toBe('p');
        expect(core).toHaveLength(randomLen);
        expect(/^[a-z0-9]+$/.test(core)).toBe(true);
      });
    });
  });

  describe('randomUUID', () => {
    it('uses fallback when crypto.randomUUID is unavailable and returns v4 UUID', () => {
      const original = (globalThis.crypto as unknown as { randomUUID?: () => string }).randomUUID;
      try {
        (globalThis.crypto as unknown as { randomUUID?: (() => string) | undefined }).randomUUID =
          undefined;
        const id = randomUUID();
        // v4 UUID pattern with correct version and variant bits
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      } finally {
        (globalThis.crypto as unknown as { randomUUID?: (() => string) | undefined }).randomUUID =
          original;
      }
    });

    it('delegates to crypto.randomUUID when available', () => {
      const spy = vi
        .spyOn(globalThis.crypto as unknown as { randomUUID: () => string }, 'randomUUID')
        .mockReturnValue('deadbeef-dead-4bad-8bad-deadbeefdead');
      const id = randomUUID();
      expect(id).toBe('deadbeef-dead-4bad-8bad-deadbeefdead');
      spy.mockRestore();
    });
  });

  describe('generateEmail', () => {
    it('generates email with default domain and slugified prefix', () => {
      const email = generateEmail({ prefix: 'My User' });
      expect(email).toMatch(/^my-user-[a-z0-9]+@example\.test$/);
    });

    it('respects custom domain and randomLength', () => {
      withMockedRandomValues([15], () => {
        const email = generateEmail({ prefix: 'Q R', domain: 'test.dev', randomLength: 5 });
        const [local, domain] = email.split('@');
        expect(domain).toBe('test.dev');
        const parts = local.split('-');
        // First part(s) are slugified prefix (can contain dashes)
        expect(parts.slice(0, parts.length - 1).join('-')).toBe('q-r');
        const rand = parts[parts.length - 1]!;
        expect(rand).toHaveLength(5);
        expect(/^[a-z0-9]+$/.test(rand)).toBe(true);
      });
    });
  });
});
