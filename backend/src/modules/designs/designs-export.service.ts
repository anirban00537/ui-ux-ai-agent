import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import puppeteer from 'puppeteer';
import archiver from 'archiver';
import { PassThrough } from 'stream';

@Injectable()
export class DesignsExportService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly RENDERER_CONFIG = {
    scripts: [
      "https://cdn.tailwindcss.com",
      "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
    ],
    links: [
      "https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css",
      "https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap"
    ],
    baseStyles: `
      * { 
        box-sizing: border-box; 
        -webkit-font-smoothing: antialiased; 
        margin: 0;
        padding: 0;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100%;
        height: auto !important;
        background: transparent;
      }
      body, div, p, span, h1, h2, h3, h4, h5, h6 { 
        font-family: 'Poppins', -apple-system, sans-serif; 
      }
      img { max-width: 100%; height: auto; display: block; }
      button { background: none; border: none; padding: 0; cursor: pointer; color: inherit; font: inherit; }
    `
  };

  private getThemeCss(palette: any) {
    if (!palette || typeof palette !== 'object') return "";
    
    const vars: Record<string, string> = {
      "--background": palette.background || "#ffffff",
      "--foreground": palette.foreground || "#000000",
      "--primary": palette.primary || "#3b82f6",
      "--primary-foreground": palette.primaryForeground || "#ffffff",
      "--secondary": palette.secondary || "#f3f4f6",
      "--secondary-foreground": palette.secondaryForeground || "#1f2937",
      "--muted-foreground": palette.mutedForeground || "#6b7280",
      "--card": palette.card || "#ffffff",
      "--card-foreground": palette.cardForeground || "#000000",
      "--border": palette.border || "#e5e7eb",
      "--input": palette.input || "#e5e7eb",
    };

    const varsString = Object.entries(vars)
      .map(([key, value]) => `      ${key}: ${value};`)
      .join("\n");
    
    return `\n    :root {\n${varsString}\n    }\n  `;
  }

  private generateFullHtml(htmlContent: string, palette: any) {
    const themeStyles = this.getThemeCss(palette);
    const scriptsMarkup = this.RENDERER_CONFIG.scripts.map(s => `<script src="${s}"></script>`).join("\n    ");
    const linksMarkup = this.RENDERER_CONFIG.links.map(l => `<link href="${l}" rel="stylesheet">`).join("\n    ");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design Export</title>
    ${scriptsMarkup}
    ${linksMarkup}
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              border: "var(--border)",
              input: "var(--input)",
              ring: "var(--primary)",
              background: "var(--background)",
              foreground: "var(--foreground)",
              primary: {
                DEFAULT: "var(--primary)",
                foreground: "var(--primary-foreground)",
              },
              secondary: {
                DEFAULT: "var(--secondary)",
                foreground: "var(--secondary-foreground)",
              },
              muted: {
                DEFAULT: "var(--secondary)",
                foreground: "var(--muted-foreground)",
              },
              card: {
                DEFAULT: "var(--card)",
                foreground: "var(--card-foreground)",
              }
            }
          }
        }
      }
    </script>
    <style>
      ${this.RENDERER_CONFIG.baseStyles}
      ${themeStyles}
      body {
        background-color: var(--background);
        color: var(--foreground);
      }
    </style>
</head>
<body>
    <div id="canvas-wrapper">
      ${htmlContent}
    </div>
