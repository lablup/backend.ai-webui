import fs from 'fs';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import { chromium } from 'playwright';
import { PDFDocument, PDFName, PDFArray, PDFDict, PDFRef, rgb } from 'pdf-lib';
import type { PdfTheme } from './theme.js';
import { defaultTheme, resolveHeaderFooter } from './theme.js';

interface RenderOptions {
  html: string;
  outputPath: string;
  title: string;
  version: string;
  lang: string;
  theme?: PdfTheme;
}

const PDF_OPTIONS = {
  format: 'A4' as const,
  printBackground: true,
  margin: { top: '25mm', bottom: '20mm', left: '20mm', right: '20mm' },
};

const PRINT_WIDTH_PX = Math.round(170 * 96 / 25.4); // 643

/**
 * Extract page numbers from the PDF's named destinations.
 * Chromium stores /Dests directly in the catalog as a dictionary
 * mapping /anchorId → [pageRef, /XYZ, left, top, zoom].
 */
function extractPageMapFromPdf(
  pdfDoc: PDFDocument,
  targetIds: Set<string>,
): Record<string, number> {
  const context = pdfDoc.context;
  const pages = pdfDoc.getPages();

  // Build page ref → page number lookup
  const pageRefToNum = new Map<string, number>();
  pages.forEach((pg, idx) => {
    pageRefToNum.set(pg.ref.toString(), idx + 1);
  });

  const pageMap: Record<string, number> = {};

  // Get catalog
  const catalogRef = context.trailerInfo.Root;
  const catalog = context.lookup(catalogRef) as PDFDict | undefined;
  if (!catalog) return pageMap;

  // Chromium puts destinations directly in catalog as /Dests dict
  const destsRef = catalog.get(PDFName.of('Dests'));
  if (!destsRef) return pageMap;

  const destsDict = context.lookup(destsRef) as PDFDict | undefined;
  if (!destsDict || !destsDict.entries) return pageMap;

  for (const [key, val] of destsDict.entries()) {
    // Key is PDFName like /quickstart-quickstart
    // Remove the leading '/' and decode any URL-encoded chars (#xx → %xx → decode)
    let anchorId = key.toString().replace(/^\//, '');
    // Chromium double-encodes non-ASCII in PDF name objects:
    // Unicode → URL-encode → #xx encoding. So #25EB = %EB, then %EB%AA%A9 = 목
    anchorId = anchorId.replace(/#([0-9A-Fa-f]{2})/g, '%$1');
    try { anchorId = decodeURIComponent(anchorId); } catch { /* keep as-is */ }
    try { anchorId = decodeURIComponent(anchorId); } catch { /* keep as-is */ }
    if (!targetIds.has(anchorId)) continue;

    // Val is a destination array: [pageRef, /XYZ, left, top, zoom]
    const dest = context.lookup(val);
    if (dest instanceof PDFArray && dest.size() > 0) {
      const pageRef = dest.get(0);
      if (pageRef instanceof PDFRef) {
        const pageNum = pageRefToNum.get(pageRef.toString());
        if (pageNum !== undefined) {
          pageMap[anchorId] = pageNum;
        }
      }
    }
  }

  return pageMap;
}

/**
 * Get the target IDs referenced by the TOC.
 */
async function getTocTargetIds(
  page: import('playwright').Page,
): Promise<string[]> {
  return page.evaluate(() => {
    const ids: string[] = [];
    document.querySelectorAll('[data-toc-target]').forEach((span) => {
      const id = (span as HTMLElement).getAttribute('data-toc-target');
      if (id) ids.push(id);
    });
    return ids;
  });
}

/**
 * Inject page numbers into TOC spans.
 */
async function injectTocPageNumbers(
  page: import('playwright').Page,
  pageMap: Record<string, number>,
): Promise<void> {
  await page.evaluate((map: Record<string, number>) => {
    document.querySelectorAll('[data-toc-target]').forEach((span) => {
      const targetId = (span as HTMLElement).getAttribute('data-toc-target');
      if (targetId && map[targetId] !== undefined) {
        span.textContent = String(map[targetId]);
      }
    });
  }, pageMap);
}

export async function renderPdf(options: RenderOptions): Promise<void> {
  const theme = options.theme ?? defaultTheme;
  const { headerHtml, footerHtml } = resolveHeaderFooter(theme, options.title);

  fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bai-docs-'));
  const tmpHtmlPath = path.join(tmpDir, 'document.html');
  fs.writeFileSync(tmpHtmlPath, options.html, 'utf-8');

  const browser = await chromium.launch();
  let pdfBuffer: Buffer;
  try {
    const page = await browser.newPage({
      viewport: { width: PRINT_WIDTH_PX, height: 800 },
    });

    console.log('  Loading document...');
    await page.goto(pathToFileURL(tmpHtmlPath).toString(), {
      waitUntil: 'networkidle',
      timeout: 120_000,
    });

    await page
      .waitForFunction(
        () => {
          const images = Array.from(document.querySelectorAll('img'));
          if (images.length === 0) return true;
          return images.every(
            (img) => img.complete && (img.naturalWidth > 0 || img.src === ''),
          );
        },
        { timeout: 120_000 },
      )
      .catch(() => {
        console.warn('  Warning: Some images may not have loaded completely');
      });

    const targetIds = await getTocTargetIds(page);
    const targetIdSet = new Set(targetIds);

    // Pass 1: Render PDF → read named destinations → inject page numbers
    console.log('  Calculating page positions (pass 1)...');
    const prelim1 = await page.pdf({
      ...PDF_OPTIONS,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: '<span></span>',
    });
    const doc1 = await PDFDocument.load(prelim1);
    const map1 = extractPageMapFromPdf(doc1, targetIdSet);
    console.log(`    Found ${Object.keys(map1).length}/${targetIds.length} destinations`);
    await injectTocPageNumbers(page, map1);

    // Pass 2: Re-render with filled TOC numbers → re-extract (layout may shift)
    console.log('  Calculating page positions (pass 2)...');
    const prelim2 = await page.pdf({
      ...PDF_OPTIONS,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: '<span></span>',
    });
    const doc2 = await PDFDocument.load(prelim2);
    const map2 = extractPageMapFromPdf(doc2, targetIdSet);
    console.log(`    Found ${Object.keys(map2).length}/${targetIds.length} destinations`);
    await injectTocPageNumbers(page, map2);

    // Show samples
    const entries = Object.entries(map2);
    if (entries.length > 0) {
      console.log(`  Samples:`);
      entries.slice(0, 5).forEach(([id, pg]) => console.log(`    ${id} → page ${pg}`));
    }

    // Final PDF render with visible header/footer
    console.log('  Rendering final PDF...');
    pdfBuffer = await page.pdf({
      ...PDF_OPTIONS,
      displayHeaderFooter: true,
      headerTemplate: headerHtml,
      footerTemplate: footerHtml,
    });
  } finally {
    await browser.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  // Post-process: metadata + cover page masking
  console.log('  Post-processing...');
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  pdfDoc.setTitle(`${options.title} ${options.version} (${options.lang})`);
  pdfDoc.setAuthor('Lablup Inc.');
  pdfDoc.setSubject('Backend.AI WebUI User Guide');
  pdfDoc.setCreator('Backend.AI Docs PDF Generator');
  pdfDoc.setProducer('Playwright + pdf-lib');
  pdfDoc.setCreationDate(new Date());

  // Hide header/footer on cover page with white rectangles
  const coverPage = pdfDoc.getPage(0);
  const { width, height } = coverPage.getSize();

  coverPage.drawRectangle({
    x: 0, y: 0, width, height: 60,
    color: rgb(1, 1, 1),
  });
  coverPage.drawRectangle({
    x: 0, y: height - 75, width, height: 75,
    color: rgb(1, 1, 1),
  });

  const finalBytes = await pdfDoc.save();
  fs.writeFileSync(options.outputPath, finalBytes);
}
