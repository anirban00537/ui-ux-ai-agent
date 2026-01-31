import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Butterfast Export",
  description: "Card export view",
};

/**
 * Minimal layout for export embeds - no navigation, headers, or sidebars
 * This is used by Puppeteer for screenshot capture
 */
export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen h-screen m-0 p-0 overflow-hidden bg-transparent">
      {children}
    </div>
  );
}
