export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full w-full overflow-hidden antialiased">
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

        {/* Tailwind Config - Minimal & Robust */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                colors: {
                  "primary": "var(--primary, #13ec5b)",
                  "background-light": "var(--background-light, #f6f8f6)",
                  "background-dark": "var(--background-dark, #102216)",
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
          :root {
            --primary: #13ec5b;
            --background-light: #f6f8f6;
            --background-dark: #102216;
          }

          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: var(--background-light);
            font-family: "Lexend", sans-serif;
            color: var(--background-dark);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          html.dark body {
            background-color: var(--background-dark);
            color: #e2e8f0;
          }

          /* Theme utilities - must exist for dynamically injected content before Tailwind JIT */
          .bg-background-light { background-color: var(--background-light, #f6f8f6) !important; }
          .bg-background-dark { background-color: var(--background-dark, #102216) !important; }
          .text-primary { color: var(--primary, #13ec5b) !important; }

          /* GlobalScrollbar Hide */
          ::-webkit-scrollbar { width: 0px; background: transparent; display: none; }
          * { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
