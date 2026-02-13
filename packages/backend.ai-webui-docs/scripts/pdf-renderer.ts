import fs from 'fs';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import { chromium } from 'playwright';
import { PDFDocument, PDFName, PDFArray, PDFDict, PDFRef, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { PdfTheme } from './theme.js';
import { defaultTheme } from './theme.js';

/**
 * CJK font path candidates (in priority order).
 * Uses the first TTF/OTF found on the system.
 * TTC (collection) files are excluded as pdf-lib/fontkit does not support them directly.
 */
const CJK_FONT_CANDIDATES = [
  // macOS – user-installed fonts
  path.join(os.homedir(), 'Library/Fonts/NanumBarunGothic.ttf'),
  path.join(os.homedir(), 'Library/Fonts/NanumSquareRegular.ttf'),
  '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  // Linux common paths
  '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
  '/usr/share/fonts/truetype/noto/NotoSansKR-Regular.ttf',
  '/usr/share/fonts/truetype/nanum/NanumBarunGothic.ttf',
];

type EmbeddedFont = Awaited<ReturnType<PDFDocument['embedFont']>>;

async function loadCjkFont(pdfDoc: PDFDocument): Promise<EmbeddedFont | null> {
  pdfDoc.registerFontkit(fontkit);

  for (const candidate of CJK_FONT_CANDIDATES) {
    if (!fs.existsSync(candidate)) continue;
    if (candidate.endsWith('.ttc')) continue;
    try {
      const fontBytes = fs.readFileSync(candidate);
      const font = await pdfDoc.embedFont(fontBytes, { subset: true });
      console.log(`  CJK font: ${path.basename(candidate)}`);
      return font;
    } catch (e) {
      console.warn(`  Warning: Could not embed font ${candidate}: ${(e as Error).message}`);
    }
  }
  return null;
}

interface RenderOptions {
  html: string;
  outputPath: string;
  title: string;
  version: string;
  lang: string;
  theme?: PdfTheme;
}

interface ChapterInfo {
  num: number;
  title: string;
  anchorId: string;
  startPage?: number;
}

/**
 * Section info displayed in the footer (H1 chapters + H2 sub-sections).
 * Each entry uses PDF named destination anchorId → page mapping
 * to determine which section label to show on each page.
 */
interface SectionInfo {
  anchorId: string;
  label: string;      // e.g. "Chapter 3 — Title" or "3.2 Sub-title"
  startPage?: number;
}

const PDF_OPTIONS = {
  format: 'A4' as const,
  printBackground: true,
  margin: { top: '25mm', bottom: '20mm', left: '20mm', right: '20mm' },
};

const PRINT_WIDTH_PX = Math.round(170 * 96 / 25.4); // 643

// A4: 595.28 x 841.89 pt.  Margins: top 25mm≈70.87pt, bottom 20mm≈56.69pt, left/right 20mm≈56.69pt
const PT = {
  pageW: 595.28,
  pageH: 841.89,
  marginL: 56.69,   // 20mm
  marginR: 56.69,   // 20mm
  marginT: 70.87,   // 25mm
  marginB: 56.69,   // 20mm
};

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

/**
 * Extract chapter metadata (num, title, anchor) from the HTML.
 */
async function getChapterInfo(
  page: import('playwright').Page,
): Promise<ChapterInfo[]> {
  return page.evaluate(() => {
    const chapters: { num: number; title: string; anchorId: string }[] = [];
    document.querySelectorAll('.chapter[data-chapter-num]').forEach((el) => {
      const num = parseInt((el as HTMLElement).getAttribute('data-chapter-num') || '0', 10);
      const title = (el as HTMLElement).getAttribute('data-chapter-title') || '';
      // The first anchor inside the chapter (the slug anchor)
      const anchor = el.querySelector('a[id]');
      const anchorId = anchor?.getAttribute('id') || '';
      chapters.push({ num, title, anchorId });
    });
    return chapters;
  });
}

/**
 * Collects all H1, H2 headings from the HTML to build a section list.
 * Each heading's id attribute maps to a PDF named destination.
 *
 * H1 → "Chapter N — Chapter title"
 * H2 → "N.M Sub-section title"
 */
async function getAllSections(
  page: import('playwright').Page,
): Promise<SectionInfo[]> {
  return page.evaluate(() => {
    const sections: { anchorId: string; label: string }[] = [];
    // Only target H1, H2 inside .chapter sections
    document.querySelectorAll('.chapter h1[id], .chapter h2[id]').forEach((el) => {
      const id = el.getAttribute('id') || '';
      const text = el.textContent?.trim() || '';
      if (!id || !text) return;
      const tag = el.tagName.toLowerCase();
      if (tag === 'h1') {
        // H1 text: "N. Title" → transform to "Chapter N — Title"
        const match = text.match(/^(\d+)\.\s*(.+)$/);
        if (match) {
          sections.push({ anchorId: id, label: `Chapter ${match[1]}  \u2014  ${match[2]}` });
        } else {
          sections.push({ anchorId: id, label: text });
        }
      } else if (tag === 'h2') {
        // H2 text: "N.M Title" → use as-is
        sections.push({ anchorId: id, label: text });
      }
    });
    return sections;
  });
}

/**
 * Draws header/footer directly with pdf-lib.
 * Does not use Playwright's displayHeaderFooter — gives full control over CJK rendering,
 * positioning, and margins.
 *
 * Header (p2+): Document title left-aligned + separator line below (within body margins)
 * Footer (p2+): Left = current section label (H1 or H2), Right = page number + separator line above
 *
 * Section label logic:
 *   For each page, shows the last section that starts on or before (<=) that page.
 *   Prefers H2 if available; falls back to the current chapter (H1) otherwise.
 */
function stampHeaderFooter(
  pdfDoc: PDFDocument,
  opts: {
    title: string;
    font: EmbeddedFont;
    cjkFont: EmbeddedFont | null;
    sections: SectionInfo[];
    firstChapterPage: number;
  },
): void {
  const { title, font, cjkFont, sections, firstChapterPage } = opts;
  const totalPages = pdfDoc.getPageCount();

  const hfFont = cjkFont ?? font;

  // Style constants — book-style layout
  const fontSize = 8.5;
  const lineColor = rgb(0.78, 0.78, 0.78);   // #c8c8c8
  const textColor = rgb(0.35, 0.35, 0.35);    // #595959
  const lineThickness = 0.5;

  const xLeft = PT.marginL;
  const xRight = PT.pageW - PT.marginR;
  const contentWidth = xRight - xLeft;

  const headerTextY = PT.pageH - 51;
  const headerLineY = headerTextY - 5;

  const footerLineY = 42.5;
  const footerTextY = footerLineY - 10;

  // Sort sections by startPage (only those with a resolved page)
  const sortedSections = sections
    .filter((s) => s.startPage !== undefined)
    .sort((a, b) => a.startPage! - b.startPage!);

  // Determine the most recent section label for each page
  // (the last section whose startPage <= current page)
  const pageSectionLabel: Record<number, string> = {};
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    let label = '';
    for (const s of sortedSections) {
      if (s.startPage! <= pageNum) {
        label = s.label;
      } else {
        break;
      }
    }
    if (label) {
      pageSectionLabel[pageNum] = label;
    }
  }

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageNum = pageIdx + 1;
    const pdfPage = pdfDoc.getPage(pageIdx);

    // Cover page (p1) — no header/footer
    if (pageNum === 1) continue;

    // ── Header ──────────────────────────────────────────
    pdfPage.drawText(title, {
      x: xLeft,
      y: headerTextY,
      size: fontSize,
      font: hfFont,
      color: textColor,
    });
    pdfPage.drawLine({
      start: { x: xLeft, y: headerLineY },
      end: { x: xRight, y: headerLineY },
      thickness: lineThickness,
      color: lineColor,
    });

    // ── Footer ──────────────────────────────────────────
    pdfPage.drawLine({
      start: { x: xLeft, y: footerLineY },
      end: { x: xRight, y: footerLineY },
      thickness: lineThickness,
      color: lineColor,
    });

    // Page number (right-aligned)
    const pageNumStr = String(pageNum);
    const pageNumWidth = hfFont.widthOfTextAtSize(pageNumStr, fontSize);
    pdfPage.drawText(pageNumStr, {
      x: xRight - pageNumWidth,
      y: footerTextY,
      size: fontSize,
      font: hfFont,
      color: textColor,
    });

    // Section label (left-aligned, from chapter pages onward)
    const sectionLabel = pageSectionLabel[pageNum];
    if (sectionLabel && pageNum >= firstChapterPage) {
      const maxLabelWidth = contentWidth - pageNumWidth - 20;
      let displayLabel = sectionLabel;
      let labelWidth = hfFont.widthOfTextAtSize(displayLabel, fontSize);
      if (labelWidth > maxLabelWidth) {
        while (displayLabel.length > 0 && labelWidth > maxLabelWidth) {
          displayLabel = displayLabel.slice(0, -1);
          labelWidth = hfFont.widthOfTextAtSize(displayLabel + '\u2026', fontSize);
        }
        displayLabel += '\u2026';
      }
      pdfPage.drawText(displayLabel, {
        x: xLeft,
        y: footerTextY,
        size: fontSize,
        font: hfFont,
        color: textColor,
      });
    }
  }
}

