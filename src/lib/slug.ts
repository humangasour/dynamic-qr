import { customAlphabet } from 'nanoid/non-secure';

// Lowercase-only alphabet (omit lookalikes like l/0)
const ALPHABET = 'abcdefghijkmnopqrstuvwxyz123456789';
const LENGTH = 10;

const RESERVED = new Set([
  'admin',
  'api',
  'help',
  'docs',
  'login',
  'logout',
  'signup',
  'terms',
  'privacy',
  'about',
  'contact',
  'r',
  'qr',
  '_next',
  'static',
]);

/**
 * Generate a unique slug for QR codes
 * Uses base58-style alphabet to avoid look-alike characters
 * Includes safety checks for reserved words and profanity
 */
export function generateSlug(): string {
  const nano = customAlphabet(ALPHABET, LENGTH);
  let slug = nano();

  // Avoid accidental bad words (very light pass).
  // TODO: Expand list if needed.
  const banned = ['ass', 'fuck', 'sex'];
  const lower = slug.toLowerCase();

  if (RESERVED.has(slug) || banned.some((b) => lower.includes(b))) {
    // regenerate once; extremely rare
    slug = nano();
  }

  return slug;
}
