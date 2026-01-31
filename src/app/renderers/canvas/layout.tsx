export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden; /* Main container hidden, simplebar or iframe handles scroll */
            background-color: #ffffff; /* Default to white for mobile previews */
          }
          /* Custom scrollbar hiding */
          * { -ms-overflow-style: none; scrollbar-width: none; }
          *::-webkit-scrollbar { display: none; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
