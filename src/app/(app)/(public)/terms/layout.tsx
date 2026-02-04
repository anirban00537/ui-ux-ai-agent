import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Butterfast',
  description: 'Review the Terms of Service for using Butterfast. Understand your rights and responsibilities as a user.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service - Butterfast',
    description: 'Review the Terms of Service for using Butterfast.',
    url: '/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
