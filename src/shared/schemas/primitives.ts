import { z } from 'zod';

// Common reusable primitives
export const UUID = z.uuid();
export const ISODateTime = z.iso.datetime({ offset: true }); // Supabase timestamptz → ISO8601 with timezone
export const Email = z.email().trim().toLowerCase();
