import type { Metadata } from "next";
import { Poppins, Libre_Baskerville } from "next/font/google";
import "../globals.css";
import Providers from "../providers";
import Script from "next/script";
import React, { Suspense } from "react";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const libre = Libre_Baskerville({
  variable: "--font-libre",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Butterfast - AI Mobile App Design Generator",
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
  ],
  authors: [{ name: "Butterfast" }],
  creator: "Butterfast",
  publisher: "Butterfast",
  applicationName: "Butterfast",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Butterfast",
    title: "Butterfast - AI Mobile App Design Generator",
    description:
      "Create stunning mobile app designs effortlessly with Butterfast, an AI-powered UI/UX generator.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Butterfast - AI Mobile App Design Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Butterfast - AI Mobile App Design Generator",
    description:
      "Create stunning mobile app designs effortlessly with Butterfast, an AI-powered UI/UX generator.",
    creator: "@butterfast",
    images: ["/og-image.png"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body className={`${poppins.variable} ${libre.variable} font-sans antialiased h-full`}>
        <Providers>{children}</Providers>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <Suspense fallback={null}>
            <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
          </Suspense>
        )}
      </body>
    </html>
  );
}
