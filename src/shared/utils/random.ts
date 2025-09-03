// Random helpers: IDs, numbers, slugs, test emails

// Use Web Crypto (Node 18+ and browsers provide global crypto)
const cryptoAPI = globalThis.crypto as Crypto;

/** Random integer in [min, max] inclusive */
export function randomInt(min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max))
    throw new Error('min/max must be finite numbers');
  if (Math.floor(min) !== min || Math.floor(max) !== max)
    throw new Error('min/max must be integers');
  if (max < min) throw new Error('max must be >= min');
  const range = max - min + 1;
  const array = new Uint32Array(1);
  cryptoAPI.getRandomValues(array);
  return min + (array[0] % range);
}

/** Random alphanumeric string using base36 */
export function randomString(length = 12): string {
  if (length <= 0) return '';
  const bytes = new Uint8Array(Math.ceil(length * 1.5));
  cryptoAPI.getRandomValues(bytes);
  const base36 = Array.from(bytes, (b) => (b % 36).toString(36)).join('');
  return base36.slice(0, length);
}

/** RFC 4122 v4 UUID (uses crypto.randomUUID when available) */
export function randomUUID(): string {
  const c: Partial<Crypto> & { randomUUID?: () => string } = cryptoAPI as Partial<Crypto> & {
    randomUUID?: () => string;
  };
  if (typeof c.randomUUID === 'function') return c.randomUUID();
  // Fallback if randomUUID is missing
  const bytes = new Uint8Array(16);
  cryptoAPI.getRandomValues(bytes);
  // Set version and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  const parts = [
    Array.from(bytes.subarray(0, 4), toHex).join(''),
    Array.from(bytes.subarray(4, 6), toHex).join(''),
    Array.from(bytes.subarray(6, 8), toHex).join(''),
    Array.from(bytes.subarray(8, 10), toHex).join(''),
    Array.from(bytes.subarray(10, 16), toHex).join(''),
  ];
  return parts.join('-');
}

/**
 * Basic slugify for generator usage (not for full text search/SEO)
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Generate a slug. If no base provided, uses prefix + random string.
 * Ensures lowercase, alphanumeric with dashes.
 */
export function generateSlug(
  options: { base?: string; prefix?: string; randomLength?: number } = {},
): string {
  const { base, prefix, randomLength = 6 } = options;
  const core = base ? slugify(base) : randomString(randomLength);
  return [prefix, core].filter(Boolean).join('-');
}

/**
 * Generate a predictable test email address.
 * - Local part: prefix + random string
 * - Domain: provided or default test domain
 */
export function generateEmail(
  options: { prefix?: string; domain?: string; randomLength?: number } = {},
): string {
  const { prefix = 'user', domain = 'example.test', randomLength = 8 } = options;
  const local = `${slugify(prefix)}-${randomString(randomLength)}`;
  return `${local}@${domain}`;
}
