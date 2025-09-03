// String helpers

/** Capitalize first character */
export function capitalize(s: string): string {
  if (!s) return s;
  return s[0]!.toUpperCase() + s.slice(1);
}

/** Convert to Title Case (basic, ASCII) */
export function toTitleCase(s: string): string {
  return s.toLowerCase().split(/\s+/).filter(Boolean).map(capitalize).join(' ');
}

/** Trim and collapse internal whitespace to single spaces */
export function normalizeWhitespace(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

/** Truncate string to max length with ellipsis */
export function truncate(s: string, maxLength: number, ellipsis = '…'): string {
  if (s.length <= maxLength) return s;
  if (maxLength <= ellipsis.length) return ellipsis.slice(0, maxLength);
  return s.slice(0, maxLength - ellipsis.length) + ellipsis;
}
