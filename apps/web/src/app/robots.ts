import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const domain = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'wpprecebo.pt';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/docs', '/terms', '/privacy', '/cookies', '/register', '/login'],
        disallow: ['/admin', '/api'],
      },
    ],
    sitemap: `https://${domain}/sitemap.xml`,
  };
}
