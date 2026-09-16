import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Butterfast',
  description: 'Simple, transparent pricing for AI-powered mobile app design. Choose the plan that fits your needs.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing - Butterfast',
    description: 'Simple, transparent pricing for AI-powered mobile app design.',
    url: '/pricing',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
