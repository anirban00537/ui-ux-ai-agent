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

        {/* Tailwind Config - Minimal & Robust */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  "background": "var(--background)",
                  "primary": "var(--primary)",
                  "secondary": "var(--secondary)",
                },
                fontFamily: {
                  "display": ["Lexend", "sans-serif"],
                  "sans": ["Lexend", "sans-serif"], // Set Lexend as default sans too for consistency
                },
                borderRadius: {
                  "DEFAULT": "0.5rem",
                  "lg": "1rem",
                  "xl": "1.5rem",
                  "2xl": "2rem",
                  "3xl": "2.5rem",
                  "full": "9999px"
                },
              }
            }
          }
        `,
          }}
        />

        {/* Tailwind Engine with Plugins */}
        <script
          src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,container-queries"
          defer
        />

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
          .bg-primary { background-color: var(--primary) !important; }
          .bg-secondary { background-color: var(--secondary) !important; }
          .text-primary { color: var(--primary) !important; }
          .text-secondary { color: var(--secondary) !important; }

          /* GlobalScrollbar Hide */
          ::-webkit-scrollbar { width: 0px; background: transparent; display: none; }
          * { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
