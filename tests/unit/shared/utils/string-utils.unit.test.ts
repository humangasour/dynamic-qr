import { describe, it, expect } from 'vitest';

import { capitalize, toTitleCase, normalizeWhitespace, truncate } from '@shared/utils/string';

describe('String Utils', () => {
  describe('capitalize', () => {
    it('capitalizes the first character', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('h')).toBe('H');
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('returns empty string unchanged', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('toTitleCase', () => {
    it('converts words to Title Case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
    });

    it('handles extra/multiple whitespace and trims ends', () => {
      expect(toTitleCase('  hello   WORLD  ')).toBe('Hello World');
      expect(toTitleCase('hello\tworld\nfoo')).toBe('Hello World Foo');
      expect(toTitleCase('')).toBe('');
    });
  });

  describe('normalizeWhitespace', () => {
    it('trims and collapses internal whitespace to single spaces', () => {
      expect(normalizeWhitespace('  a   b   ')).toBe('a b');
      expect(normalizeWhitespace('a\tb\nc')).toBe('a b c');
      expect(normalizeWhitespace('')).toBe('');
    });
  });

  describe('truncate', () => {
    it('returns original string when within max length', () => {
      expect(truncate('abcdef', 6)).toBe('abcdef');
      expect(truncate('', 10)).toBe('');
    });

    it('truncates and appends default ellipsis when needed', () => {
      // Default ellipsis is a single-character …
      expect(truncate('abcdef', 5)).toBe('abcd…');
      expect(truncate('abc', 1)).toBe('…');
    });

    it('supports custom ellipsis and respects max length', () => {
      expect(truncate('abcdef', 5, '...')).toBe('ab...');
      // When maxLength is shorter than ellipsis length, slice ellipsis
      expect(truncate('abcdef', 2, '...')).toBe('..');
      expect(truncate('abcdef', 0, '...')).toBe('');
      // Exactly equal to ellipsis length
      expect(truncate('longstring', 3, '...')).toBe('...');
    });
  });
});
