import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Butterfast',
  description: 'Get in touch with the Butterfast team. We are here to help with support inquiries, feedback, and enterprise solutions.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us - Butterfast',
    description: 'Get in touch with the Butterfast team for support, feedback, and questions.',
    url: '/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
