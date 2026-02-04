import { MetadataRoute } from 'next';
import { industryTemplates } from '@/lib/seo-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://butterfast.com';

// Static routes
  const staticRoutes = [
    '',
    '/pricing',
    '/login',
    '/about',
    '/blog',
    '/contact',
    '/privacy',
    '/terms',
    '/industries', // New index page
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic Template Routes
  const templateRoutes = industryTemplates.map((template) => ({
    url: `${baseUrl}/industries/${template.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9, // High priority landing pages
  }));

  return [...staticRoutes, ...templateRoutes];
}
