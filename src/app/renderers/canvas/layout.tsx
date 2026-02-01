export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full overflow-hidden antialiased">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />

        {/* Fonts: Lexend (Competitor), Plus Bricolage & DM Sans (Premium) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=DM+Sans:opsz,wght@9..40,100..900&display=swap"
          rel="stylesheet"
        />
        {/* Material Symbols for Icons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />

        {/* Tailwind v4.1.18 - Play CDN / browser build */}
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.18" defer />

        {/* v4 @theme: map runtime CSS vars (set by UPDATE_THEME) to Tailwind utilities */}
        <style type="text/tailwindcss">{`
          @theme {
            --color-background: var(--background);
            --color-foreground: var(--foreground);
            --color-primary: var(--primary);
            --color-primary-foreground: var(--primary-foreground);
            --color-secondary: var(--secondary);
            --color-secondary-foreground: var(--secondary-foreground);
            --color-muted-foreground: var(--muted-foreground);
            --color-card: var(--card);
            --color-card-foreground: var(--card-foreground);
            --color-border: var(--border);
            --color-input: var(--input);
            --font-display: "Lexend", sans-serif;
            --font-sans: "Lexend", sans-serif;
            --radius: 0.5rem;
            --radius-lg: 1rem;
            --radius-xl: 1.5rem;
            --radius-2xl: 2rem;
            --radius-3xl: 2.5rem;
            --radius-full: 9999px;
          }
        `}</style>

        <style>{`
          /* Single theme only: no dark/light mode. Whatever palette is sent via UPDATE_THEME is shown. */
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: var(--background);
            font-family: "Lexend", sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          #root, .canvas-content-wrapper {
            background-color: var(--background);
            height: 100%;
            min-height: 100%;
          }

          /* Theme utilities - must exist for dynamically injected content before Tailwind JIT */
          .bg-background { background-color: var(--background) !important; }
          .bg-foreground { background-color: var(--foreground) !important; }
          .bg-primary { background-color: var(--primary) !important; }
          .bg-primary-foreground { background-color: var(--primary-foreground) !important; }
          .bg-secondary { background-color: var(--secondary) !important; }
          .bg-secondary-foreground { background-color: var(--secondary-foreground) !important; }
          .bg-muted-foreground { background-color: var(--muted-foreground) !important; }
          .bg-card { background-color: var(--card) !important; }
          .bg-card-foreground { background-color: var(--card-foreground) !important; }
          .bg-border { background-color: var(--border) !important; }
          .bg-input { background-color: var(--input) !important; }
          .text-foreground { color: var(--foreground) !important; }
          .text-primary { color: var(--primary) !important; }
          .text-primary-foreground { color: var(--primary-foreground) !important; }
          .text-secondary { color: var(--secondary) !important; }
          .text-secondary-foreground { color: var(--secondary-foreground) !important; }
          .text-muted-foreground { color: var(--muted-foreground) !important; }
          .text-card { color: var(--card) !important; }
          .text-card-foreground { color: var(--card-foreground) !important; }
          .text-border { color: var(--border) !important; }
          .text-input { color: var(--input) !important; }
          .border-border { border-color: var(--border) !important; }
          .border-input { border-color: var(--input) !important; }

          /* GlobalScrollbar Hide */
          ::-webkit-scrollbar { width: 0px; background: transparent; display: none; }
          * { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