export async function renderPdf(options: RenderOptions): Promise<void> {
  const theme = options.theme ?? defaultTheme;

  fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bai-docs-'));
  const tmpHtmlPath = path.join(tmpDir, 'document.html');
  fs.writeFileSync(tmpHtmlPath, options.html, 'utf-8');

  const browser = await chromium.launch();
  let pdfBuffer: Buffer;
  let chapterInfoList: ChapterInfo[] = [];
  let sectionList: SectionInfo[] = [];
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
          return images.every((img) => img.complete);
        },
        { timeout: 30_000 },
      )
      .catch(() => {
        console.warn('  Warning: Some images may not have loaded completely');
      });

    // Extract chapter info (for backward compat) and all H1/H2 sections
    chapterInfoList = await getChapterInfo(page);
    sectionList = await getAllSections(page);
    console.log(`  Found ${sectionList.length} sections (H1+H2)`);

    // Collect all anchor IDs we need to resolve: TOC targets + section anchors
    const targetIds = await getTocTargetIds(page);
    for (const ch of chapterInfoList) {
      if (ch.anchorId && !targetIds.includes(ch.anchorId)) {
        targetIds.push(ch.anchorId);
      }
    }
    for (const s of sectionList) {
      if (s.anchorId && !targetIds.includes(s.anchorId)) {
        targetIds.push(s.anchorId);
      }
    }
    const targetIdSet = new Set(targetIds);

    // Pass 1: Render PDF → read named destinations → inject page numbers
    console.log('  Calculating page positions (pass 1)...');
    const prelim1 = await page.pdf(PDF_OPTIONS);
    const doc1 = await PDFDocument.load(prelim1);
    const map1 = extractPageMapFromPdf(doc1, targetIdSet);
    console.log(`    Found ${Object.keys(map1).length}/${targetIds.length} destinations`);
    await injectTocPageNumbers(page, map1);

    // Pass 2: Re-render with filled TOC numbers → re-extract (layout may shift)
    console.log('  Calculating page positions (pass 2)...');
    const prelim2 = await page.pdf(PDF_OPTIONS);
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

    // Assign start pages to chapters and sections from map2
    for (const ch of chapterInfoList) {
      if (ch.anchorId && map2[ch.anchorId] !== undefined) {
        ch.startPage = map2[ch.anchorId];
      }
    }
    for (const s of sectionList) {
      if (s.anchorId && map2[s.anchorId] !== undefined) {
        s.startPage = map2[s.anchorId];
      }
    }

    // Log section→page mapping for debugging
    const resolvedSections = sectionList.filter((s) => s.startPage !== undefined);
    console.log(`  Resolved ${resolvedSections.length}/${sectionList.length} section positions`);
    resolvedSections.slice(0, 8).forEach((s) =>
      console.log(`    p${s.startPage}: ${s.label}`),
    );

    // Final PDF render — NO Playwright header/footer (we stamp our own via pdf-lib)
    console.log('  Rendering final PDF...');
    pdfBuffer = await page.pdf(PDF_OPTIONS);
  } finally {
    await browser.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  // ── Post-processing ──────────────────────────────────────────
  console.log('  Post-processing (header/footer + metadata)...');
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  pdfDoc.setTitle(`${options.title} ${options.version} (${options.lang})`);
  pdfDoc.setAuthor('Lablup Inc.');
  pdfDoc.setSubject('Backend.AI WebUI User Guide');
  pdfDoc.setCreator('Backend.AI Docs PDF Generator');
  pdfDoc.setProducer('Playwright + pdf-lib');
  pdfDoc.setCreationDate(new Date());

  const latinFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const cjkFont = await loadCjkFont(pdfDoc);

  // First chapter start page (skip chapter labels on preceding pages like TOC).
  // Computed from sectionList (H1/H2 heading id attributes) — works around the issue
  // where Chromium does not generate PDF named destinations for bare <a id> slug
  // anchors in chapterInfoList, leaving startPage undefined.
  const sortedSections = sectionList
    .filter((s) => s.startPage !== undefined)
    .sort((a, b) => a.startPage! - b.startPage!);
  const firstChapterPage = sortedSections.length > 0
    ? sortedSections[0].startPage!
    : pdfDoc.getPageCount() + 1;
  console.log(`  First chapter page: ${firstChapterPage}`);

  stampHeaderFooter(pdfDoc, {
    title: options.title,
    font: latinFont,
    cjkFont,
    sections: sectionList,
    firstChapterPage,
  });

  const finalBytes = await pdfDoc.save();
  fs.writeFileSync(options.outputPath, finalBytes);
}
