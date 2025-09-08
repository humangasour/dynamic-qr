// User-related utilities shared across client and server

/**
 * Derive initials from a display name or email.
 * - Uses up to two initials from the name (first chars of up to two words)
 * - Falls back to the first character of the email local-part
 * - Returns 'U' if nothing usable is provided
 */
export function getInitials(name?: string | null, email?: string | null): string {
  const trimmedName = (name ?? '').trim();
  if (trimmedName.length > 0) {
    const parts = trimmedName.split(/\s+/).filter(Boolean).slice(0, 2);
    const letters = parts.map((p) => p[0]!).join('');
    if (letters) return letters.toUpperCase();
  }

  const localPart = (email ?? '').split('@')[0] ?? '';
  if (localPart) return localPart[0]!.toUpperCase();

  return 'U';
}
