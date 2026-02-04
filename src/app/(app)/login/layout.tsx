import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Butterfast',
  description: 'Login to Butterfast to access your AI-generated mobile app designs and projects.',
  alternates: {
    canonical: '/login',
  },
  openGraph: {
    title: 'Login - Butterfast',
    description: 'Login to Butterfast to access your AI-generated mobile app designs.',
    url: '/login',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
