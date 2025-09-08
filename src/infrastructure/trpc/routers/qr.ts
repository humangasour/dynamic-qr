import { TRPCError } from '@trpc/server';

import {
  createQrInputSchema,
  createQrOutputSchema,
  getQrByIdInputSchema,
  getQrByIdOutputSchema,
} from '@shared/schemas/qr';
import { generateSlug } from '@/lib/slug';
import { generateQRSVG, generateQRPNG, QR_PRESETS } from '@/lib/qr-generator';

import { createTRPCRouter, protectedProcedure } from '../trpc';

/**
 * QR router containing QR code-related procedures
 */
export const qrRouter = createTRPCRouter({
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
