import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - Butterfast',
  description: 'Learn about Butterfast’s mission to democratize mobile app design using advanced AI technology.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About - Butterfast',
    description: 'Learn about Butterfast’s mission to democratize mobile app design using advanced AI technology.',
    url: '/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