</body>
</html>`;
  }

  async exportArtboardAsImage(artboardId: string, userId: string): Promise<Buffer> {
    const artboard = await this.prisma.artboard.findUnique({
      where: { id: artboardId },
      include: { design: true }
    });

    if (!artboard || artboard.design.userId !== userId) {
      throw new NotFoundException('Artboard not found or permission denied');
    }

    console.log(`[Export] Starting image export for artboard ${artboardId}`);
    const fullHtml = this.generateFullHtml(artboard.html, artboard.design.colorPalette);

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: true
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({
        width: artboard.width || 480,
        height: 1000, 
        deviceScaleFactor: 2
      });

      // Set content and wait for it to render
      await page.setContent(fullHtml, { waitUntil: 'load', timeout: 30000 });
      
      // Wait for font loading and layout settle
      await page.evaluateHandle('document.fonts.ready');
      await new Promise(resolve => setTimeout(resolve, 800)); 

      // Auto-detect height
      const contentHeight = await page.evaluate(() => {
        const wrapper = document.querySelector('#canvas-wrapper');
        if (!wrapper) return document.body.scrollHeight;
        
        // Use the larger of the two to be safe
        return Math.max(wrapper.scrollHeight, (wrapper as HTMLElement).offsetHeight);
      });

      await page.setViewport({
        width: artboard.width || 480,
        height: Math.ceil(contentHeight),
        deviceScaleFactor: 2
      });

      const element = await page.$('#canvas-wrapper');
      if (!element) throw new Error('Content wrapper not found');

      const screenshot = await element.screenshot({
        type: 'png',
        omitBackground: true
      });

      console.log(`[Export] Successfully captured image for artboard ${artboardId} (Auto-Height: ${contentHeight}px)`);
      return Buffer.from(screenshot);
    } finally {
      await browser.close();
    }
  }

  async exportAllAsZip(designId: string, userId: string): Promise<Buffer> {
    const design = await this.prisma.design.findUnique({
      where: { id: designId },
      include: { 
        artboards: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!design || design.userId !== userId) {
      throw new NotFoundException('Design not found or permission denied');
    }

    console.log(`[Export] Starting bulk image export for design ${designId} (${design.artboards.length} artboards)`);

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: true
    });

    try {
      const archive = archiver('zip', { zlib: { level: 5 } });
      const chunks: Buffer[] = [];
      
      const zipBufferPromise = new Promise<Buffer>((resolve, reject) => {
        archive.on('data', (chunk) => chunks.push(chunk));
        archive.on('end', () => {
          console.log(`[Export] Bulk image export complete for ${designId}`);
          resolve(Buffer.concat(chunks));
        });
        archive.on('error', (err) => {
          console.error(`[Export] Archiver error for ${designId}:`, err);
          reject(err);
        });
      });

      // Process artboards in parallel with a limit to avoid overloading memory
      const CONCURRENCY_LIMIT = 2;
      for (let i = 0; i < design.artboards.length; i += CONCURRENCY_LIMIT) {
        const batch = design.artboards.slice(i, i + CONCURRENCY_LIMIT);
        
        await Promise.all(batch.map(async (artboard, batchIdx) => {
          const globalIdx = i + batchIdx;
          const page = await browser.newPage();
          try {
            await page.setViewport({
              width: artboard.width || 480,
              height: 1000,
              deviceScaleFactor: 2
            });

            const fullHtml = this.generateFullHtml(artboard.html, design.colorPalette);
            await page.setContent(fullHtml, { waitUntil: 'load', timeout: 30000 });
            
            // Ensure fonts are loaded
            await page.evaluateHandle('document.fonts.ready');
            await new Promise(resolve => setTimeout(resolve, 800));

            // Auto-detect height
            const contentHeight = await page.evaluate(() => {
              const wrapper = document.querySelector('#canvas-wrapper');
              if (!wrapper) return document.body.scrollHeight;
              return Math.max(wrapper.scrollHeight, (wrapper as HTMLElement).offsetHeight);
            });

            await page.setViewport({
              width: artboard.width || 480,
              height: Math.ceil(contentHeight),
              deviceScaleFactor: 2
            });

            const element = await page.$('#canvas-wrapper');
            if (element) {
              const screenshot = await element.screenshot({ type: 'png' });
              const fileName = `${globalIdx + 1}_${artboard.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
              archive.append(Buffer.from(screenshot), { name: fileName });
              console.log(`[Export] Captured ${fileName} (Auto-Height: ${contentHeight}px)`);
            }
          } finally {
            await page.close();
          }
        }));
      }

      await archive.finalize();
      return await zipBufferPromise;
    } finally {
      await browser.close();
    }
  }

  async exportAllHtmlAsZip(designId: string, userId: string): Promise<Buffer> {
    const design = await this.prisma.design.findUnique({
      where: { id: designId },
      include: { 
        artboards: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!design || design.userId !== userId) {
      throw new NotFoundException('Design not found or permission denied');
    }

    console.log(`[Export] Starting bulk HTML export for design ${designId}`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    
    const zipBufferPromise = new Promise<Buffer>((resolve, reject) => {
      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => {
        console.log(`[Export] Bulk HTML export complete for ${designId}`);
        resolve(Buffer.concat(chunks));
      });
      archive.on('error', (err) => reject(err));
    });

    for (let i = 0; i < design.artboards.length; i++) {
      const artboard = design.artboards[i];
      const fullHtml = this.generateFullHtml(artboard.html, design.colorPalette);
      const fileName = `${i + 1}_${artboard.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
      archive.append(fullHtml, { name: fileName });
    }

    await archive.finalize();
    return await zipBufferPromise;
  }

  async exportArtboardAsHtml(artboardId: string, userId: string): Promise<{ html: string; title: string }> {
    const artboard = await this.prisma.artboard.findUnique({
      where: { id: artboardId },
      include: { design: true }
    });

    if (!artboard || artboard.design.userId !== userId) {
      throw new NotFoundException('Artboard not found or permission denied');
    }

    const fullHtml = this.generateFullHtml(artboard.html, artboard.design.colorPalette);
    return { html: fullHtml, title: artboard.title };
  }
}
