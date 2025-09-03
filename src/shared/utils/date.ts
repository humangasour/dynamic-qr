// Date helpers (no timezone libs; keep simple)

/** Format date as ISO string without milliseconds */
export function toISODate(d: Date | number | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return new Date(date.getTime() - date.getMilliseconds()).toISOString();
}

/** Human-ish relative time (seconds/minutes/hours/days) */
export function fromNow(d: Date | number | string, now: Date = new Date()): string {
  const date = d instanceof Date ? d : new Date(d);
  const diffMs = now.getTime() - date.getTime();
  const abs = Math.abs(diffMs);
  const sec = Math.round(abs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  const suffix = diffMs >= 0 ? 'ago' : 'from now';
  if (sec < 60) return `${sec}s ${suffix}`;
  if (min < 60) return `${min}m ${suffix}`;
  if (hr < 24) return `${hr}h ${suffix}`;
  return `${day}d ${suffix}`;
}

/** Safe date parse; returns null if invalid */
export function parseDate(input: string | number | Date): Date | null {
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}
