import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kuraflow.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/profile/', '/level/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
