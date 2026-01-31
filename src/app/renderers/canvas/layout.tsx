export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full overflow-hidden">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Typographical Stack - Premium Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@200;800&family=DM+Sans:wght@100;900&family=JetBrains+Mono:wght@100;800&family=Playfair+Display:wght@400;900&display=swap" rel="stylesheet" />
        
        {/* Design System Engine */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  background: 'var(--background)',
                  foreground: 'var(--foreground)',
                  card: 'var(--card)',
                  'card-foreground': 'var(--card-foreground)',
                  popover: 'var(--popover)',
                  'popover-foreground': 'var(--popover-foreground)',
                  primary: 'var(--primary)',
                  'primary-foreground': 'var(--primary-foreground)',
                  secondary: 'var(--secondary)',
                  'secondary-foreground': 'var(--secondary-foreground)',
                  muted: 'var(--muted)',
                  'muted-foreground': 'var(--muted-foreground)',
                  accent: 'var(--accent)',
                  'accent-foreground': 'var(--accent-foreground)',
                  destructive: 'var(--destructive)',
                  'destructive-foreground': 'var(--destructive-foreground)',
                  border: 'var(--border)',
                  input: 'var(--input)',
                  ring: 'var(--ring)',
                  chart: {
                    1: 'var(--chart-1)',
                    2: 'var(--chart-2)',
                    3: 'var(--chart-3)',
                    4: 'var(--chart-4)',
                    5: 'var(--chart-5)',
                  }
                },
                borderRadius: {
                  lg: 'var(--radius)',
                  md: 'calc(var(--radius) - 2px)',
                  sm: 'calc(var(--radius) - 4px)',
                },
                fontFamily: {
                  heading: ['Bricolage Grotesque', 'sans-serif'],
                  sans: ['DM Sans', 'sans-serif'],
                  mono: ['JetBrains Mono', 'monospace'],
                  serif: ['Playfair Display', 'serif'],
                },
                keyframes: {
                  enter: {
                    from: { opacity: 'var(--tw-enter-opacity, 1)', transform: 'translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0))' }
                  },
                  exit: {
                    to: { opacity: 'var(--tw-exit-opacity, 1)', transform: 'translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1)) rotate(var(--tw-exit-rotate, 0))' }
                  }
                },
                animation: {
                  in: 'enter 150ms ease-out',
                  out: 'exit 150ms ease-in'
                }
              }
            }
          }
        `}} />

        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: var(--background, #ffffff);
            font-family: var(--font-sans), sans-serif;
            color: var(--foreground, #1e293b);
          }
          /* Custom scrollbar hiding */
          * { -ms-overflow-style: none; scrollbar-width: none; }
          *::-webkit-scrollbar { display: none; }
          
          /* Utility classes for the AI to use */
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
