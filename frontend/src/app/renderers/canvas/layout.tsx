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
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round|Material+Icons+Sharp"
          rel="stylesheet"
        />


        {/* Tailwind v4 - Play CDN / browser build 
            No defer! Must load synchronously so MutationObserver is active before content injection */}
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4" />
        {/* Remix Icon (Keep as fallback) */}
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css"
          rel="stylesheet"
        />
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

          /* Core Layout Utilities - Essential fallbacks for dynamic content */
          /* Flexbox */
          .flex { display: flex !important; }
          .flex-col { flex-direction: column !important; }
          .flex-row { flex-direction: row !important; }
          .flex-1 { flex: 1 1 0% !important; }
          .flex-shrink-0 { flex-shrink: 0 !important; }
          .items-center { align-items: center !important; }
          .items-start { align-items: flex-start !important; }
          .items-end { align-items: flex-end !important; }
          .justify-center { justify-content: center !important; }
          .justify-between { justify-content: space-between !important; }
          .justify-around { justify-content: space-around !important; }
          .justify-start { justify-content: flex-start !important; }
          .justify-end { justify-content: flex-end !important; }
          .gap-1 { gap: 0.25rem !important; }
          .gap-2 { gap: 0.5rem !important; }
          .gap-3 { gap: 0.75rem !important; }
          .gap-4 { gap: 1rem !important; }
          .gap-5 { gap: 1.25rem !important; }
          .gap-6 { gap: 1.5rem !important; }
          .gap-8 { gap: 2rem !important; }
          .flex-wrap { flex-wrap: wrap !important; }

          /* Grid */
          .grid { display: grid !important; }
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }

          /* Sizing */
          .w-full { width: 100% !important; }
          .h-full { height: 100% !important; }
          .min-h-full { min-height: 100% !important; }
          .min-h-screen { min-height: 100vh !important; }
          .max-w-full { max-width: 100% !important; }
          .max-w-sm { max-width: 24rem !important; }
          .max-w-md { max-width: 28rem !important; }
          .size-full { width: 100% !important; height: 100% !important; }
          .w-1 { width: 0.25rem !important; }
          .w-2 { width: 0.5rem !important; }
          .w-3 { width: 0.75rem !important; }
          .w-4 { width: 1rem !important; }
          .w-5 { width: 1.25rem !important; }
          .w-6 { width: 1.5rem !important; }
          .w-8 { width: 2rem !important; }
          .w-10 { width: 2.5rem !important; }
          .w-12 { width: 3rem !important; }
          .w-14 { width: 3.5rem !important; }
          .w-16 { width: 4rem !important; }
          .w-20 { width: 5rem !important; }
          .w-24 { width: 6rem !important; }
          .w-28 { width: 7rem !important; }
          .w-32 { width: 8rem !important; }
          .w-40 { width: 10rem !important; }
          .w-48 { width: 12rem !important; }
          .w-64 { width: 16rem !important; }
          .w-80 { width: 20rem !important; }
          .h-1 { height: 0.25rem !important; }
          .h-2 { height: 0.5rem !important; }
          .h-3 { height: 0.75rem !important; }
          .h-4 { height: 1rem !important; }
          .h-5 { height: 1.25rem !important; }
          .h-6 { height: 1.5rem !important; }
          .h-8 { height: 2rem !important; }
          .h-10 { height: 2.5rem !important; }
          .h-12 { height: 3rem !important; }
          .h-14 { height: 3.5rem !important; }
          .h-16 { height: 4rem !important; }
          .h-20 { height: 5rem !important; }
          .h-24 { height: 6rem !important; }
          .h-28 { height: 7rem !important; }
          .h-32 { height: 8rem !important; }
          .h-40 { height: 10rem !important; }
          .h-48 { height: 12rem !important; }
          .h-64 { height: 16rem !important; }
          .h-80 { height: 20rem !important; }
          .min-h-\\[420px\\] { min-height: 420px !important; }

          /* Position */
          .relative { position: relative !important; }
          .absolute { position: absolute !important; }
          .fixed { position: fixed !important; }
          .sticky { position: sticky !important; }
          .inset-0 { inset: 0 !important; }
          .top-0 { top: 0 !important; }
          .bottom-0 { bottom: 0 !important; }
          .left-0 { left: 0 !important; }
          .right-0 { right: 0 !important; }
          .z-0 { z-index: 0 !important; }
          .z-10 { z-index: 10 !important; }
          .z-20 { z-index: 20 !important; }
          .z-30 { z-index: 30 !important; }
          .z-40 { z-index: 40 !important; }
          .z-50 { z-index: 50 !important; }

          /* Overflow */
          .overflow-hidden { overflow: hidden !important; }
          .overflow-auto { overflow: auto !important; }
          .overflow-visible { overflow: visible !important; }
          .overflow-y-auto { overflow-y: auto !important; }
          .overflow-x-auto { overflow-x: auto !important; }
          .overflow-x-hidden { overflow-x: hidden !important; }

          /* Common Spacing */
          .p-0 { padding: 0 !important; }
          .p-1 { padding: 0.25rem !important; }
          .p-2 { padding: 0.5rem !important; }
          .p-3 { padding: 0.75rem !important; }
          .p-4 { padding: 1rem !important; }
          .p-5 { padding: 1.25rem !important; }
          .p-6 { padding: 1.5rem !important; }
          .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
          .px-5 { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
          .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
          .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
          .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
          .py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
          .pt-12 { padding-top: 3rem !important; }
          .pt-14 { padding-top: 3.5rem !important; }
          .pb-4 { padding-bottom: 1rem !important; }
          .pb-6 { padding-bottom: 1.5rem !important; }
          .pb-28 { padding-bottom: 7rem !important; }
          .pb-32 { padding-bottom: 8rem !important; }
          .m-0 { margin: 0 !important; }
          .mt-1 { margin-top: 0.25rem !important; }
          .mt-2 { margin-top: 0.5rem !important; }
          .mt-3 { margin-top: 0.75rem !important; }
          .mt-4 { margin-top: 1rem !important; }
          .mt-6 { margin-top: 1.5rem !important; }
          .mb-3 { margin-bottom: 0.75rem !important; }
          .mb-4 { margin-bottom: 1rem !important; }
          .mb-6 { margin-bottom: 1.5rem !important; }
          .space-y-4 > * + * { margin-top: 1rem !important; }
          .space-y-2 > * + * { margin-top: 0.5rem !important; }

          /* Border Radius */
          .rounded { border-radius: 0.25rem !important; }
          .rounded-md { border-radius: 0.375rem !important; }
          .rounded-lg { border-radius: 0.5rem !important; }
          .rounded-xl { border-radius: 0.75rem !important; }
          .rounded-2xl { border-radius: 1rem !important; }
          .rounded-3xl { border-radius: 1.5rem !important; }
          .rounded-full { border-radius: 9999px !important; }

          /* Other common utilities */
          .hidden { display: none !important; }
          .block { display: block !important; }
          .inline-block { display: inline-block !important; }
          .inline-flex { display: inline-flex !important; }
          .pointer-events-none { pointer-events: none !important; }
          .pointer-events-auto { pointer-events: auto !important; }
          .opacity-0 { opacity: 0 !important; }
          .opacity-40 { opacity: 0.4 !important; }
          .opacity-50 { opacity: 0.5 !important; }
          .opacity-75 { opacity: 0.75 !important; }
          .opacity-90 { opacity: 0.9 !important; }
          .opacity-100 { opacity: 1 !important; }
          .isolate { isolation: isolate !important; }
          .shrink-0 { flex-shrink: 0 !important; }
          .truncate { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
          .antialiased { -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; }

          /* Text utilities */
          .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
          .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
          .text-base { font-size: 1rem !important; line-height: 1.5rem !important; }
          .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
          .text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
          .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
          .text-3xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
          .font-normal { font-weight: 400 !important; }
          .font-medium { font-weight: 500 !important; }
          .font-semibold { font-weight: 600 !important; }
          .font-bold { font-weight: 700 !important; }
          .text-center { text-align: center !important; }
          .leading-relaxed { line-height: 1.625 !important; }
          .leading-tight { line-height: 1.25 !important; }
          .italic { font-style: italic !important; }
          .uppercase { text-transform: uppercase !important; }
          .tracking-widest { letter-spacing: 0.1em !important; }

          /* Borders */
          .border { border-width: 1px !important; }
          .border-0 { border-width: 0 !important; }
          .border-t { border-top-width: 1px !important; }
          .border-b { border-bottom-width: 1px !important; }

          /* Shadows */
          .shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important; }
          .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important; }
          .shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important; }
          .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important; }
          .shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important; }
          .shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25) !important; }

          /* Backdrop */
          .backdrop-blur-sm { backdrop-filter: blur(4px) !important; }
          .backdrop-blur { backdrop-filter: blur(8px) !important; }
          .backdrop-blur-md { backdrop-filter: blur(12px) !important; }
          .backdrop-blur-lg { backdrop-filter: blur(16px) !important; }
          .backdrop-blur-xl { backdrop-filter: blur(24px) !important; }
          .backdrop-blur-2xl { backdrop-filter: blur(40px) !important; }

          /* Transitions */
          .transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter !important; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important; transition-duration: 150ms !important; }
          .transition-all { transition-property: all !important; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important; transition-duration: 150ms !important; }
          .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke !important; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important; transition-duration: 150ms !important; }
          .transition-transform { transition-property: transform !important; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important; transition-duration: 150ms !important; }
          .duration-150 { transition-duration: 150ms !important; }
          .duration-200 { transition-duration: 200ms !important; }
          .duration-300 { transition-duration: 300ms !important; }

        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
