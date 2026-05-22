import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@wpp-recebo/ui',
    '@wpp-recebo/shared',
    '@dnd-kit/core',
    '@dnd-kit/sortable',
    '@dnd-kit/utilities',
  ],
};

export default nextConfig;
