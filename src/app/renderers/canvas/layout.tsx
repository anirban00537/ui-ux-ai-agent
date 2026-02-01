export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full overflow-hidden antialiased">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        
        {/* Fonts: Lexend (Competitor), Plus Bricolage & DM Sans (Premium) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=DM+Sans:opsz,wght@9..40,100..900&display=swap" rel="stylesheet" />
        
        {/* Tailwind Config - Minimal & Robust */}
        <script dangerouslySetInnerHTML={{ __html: `
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
        `}} />
        
        {/* Tailwind Engine with Plugins */}
        <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,container-queries"></script>

        <style>{`
          :root {
            /* Minimal Theme Defaults (Competitor Style) */
            --primary: #13ec5b;
            --background-light: #f6f8f6;
            --background-dark: #102216;
            
            /* Shadcn Mappings for compatibility */
            --background: #f6f8f6;
            --foreground: #102216;
            --card: #ffffff;
            --card-foreground: #102216;
            --muted: #f1f5f9;
            --muted-foreground: #64748b;
            --border: #e2e8f0;
            --input: #e2e8f0;
            --radius: 0.5rem;
          }

          .dark {
            --background: #102216;
            --foreground: #ffffff;
            --card: #1a2e22;
            --card-foreground: #ffffff;
            --muted: #1a2e22;
            --muted-foreground: #92c9a4;
            --border: #23482f;
            --input: #23482f;
          }

          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: var(--background);
            font-family: "Lexend", sans-serif;
            color: var(--foreground);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* GlobalScrollbar Hide */
          ::-webkit-scrollbar { width: 0px; background: transparent; display: none; }
          * { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
