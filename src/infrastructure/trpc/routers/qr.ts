import { TRPCError } from '@trpc/server';

import {
  createQrInputSchema,
  createQrOutputSchema,
  getQrByIdInputSchema,
  getQrByIdOutputSchema,
  listQrInputSchema,
  listQrOutputSchema,
} from '@shared/schemas/qr';
import { generateSlug } from '@/lib/slug';
import { generateQRSVG, generateQRPNG, QR_PRESETS } from '@/lib/qr-generator';

import { createTRPCRouter, protectedProcedure } from '../trpc';

/**
 * QR router containing QR code-related procedures
 */
export const qrRouter = createTRPCRouter({
  /**
   * List QRs with cursor pagination and totals
   */
  list: protectedProcedure
    .input(listQrInputSchema)
    .output(listQrOutputSchema)
    .query(async ({ input, ctx }) => {
      const { limit, cursor } = input;
      const userId = ctx.user.id;

      // Resolve the user's org_id (single-org assumption for MVP)
      const { data: orgMember, error: orgError } = await ctx.supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', userId)
        .single();

      if (orgError || !orgMember) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User must belong to an organization',
        });
      }

      const orgId = orgMember.org_id;

      // Build base query for qr_codes
      let query = ctx.supabase
        .from('qr_codes')
        .select('id, org_id, name, slug, current_target_url, svg_path, updated_at', {
          count: 'exact',
        })
        .eq('org_id', orgId)
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false });

      // Cursor format: `${updated_at}|${id}`
      if (cursor) {
        const [cUpdatedAt, cId] = cursor.split('|');
        if (cUpdatedAt && cId) {
          // PostgREST composite pagination using OR
          // (updated_at < cUpdatedAt) OR (updated_at = cUpdatedAt AND id < cId)
          query = query.or(
            `updated_at.lt.${cUpdatedAt},and(updated_at.eq.${cUpdatedAt},id.lt.${cId})`,
          );
        }
      }

      // Fetch one extra to determine nextCursor
      const { data: rows, error, count } = await query.limit(limit + 1);
      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch QR list' });
      }

      const totalCount = typeof count === 'number' ? count : 0;
      const hasMore = !!rows && rows.length > limit;
      const pageItems = (rows ?? []).slice(0, limit);

      // Aggregate analytics in batches
      const ids = pageItems.map((r) => r.id);
      let versionCounts = new Map<string, number>();
      let weekScanCounts = new Map<string, number>();

      if (ids.length > 0) {
        // Version counts (count rows grouped by qr_id). Fetch and aggregate client-side for simplicity.
        const { data: versionRows, error: versionErr } = await ctx.supabase
          .from('qr_versions')
          .select('qr_id')
          .in('qr_id', ids);
        if (versionErr) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch versions',
          });
        }
        versionCounts = new Map<string, number>();
        for (const v of versionRows ?? []) {
          versionCounts.set(v.qr_id, (versionCounts.get(v.qr_id) ?? 0) + 1);
        }

        // Week scans from daily_aggregates (last 7 days)
        const start = new Date();
        start.setDate(start.getDate() - 6); // include today + previous 6 days
        const startStr = start.toISOString().slice(0, 10); // YYYY-MM-DD

        const { data: aggRows, error: aggErr } = await ctx.supabase
          .from('daily_aggregates')
          .select('qr_id, day, scans')
          .in('qr_id', ids)
          .gte('day', startStr);
        if (aggErr) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch aggregates',
          });
        }
        weekScanCounts = new Map<string, number>();
        for (const a of aggRows ?? []) {
          weekScanCounts.set(a.qr_id, (weekScanCounts.get(a.qr_id) ?? 0) + (a.scans ?? 0));
        }
      }

      // Map rows to output items with computed svgUrl
      const items = pageItems.map((qr) => {
        const guessedSvg = qr.svg_path == null;
        const guessSvgPath = qr.svg_path ?? `${qr.org_id}/${qr.id}.svg`;
        if (guessedSvg) {
          console.warn('QR asset svg_path missing; using guessed path', {
            id: qr.id,
            orgId: qr.org_id,
          });
        }
        const svgUrl = ctx.supabase.storage.from('qr-codes').getPublicUrl(guessSvgPath)
          .data.publicUrl;

        return {
          id: qr.id,
          name: qr.name,
          slug: qr.slug,
          svgUrl,
          current_target_url: qr.current_target_url,
          versionCount: versionCounts.get(qr.id) ?? 0,
          weekScans: weekScanCounts.get(qr.id) ?? 0,
          updated_at: qr.updated_at,
        };
      });

      const last = hasMore ? rows![limit - 1] : items[items.length - 1];
      const nextCursor = hasMore && last ? `${last.updated_at}|${last.id}` : null;

      return { items, nextCursor, totalCount };
    }),
  /**
   * Get QR code details by ID
   */
  getById: protectedProcedure
    .input(getQrByIdInputSchema)
    .output(getQrByIdOutputSchema)
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const userId = ctx.user.id;

      // Fetch QR code
      const { data: qr, error: qrError } = await ctx.supabase
        .from('qr_codes')
        .select('id, org_id, name, slug, current_target_url, svg_path, png_path, status')
        .eq('id', id)
        .single();

      if (qrError || !qr) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'QR code not found' });
      }

      // Explicit membership check (defense-in-depth beyond RLS)
      const { data: member, error: memberError } = await ctx.supabase
        .from('org_members')
        .select('org_id')
        .eq('org_id', qr.org_id)
        .eq('user_id', userId)
        .single();

      if (memberError || !member) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Access denied' });
      }

      // Compute public asset URLs
      const guessedSvg = qr.svg_path == null;
      const guessedPng = qr.png_path == null;
      const guessSvgPath = qr.svg_path ?? `${qr.org_id}/${qr.id}.svg`;
      const guessPngPath = qr.png_path ?? `${qr.org_id}/${qr.id}.png`;

      if (guessedSvg || guessedPng) {
        console.warn('QR asset paths missing; using guessed paths', {
          id: qr.id,
          orgId: qr.org_id,
          guessedSvg,
          guessedPng,
        });
      }

      const svgUrl = ctx.supabase.storage.from('qr-codes').getPublicUrl(guessSvgPath)
        .data.publicUrl;
      const pngUrl = ctx.supabase.storage.from('qr-codes').getPublicUrl(guessPngPath)
        .data.publicUrl;

      return {
        id: qr.id,
        name: qr.name,
        targetUrl: qr.current_target_url,
        slug: qr.slug,
        svgUrl,
        pngUrl,
      };
    }),
  /**
   * Create a new QR code
   */
  create: protectedProcedure
    .input(createQrInputSchema)
    .output(createQrOutputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { name, targetUrl } = input;
        const userId = ctx.user.id;

        // Get user's organization ID
        const { data: orgMember, error: orgError } = await ctx.supabase
          .from('org_members')
          .select('org_id')
          .eq('user_id', userId)
          .single();

        if (orgError || !orgMember) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User must belong to an organization',
          });
        }

        const orgId = orgMember.org_id;

        const MAX_ATTEMPTS = 3;
        let slug: string | null = null;
        let data: { id: string } | null = null;

        // Retry logic for slug uniqueness
        for (let i = 0; i < MAX_ATTEMPTS; i++) {
          const candidate = generateSlug();

          try {
            const { data: insertData, error } = await ctx.supabase
              .from('qr_codes')
              .insert({
                name,
                current_target_url: targetUrl,
                slug: candidate,
                created_by: userId,
                org_id: orgId,
              })
              .select('id')
              .single();

            if (error) {
              // Check if this is a unique violation error on slug
              const isUniqueViolation =
                error.code === '23505' || /unique.*slug/i.test(String(error.message));

              if (isUniqueViolation && i < MAX_ATTEMPTS - 1) {
                // Retry with a new slug
                continue;
              }

              // If it's not a unique violation or we've exhausted attempts, throw
              console.error('QR creation error:', error);
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create QR code',
              });
            }

            data = insertData;
            slug = candidate;
            break; // Success, exit retry loop
          } catch (e: unknown) {
            // Check if this is a unique violation error on slug
            const isUniqueViolation =
              (e && typeof e === 'object' && 'code' in e && e.code === '23505') ||
              /unique.*slug/i.test(
                String(e && typeof e === 'object' && 'message' in e ? e.message : ''),
              );

            if (isUniqueViolation && i < MAX_ATTEMPTS - 1) {
              // Retry with a new slug
              continue;
            }

            // If it's not a unique violation or we've exhausted attempts, rethrow
            throw e;
          }
        }

        if (!data || !slug) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate unique slug after multiple attempts',
          });
        }

        // Generate QR code redirect URL
        const baseAppUrl =
          process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
        const redirectUrl = `${baseAppUrl}/r/${slug}`;

        // Generate QR code images with presets
        const [svg, png] = await Promise.all([
          generateQRSVG(redirectUrl, QR_PRESETS.svg),
          generateQRPNG(redirectUrl, QR_PRESETS.printPNG),
        ]);

        // Upload QR code images to storage (org-scoped)
        const basePath = `${orgId}/${data.id}`;
        const svgPath = `${basePath}.svg`;
        const pngPath = `${basePath}.png`;

        // Prepare bodies as Blobs
        const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
        // Ensure correct BlobPart type for TypeScript by wrapping Buffer in Uint8Array
        const pngBytes = new Uint8Array(png);
        const pngBlob = new Blob([pngBytes], { type: 'image/png' });

        // Upload with long-term caching and upsert enabled
        const [svgUploadResult, pngUploadResult] = await Promise.all([
          ctx.supabase.storage.from('qr-codes').upload(svgPath, svgBlob, {
            contentType: 'image/svg+xml',
            cacheControl: 'public, max-age=31536000, immutable',
            upsert: true,
          }),
          ctx.supabase.storage.from('qr-codes').upload(pngPath, pngBlob, {
            contentType: 'image/png',
            cacheControl: 'public, max-age=31536000, immutable',
            upsert: true,
          }),
        ]);

        if (svgUploadResult.error || pngUploadResult.error) {
          console.error('QR asset upload error(s):', {
            svgError: svgUploadResult.error,
            pngError: pngUploadResult.error,
          });

          // Compensating action: delete the created QR row to avoid dangling records
          await ctx.supabase.from('qr_codes').delete().eq('id', data.id);

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to upload QR code assets',
          });
        }

        // Persist storage paths
        const { error: updateError } = await ctx.supabase
          .from('qr_codes')
          .update({
            svg_path: svgPath,
            png_path: pngPath,
          })
          .eq('id', data.id);

        if (updateError) {
          console.error('Failed to update QR code with asset paths:', updateError);
          // Not fatal; continue returning computed public URLs
        }

        // Compute public URLs for response using stored paths
        const svgUrl = ctx.supabase.storage.from('qr-codes').getPublicUrl(svgPath).data.publicUrl;
        const pngUrl = ctx.supabase.storage.from('qr-codes').getPublicUrl(pngPath).data.publicUrl;

        return {
          success: true,
          id: data.id,
          name,
          targetUrl,
          slug,
          svgUrl,
          pngUrl,
        };
      } catch (error) {
        console.error('QR creation procedure error:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create QR code',
        });
      }
    }),
});
