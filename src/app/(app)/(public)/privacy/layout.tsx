import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Butterfast',
  description: 'Read our Privacy Policy to understand how we collect, use, and protect your personal data at Butterfast.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy - Butterfast',
    description: 'Read our Privacy Policy to understand how we collect, use, and protect your personal data.',
    url: '/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
