export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="w-full overflow-x-hidden antialiased">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />

        {/* Fonts: Nunito Sans, JetBrains Mono, Playfair Display (Competitor Stack) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* Tailwind v4 - Play CDN / browser build */}
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4" defer />
        {/* Remix Icon (Keep as fallback) */}
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />
        {/* Compititor Script: Iconify */}
        <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>

        {/* v4 @theme inline: map runtime CSS vars (set by UPDATE_THEME) to Tailwind utilities; :root defaults from competitor */}
        <style type="text/tailwindcss">{`
          @theme inline {
            --color-background: var(--background);
            --color-foreground: var(--foreground);
            --color-primary: var(--primary);
            --color-primary-foreground: var(--primary-foreground);
            --color-secondary: var(--secondary);
            --color-secondary-foreground: var(--secondary-foreground);
            --color-muted: var(--muted);
            --color-muted-foreground: var(--muted-foreground);
            --color-accent: var(--accent);
            --color-accent-foreground: var(--accent-foreground);
            --color-destructive: var(--destructive);
            --color-card: var(--card);
            --color-card-foreground: var(--card-foreground);
            --color-popover: var(--popover);
            --color-popover-foreground: var(--popover-foreground);
            --color-border: var(--border);
            --color-input: var(--input);
            --color-ring: var(--ring);
            --color-chart-1: var(--chart-1);
            --color-chart-2: var(--chart-2);
            --color-chart-3: var(--chart-3);
            --color-chart-4: var(--chart-4);
            --color-chart-5: var(--chart-5);
            --font-font-sans: var(--font-sans);
            --font-font-heading: var(--font-heading);
            --font-font-serif: var(--font-serif);
            --font-font-mono: var(--font-mono);
            --radius-sm: calc(var(--radius) - 4px);
            --radius-md: calc(var(--radius) - 2px);
            --radius-lg: var(--radius);
            --radius-xl: calc(var(--radius) + 4px);
          }

          :root {
            --background: #ffffff;
            --foreground: #000000;
            --primary: #3b82f6;
            --primary-foreground: #ffffff;
            --secondary: #f3f4f6;
            --secondary-foreground: #1f2937;
            --muted: #f9fafb;
            --muted-foreground: #6b7280;
            --accent: #eff6ff;
            --accent-foreground: #1d4ed8;
            --destructive: #ef4444;
            --card: #ffffff;
            --card-foreground: #000000;
            --popover: #ffffff;
            --popover-foreground: #000000;
            --border: #e5e7eb;
            --input: #e5e7eb;
            --ring: #3b82f6;
            --chart-1: #3b82f6;
            --chart-2: #10b981;
            --chart-3: #f59e0b;
            --chart-4: #ef4444;
            --chart-5: #8b5cf6;
            --font-sans: "Nunito Sans", sans-serif;
            --font-heading: "Nunito Sans", sans-serif;
            --font-serif: "Playfair Display", serif;
            --font-mono: "JetBrains Mono", monospace;
            --radius: 1rem;
          }
        `}</style>

        <style>{`
          /* Single theme only: whatever palette is sent via UPDATE_THEME is shown. */
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: var(--background);
            font-family: var(--font-sans), "Space Grotesk", sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          #root, .canvas-content-wrapper {
            background-color: var(--background);
            display: flex;
            flex-direction: column;
            width: 100%;
            min-height: 100%;
          }

          #canvas-wrapper > *:first-child {
            min-height: 100% !important;
            flex: 1;
          }

          /* Theme utilities - must exist for dynamically injected content */
          .bg-background { background-color: var(--background) !important; }
          .bg-foreground { background-color: var(--foreground) !important; }
          .bg-primary { background-color: var(--primary) !important; }
          .bg-primary-foreground { background-color: var(--primary-foreground) !important; }
          .bg-secondary { background-color: var(--secondary) !important; }
          .bg-secondary-foreground { background-color: var(--secondary-foreground) !important; }
          .bg-muted { background-color: var(--muted) !important; }
          .bg-muted-foreground { background-color: var(--muted-foreground) !important; }
          .bg-accent { background-color: var(--accent) !important; }
          .bg-accent-foreground { background-color: var(--accent-foreground) !important; }
          .bg-destructive { background-color: var(--destructive) !important; }
          .bg-card { background-color: var(--card) !important; }
          .bg-card-foreground { background-color: var(--card-foreground) !important; }
          .bg-popover { background-color: var(--popover) !important; }
          .bg-popover-foreground { background-color: var(--popover-foreground) !important; }
          .bg-border { background-color: var(--border) !important; }
          .bg-input { background-color: var(--input) !important; }
          .bg-ring { background-color: var(--ring) !important; }
          .bg-chart-1 { background-color: var(--chart-1) !important; }
          .bg-chart-2 { background-color: var(--chart-2) !important; }
          .bg-chart-3 { background-color: var(--chart-3) !important; }
          .bg-chart-4 { background-color: var(--chart-4) !important; }
          .bg-chart-5 { background-color: var(--chart-5) !important; }
          .text-foreground { color: var(--foreground) !important; }
          .text-primary { color: var(--primary) !important; }
          .text-primary-foreground { color: var(--primary-foreground) !important; }
          .text-secondary { color: var(--secondary) !important; }
          .text-secondary-foreground { color: var(--secondary-foreground) !important; }
          .text-muted { color: var(--muted) !important; }
          .text-muted-foreground { color: var(--muted-foreground) !important; }
          .text-accent { color: var(--accent) !important; }
          .text-accent-foreground { color: var(--accent-foreground) !important; }
          .text-destructive { color: var(--destructive) !important; }
          .text-card { color: var(--card) !important; }
          .text-card-foreground { color: var(--card-foreground) !important; }
          .text-popover { color: var(--popover) !important; }
          .text-popover-foreground { color: var(--popover-foreground) !important; }
          .text-border { color: var(--border) !important; }
          .text-input { color: var(--input) !important; }
          .text-ring { color: var(--ring) !important; }
          .text-chart-1 { color: var(--chart-1) !important; }
          .text-chart-2 { color: var(--chart-2) !important; }
          .text-chart-3 { color: var(--chart-3) !important; }
          .text-chart-4 { color: var(--chart-4) !important; }
          .text-chart-5 { color: var(--chart-5) !important; }
          .border-border { border-color: var(--border) !important; }
          .border-input { border-color: var(--input) !important; }
          .border-ring { border-color: var(--ring) !important; }

        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
