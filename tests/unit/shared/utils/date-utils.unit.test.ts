import { describe, it, expect } from 'vitest';

import { toISODate, fromNow, parseDate } from '@shared/utils/date';

describe('Date Utils', () => {
  describe('toISODate', () => {
    it('removes milliseconds (sets them to .000Z) for Date input', () => {
      const d = new Date('2020-01-01T12:34:56.789Z');
      expect(toISODate(d)).toBe('2020-01-01T12:34:56.000Z');
    });

    it('removes milliseconds for string/number inputs', () => {
      expect(toISODate('2020-01-01T12:34:56.123Z')).toBe('2020-01-01T12:34:56.000Z');
      const ts = new Date('2020-01-01T12:34:56.987Z').getTime();
      expect(toISODate(ts)).toBe('2020-01-01T12:34:56.000Z');
    });
  });

  describe('fromNow', () => {
    const now = new Date('2020-01-01T00:00:00.000Z');

    it('formats past times (seconds/minutes/hours)', () => {
      expect(fromNow(new Date(now.getTime() - 30_000), now)).toBe('30s ago');
      expect(fromNow(new Date(now.getTime() - 120_000), now)).toBe('2m ago');
      expect(fromNow(new Date(now.getTime() - 3 * 3_600_000), now)).toBe('3h ago');
    });

    it('formats future times (seconds/hours)', () => {
      expect(fromNow(new Date(now.getTime() + 45_000), now)).toBe('45s from now');
      expect(fromNow(new Date(now.getTime() + 3 * 3_600_000), now)).toBe('3h from now');
    });

    it('formats days for large differences', () => {
      expect(fromNow(new Date(now.getTime() - 3 * 24 * 3_600_000), now)).toBe('3d ago');
      expect(fromNow(new Date(now.getTime() + 2 * 24 * 3_600_000), now)).toBe('2d from now');
    });
  });

  describe('parseDate', () => {
    it('returns Date for valid inputs', () => {
      const d1 = parseDate('2020-01-01T00:00:00Z');
      const d2 = parseDate(new Date('2020-01-01T00:00:00Z').getTime());
      const d3 = parseDate(new Date('2020-01-01T00:00:00Z'));
      expect(d1).toBeInstanceOf(Date);
      expect(d2).toBeInstanceOf(Date);
      expect(d3).toBeInstanceOf(Date);
      expect(d1?.toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });

    it('returns null for invalid input', () => {
      expect(parseDate('not-a-date')).toBeNull();
      // NaN timestamp should be invalid
      expect(parseDate(Number.NaN as unknown as number)).toBeNull();
    });
  });
});
