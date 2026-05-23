import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  async rewrites() {
    // Proxy REST calls through Next.js — eliminates CORS permanently.
    // Browser hits /api/v1/* on the same origin; Next.js forwards server-to-server.
    // Strip /api/v1 suffix if present in API_URL (it's already in source/destination path).
    const internalApi = (process.env['API_URL'] ?? 'http://localhost:3001/api/v1').replace(/\/api\/v1$/, '');
    return [{ source: '/api/v1/:path*', destination: `${internalApi}/api/v1/:path*` }];
  },
  transpilePackages: [
    '@wpp-recebo/ui',
    '@wpp-recebo/shared',
    '@dnd-kit/core',
    '@dnd-kit/sortable',
    '@dnd-kit/utilities',
  ],
};

export default withSentryConfig(nextConfig, {
  org: process.env['SENTRY_ORG'],
  project: process.env['SENTRY_PROJECT'],
  silent: true,
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
  disableLogger: true,
  automaticVercelMonitors: false,
});
