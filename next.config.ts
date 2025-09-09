import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // App Router: i18n is handled by next-intl (middleware + request config)
};

export default withNextIntl(nextConfig);
