import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Butterfast - AI Mobile App Design Generator',
    short_name: 'Butterfast',
    description: 'Create stunning mobile app designs effortlessly with Butterfast, an AI-powered UI/UX generator.',
    start_url: '/',
    display: 'standalone',
    background_color: '#02040a',
    theme_color: '#02040a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon.png', // Assuming we will have this, or use og-image if acceptable, but standard is icon.png
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png', // Standard apple icon
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
