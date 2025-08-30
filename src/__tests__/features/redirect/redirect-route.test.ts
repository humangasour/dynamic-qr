import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import RedirectPage from '@/app/r/[slug]/page';
import { trpc } from '@/lib/trpc/server-client';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock('@/lib/trpc/server-client', () => ({
  trpc: {
    public: {
      redirect: {
        handle: {
          query: vi.fn(),
        },
      },
    },
  },
}));

describe('Redirect Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Successful Redirects', () => {
    it('should redirect to target URL when valid slug is found', async () => {
      // Mock headers
      const mockHeaders = new Headers();
      mockHeaders.set('user-agent', 'Mozilla/5.0 (Test Browser)');
      mockHeaders.set('referer', 'https://google.com');
      vi.mocked(headers).mockResolvedValue(mockHeaders);

      // Mock successful tRPC response
      vi.mocked(trpc.public.redirect.handle.query).mockResolvedValue({
        success: true,
        targetUrl: 'https://example.com/target',
        slug: 'test-slug',
      });

      const params = Promise.resolve({ slug: 'test-slug' });

      // This should call redirect() and not return a component
      await RedirectPage({ params });

      // In test environment, redirect() doesn't actually redirect, so we check it was called
      expect(redirect).toHaveBeenCalledWith('https://example.com/target');

      // Verify tRPC was called with correct parameters
      expect(trpc.public.redirect.handle.query).toHaveBeenCalledWith({
        slug: 'test-slug',
        ip: undefined,
        userAgent: 'Mozilla/5.0 (Test Browser)',
        referrer: 'https://google.com',
        country: undefined,
      });
    });

    it('should handle missing headers gracefully', async () => {
      // Mock empty headers
      const mockHeaders = new Headers();
      vi.mocked(headers).mockResolvedValue(mockHeaders);

      // Mock successful tRPC response
      vi.mocked(trpc.public.redirect.handle.query).mockResolvedValue({
        success: true,
        targetUrl: 'https://example.com/target',
        slug: 'test-slug',
      });

      const params = Promise.resolve({ slug: 'test-slug' });

      await RedirectPage({ params });

      // In test environment, redirect() doesn't actually redirect, so we check it was called
      expect(redirect).toHaveBeenCalledWith('https://example.com/target');

      // Verify tRPC was called with undefined values for missing headers
      expect(trpc.public.redirect.handle.query).toHaveBeenCalledWith({
        slug: 'test-slug',
        ip: undefined,
        userAgent: undefined,
        referrer: undefined,
        country: undefined,
      });
    });
  });

  describe('Graceful Fallback', () => {
    it('should show fallback page when no target URL is found', async () => {
      // Mock headers
      const mockHeaders = new Headers();
      mockHeaders.set('user-agent', 'Mozilla/5.0 (Test Browser)');
      vi.mocked(headers).mockResolvedValue(mockHeaders);

      // Mock tRPC response with no target URL
      vi.mocked(trpc.public.redirect.handle.query).mockResolvedValue({
        success: true,
        targetUrl: null,
        slug: 'invalid-slug',
      });

      const params = Promise.resolve({ slug: 'invalid-slug' });

      // This should return the fallback component
      const result = await RedirectPage({ params });

      // Verify redirect was not called
      expect(redirect).not.toHaveBeenCalled();

      // Verify we got a React component (fallback page)
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('should show fallback page when tRPC call fails', async () => {
      // Mock headers
      const mockHeaders = new Headers();
      vi.mocked(headers).mockResolvedValue(mockHeaders);

      // Mock tRPC error
      vi.mocked(trpc.public.redirect.handle.query).mockRejectedValue(
        new Error('Database connection failed'),
      );

      const params = Promise.resolve({ slug: 'test-slug' });

      // This should return the fallback component
      const result = await RedirectPage({ params });

      // Verify redirect was not called
      expect(redirect).not.toHaveBeenCalled();

      // Verify we got a React component (fallback page)
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('should show fallback page when success is false', async () => {
      // Mock headers
      const mockHeaders = new Headers();
      vi.mocked(headers).mockResolvedValue(mockHeaders);

      // Mock tRPC response with success: false
      vi.mocked(trpc.public.redirect.handle.query).mockResolvedValue({
        success: false,
        targetUrl: null,
        slug: 'test-slug',
      });

      const params = Promise.resolve({ slug: 'test-slug' });

      // This should return the fallback component
      const result = await RedirectPage({ params });

      // Verify redirect was not called
      expect(redirect).not.toHaveBeenCalled();

      // Verify we got a React component (fallback page)
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });
  });

  describe('Header Extraction', () => {
    it('should extract user-agent and referer headers correctly', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      mockHeaders.set('referer', 'https://facebook.com');
      mockHeaders.set('x-forwarded-for', '192.168.1.1'); // This won't be used in current implementation
      vi.mocked(headers).mockResolvedValue(mockHeaders);

      vi.mocked(trpc.public.redirect.handle.query).mockResolvedValue({
        success: true,
        targetUrl: 'https://example.com/target',
        slug: 'test-slug',
      });

      const params = Promise.resolve({ slug: 'test-slug' });

      await RedirectPage({ params });

      // In test environment, redirect() doesn't actually redirect, so we check it was called
      expect(redirect).toHaveBeenCalledWith('https://example.com/target');

      expect(trpc.public.redirect.handle.query).toHaveBeenCalledWith({
        slug: 'test-slug',
        ip: undefined,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        referrer: 'https://facebook.com',
        country: undefined,
      });
    });

    it('should handle null header values', async () => {
      const mockHeaders = new Headers();
      // Headers with null values will be undefined when retrieved
      vi.mocked(headers).mockResolvedValue(mockHeaders);

      vi.mocked(trpc.public.redirect.handle.query).mockResolvedValue({
        success: true,
        targetUrl: 'https://example.com/target',
        slug: 'test-slug',
      });

      const params = Promise.resolve({ slug: 'test-slug' });

      await RedirectPage({ params });

      // In test environment, redirect() doesn't actually redirect, so we check it was called
      expect(redirect).toHaveBeenCalledWith('https://example.com/target');

      expect(trpc.public.redirect.handle.query).toHaveBeenCalledWith({
        slug: 'test-slug',
        ip: undefined,
        userAgent: undefined,
        referrer: undefined,
        country: undefined,
      });
    });
  });
});
