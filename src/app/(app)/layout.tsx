import type { Metadata } from "next";
import "../globals.css";
import Providers from "../providers";
import Script from "next/script";
import React, { Suspense } from "react";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

export const metadata: Metadata = {
  title: {
    default: "Butterfast - AI-Powered Mobile App Design Generator Tool",
    template: "%s | Butterfast",
  },
  description:
    "Create stunning mobile app designs effortlessly with Butterfast, an AI-powered UI/UX generator. Design, customize, and iterate on professional mobile screens in minutes.",
  keywords: [
    "AI mobile app design",
    "UI generator",
    "mobile app UI builder",
    "AI design tool",
    "UX design generator",
    "mobile prototype builder",
    "AI-powered UI design",
    "mobile app design software",
    "smart layout generator",
    "instant mobile prototyping",
    "brand consistency tool",
    "text to app design",
  ],
  authors: [{ name: "Butterfast" }],
  creator: "Butterfast",
  publisher: "Butterfast",
  applicationName: "Butterfast",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://butterfast.com"
  ),
  alternates: {
    canonical: "https://butterfast.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Butterfast",
    title: "Butterfast - AI-Powered Mobile App Design Generator Tool",
    description:
      "Create stunning mobile app designs effortlessly with Butterfast, an AI-powered UI/UX generator. Turn ideas into professional screens in seconds.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://butterfast.com"}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Butterfast - AI-Powered Mobile App Design Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Butterfast - AI-Powered Mobile App Design Generator Tool",
    description:
      "Create stunning mobile app designs effortlessly with Butterfast, an AI-powered UI/UX generator. Turn ideas into professional screens in seconds.",
    creator: "@butterfast",
    images: [`${process.env.NEXT_PUBLIC_APP_URL || "https://butterfast.com"}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://butterfast.com/#organization",
      "name": "Butterfast",
      "url": "https://butterfast.com",
      "logo": "https://butterfast.com/icon.png",
      "sameAs": [
        "https://twitter.com/butterfast",
        "https://linkedin.com/company/butterfast"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "hello@butterfast.com",
        "contactType": "customer support"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://butterfast.com/#software",
      "name": "Butterfast",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Web",
      "author": {
        "@id": "https://butterfast.com/#organization"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/OnlineOnly"
      },
      "description": "AI-powered mobile app design generator that turns text into professional UI/UX designs instantly.",
      "featureList": "AI Layout Generation, Instant Prototyping, Brand Consistency, Text to Design, Design System Export",
      "screenshot": "https://butterfast.com/og-image.png"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="font-sans antialiased h-full bg-[#1f2228]">
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          {children}
        </Providers>
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <Suspense fallback={null}>
            <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
          </Suspense>
        )}
      </body>
    </html>
  );
}
