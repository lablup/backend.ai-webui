import fs from 'fs';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import { chromium, type Browser } from 'playwright';
import { PDFDocument, PDFName, PDFArray, PDFDict, PDFRef, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { PdfTheme } from './theme.js';
import { defaultTheme } from './theme.js';
import type { ResolvedDocConfig } from './config.js';

/**
 * Default font path candidates for the header/footer stamp, grouped by
 * the script kind they cover.
 *
 * The header/footer is rendered with pdf-lib (not Chromium), so it needs an
 * embedded font that covers every codepoint that may appear in the document
 * title and section labels — which, for ko/ja/th builds, includes CJK and
 * Thai glyphs that pdf-lib's default WinAnsi-encoded Helvetica cannot encode.
 *
 * TTC (TrueType Collection) files are supported via in-process sub-font
 * extraction (see `extractFontFromTtc`), so `NotoSansCJK-Regular.ttc` works
 * on Linux without requiring a separate per-language TTF.
 *
 * We load only the candidates needed for the current language. Loading
 * unused fonts wastes memory and (more importantly) can trigger latent
 * fontkit subsetting bugs in fonts whose glyphs are never actually drawn.
 */
const CJK_FONT_CANDIDATES = [
  // macOS – user-installed fonts
  path.join(os.homedir(), 'Library/Fonts/NanumBarunGothic.ttf'),
  path.join(os.homedir(), 'Library/Fonts/NanumSquareRegular.ttf'),
  '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  // Linux – Noto CJK collection (covers ko/ja/zh-CN/zh-TW/zh-HK)
  '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
  // Linux – per-language Noto CJK if installed separately
  '/usr/share/fonts/truetype/noto/NotoSansKR-Regular.ttf',
  '/usr/share/fonts/truetype/noto/NotoSansJP-Regular.ttf',
  // Linux – Korean fallback
  '/usr/share/fonts/truetype/nanum/NanumBarunGothic.ttf',
  // Linux common paths — Japanese (fonts-takao-gothic on Debian/Ubuntu)
  '/usr/share/fonts/truetype/takao-gothic/TakaoGothic.ttf',
  '/usr/share/fonts/truetype/takao-mincho/TakaoMincho.ttf',
  // Linux common paths — Thai (fonts-thai-tlwg on Debian/Ubuntu)
  '/usr/share/fonts/truetype/tlwg/Loma.ttf',
  '/usr/share/fonts/opentype/tlwg/Loma.otf',
  '/usr/share/fonts/truetype/tlwg/Garuda.ttf',
];

const THAI_FONT_CANDIDATES = [
  // Linux – TLWG family ships with Debian/Ubuntu by default
  '/usr/share/fonts/opentype/tlwg/Loma.otf',
  '/usr/share/fonts/truetype/tlwg/Garuda.ttf',
  '/usr/share/fonts/truetype/tlwg/Norasi.ttf',
];

/**
 * Languages whose header/footer stamp text is expected to contain CJK
 * Han / Hangul / Kana glyphs.
 */
const CJK_LANGS = new Set(['ko', 'ja', 'zh', 'zh-CN', 'zh-TW', 'zh-HK']);
const THAI_LANGS = new Set(['th']);

type EmbeddedFont = Awaited<ReturnType<PDFDocument['embedFont']>>;

/**
 * Extract a single sub-font from a TrueType Collection (.ttc) into a
 * standalone TTF/OTF byte buffer that pdf-lib can embed.
 *
 * TTC files concatenate multiple sfnt fonts behind a single header. Each
 * sub-font's table directory contains absolute offsets into the collection
 * file. To produce a valid standalone font, we copy the sub-font's tables
 * into a fresh buffer and rewrite the table directory with new (relative)
 * offsets. Table data is 4-byte aligned per the OpenType spec.
 */
function extractFontFromTtc(buf: Buffer, subIndex: number): Buffer {
  if (buf.length < 12 || buf.toString('ascii', 0, 4) !== 'ttcf') {
    throw new Error('Not a TrueType Collection (missing ttcf tag)');
  }
  const numFonts = buf.readUInt32BE(8);
  if (subIndex < 0 || subIndex >= numFonts) {
    throw new Error(
      `TTC sub-font index ${subIndex} out of range (0..${numFonts - 1})`,
    );
  }
  if (buf.length < 12 + 4 * numFonts) {
    throw new Error('Truncated TTC: offset table overruns file');
  }
  const subOffset = buf.readUInt32BE(12 + 4 * subIndex);
  if (subOffset + 12 > buf.length) {
    throw new Error('Truncated TTC: sub-font offset overruns file');
  }

  const sfntVersion = buf.readUInt32BE(subOffset);
  const numTables = buf.readUInt16BE(subOffset + 4);
  const searchRange = buf.readUInt16BE(subOffset + 6);
  const entrySelector = buf.readUInt16BE(subOffset + 8);
  const rangeShift = buf.readUInt16BE(subOffset + 10);
  if (subOffset + 12 + numTables * 16 > buf.length) {
    throw new Error('Truncated TTC: table directory overruns file');
  }

  type TableEntry = {
    tag: string;
    checksum: number;
    offset: number;
    length: number;
    newOffset: number;
  };
  const tables: TableEntry[] = [];
  for (let i = 0; i < numTables; i++) {
    const entryOff = subOffset + 12 + i * 16;
    const tOffset = buf.readUInt32BE(entryOff + 8);
    const tLength = buf.readUInt32BE(entryOff + 12);
    if (tOffset + tLength > buf.length) {
      throw new Error('Truncated TTC: table data overruns file');
    }
    tables.push({
      tag: buf.toString('ascii', entryOff, entryOff + 4),
      checksum: buf.readUInt32BE(entryOff + 4),
      offset: tOffset,
      length: tLength,
      newOffset: 0,
    });
  }

  const align4 = (n: number) => (n + 3) & ~3;
  let cursor = 12 + numTables * 16;
  for (const t of tables) {
    t.newOffset = cursor;
    cursor += align4(t.length);
  }

  const out = Buffer.alloc(cursor, 0);
  out.writeUInt32BE(sfntVersion, 0);
  out.writeUInt16BE(numTables, 4);
  out.writeUInt16BE(searchRange, 6);
  out.writeUInt16BE(entrySelector, 8);
  out.writeUInt16BE(rangeShift, 10);
  for (let i = 0; i < numTables; i++) {
    const t = tables[i];
    const dirOff = 12 + i * 16;
    out.write(t.tag, dirOff, 4, 'ascii');
    out.writeUInt32BE(t.checksum, dirOff + 4);
    out.writeUInt32BE(t.newOffset, dirOff + 8);
    out.writeUInt32BE(t.length, dirOff + 12);
    buf.copy(out, t.newOffset, t.offset, t.offset + t.length);
  }

  return out;
}

/**
 * Per-language preferred postscript names within a NotoSansCJK TTC.
 * Used to pick the right sub-font when the candidate is a TTC.
 * For unlisted languages, falls back to the JP variant which has the
 * widest Han coverage among the four.
 */
const CJK_TTC_LANG_TO_PSNAME: Record<string, string> = {
  ko: 'NotoSansCJKkr-Regular',
  ja: 'NotoSansCJKjp-Regular',
  zh: 'NotoSansCJKsc-Regular',
  'zh-CN': 'NotoSansCJKsc-Regular',
  'zh-TW': 'NotoSansCJKtc-Regular',
  'zh-HK': 'NotoSansCJKhk-Regular',
};

/**
 * Load a candidate font path into pdf-lib. Handles plain TTF/OTF and
 * TrueType Collections (.ttc) by extracting the appropriate sub-font.
 *
 * Path syntax: `path/to/font.ttc#PostscriptName` or `path/to/font.ttc#3`
 * lets the caller pin a specific sub-font; otherwise the language hint is
 * used to look up the preferred sub-font from `CJK_TTC_LANG_TO_PSNAME`.
 */
async function embedFontFromPath(
  pdfDoc: PDFDocument,
  candidatePath: string,
  lang: string,
): Promise<EmbeddedFont | null> {
  const [filePath, selector] = candidatePath.split('#');
  if (!fs.existsSync(filePath)) return null;

  let fontBytes = fs.readFileSync(filePath);

  // TTC: extract the right sub-font into a standalone OTF/TTF buffer
  if (fontBytes.length >= 4 && fontBytes.toString('ascii', 0, 4) === 'ttcf') {
    // fontkit's TypeScript types don't expose the TrueTypeCollection variant,
    // but at runtime `fontkit.create(ttcBytes)` returns an object with a
    // `fonts: TTFFont[]` property listing every sub-font in postscript-name order.
    const collection = fontkit.create(fontBytes) as unknown as {
      fonts: Array<{ postscriptName: string; fullName: string }>;
    };
    const subFonts = collection.fonts;

    let subIndex = -1;
    if (selector) {
      const numericSelector = Number(selector);
      if (Number.isInteger(numericSelector)) {
        subIndex = numericSelector;
      } else {
        subIndex = subFonts.findIndex((f) => f.postscriptName === selector);
      }
    }
    if (subIndex < 0) {
      const langPsName = CJK_TTC_LANG_TO_PSNAME[lang]
        ?? CJK_TTC_LANG_TO_PSNAME[lang.split('-')[0]]
        ?? CJK_TTC_LANG_TO_PSNAME.ja;
      subIndex = subFonts.findIndex((f) => f.postscriptName === langPsName);
    }
    if (subIndex < 0) subIndex = 0;

    fontBytes = extractFontFromTtc(fontBytes, subIndex);
  }

  const font = await pdfDoc.embedFont(fontBytes, { subset: true });
  return font;
}

/**
 * Load fallback fonts for the header/footer stamp. Returns the first
 * successfully-embedded font from the language-appropriate candidate list,
 * wrapped in an array so the caller can extend it with the Latin fallback.
 *
 * Loading is language-scoped: only CJK candidates are tried for ko/ja/zh,
 * only Thai candidates for th, and English builds skip non-Latin fonts
 * entirely. Loading every candidate up-front would waste memory and (more
 * importantly) can trigger latent fontkit subsetting bugs in fonts whose
 * glyphs are never actually drawn on the final PDF.
 *
 * When no candidate is available, returns an empty array and the caller
 * falls back to Latin-only Helvetica with a warning logged.
 */
async function loadStampFallbackFonts(
  pdfDoc: PDFDocument,
  lang: string,
  extraPaths?: string[],
): Promise<EmbeddedFont[]> {
  pdfDoc.registerFontkit(fontkit);

  const langKey = lang.split('-')[0];
  let defaultCandidates: string[] = [];
  if (CJK_LANGS.has(lang) || CJK_LANGS.has(langKey)) {
    defaultCandidates = CJK_FONT_CANDIDATES;
  } else if (THAI_LANGS.has(lang) || THAI_LANGS.has(langKey)) {
    defaultCandidates = THAI_FONT_CANDIDATES;
  }

  // User-supplied paths take priority and are tried first regardless of
  // language — the consumer knows their content best.
  const candidates = [...(extraPaths ?? []), ...defaultCandidates];

  const loaded: EmbeddedFont[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const filePath = candidate.split('#')[0];
    if (seen.has(filePath)) continue;
    seen.add(filePath);
    try {
      const font = await embedFontFromPath(pdfDoc, candidate, lang);
      if (font) {
        console.log(`  Stamp font loaded: ${path.basename(filePath)}`);
        loaded.push(font);
        // Stop after the first successfully-loaded font for this language —
        // the glyph-coverage check at draw time only needs one good
        // candidate, and avoiding extra subsetters dodges the CFF-subset
        // bug in @pdf-lib/fontkit (RangeError in CFFSubset.encode) when a
        // font is registered but its glyphs are never actually drawn.
        break;
      }
    } catch (e) {
      console.warn(
        `  Warning: Could not embed font ${candidate}: ${(e as Error).message}`,
      );
    }
  }
  return loaded;
}

export interface RenderOptions {
  html: string;
  outputPath: string;
  title: string;
  version: string;
  lang: string;
  theme?: PdfTheme;
  config?: ResolvedDocConfig;
  /**
   * Optional shared Chromium instance. When provided, renderPdf reuses it
   * by opening a new page on the existing browser, and the caller owns its
   * lifecycle. This avoids paying the per-call launch cost when generating
   * multiple PDFs in one run (e.g. one PDF per language during release builds).
   */
  browser?: Browser;
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
 * Pick the best font for a given text by checking glyph coverage.
 *
 * Walks the candidate list in order and returns the first font whose
 * fontkit instance reports a glyph for every codepoint in the string.
 * If none cover the text fully, returns the last (Latin) font — drawing
 * with it may produce tofu boxes for unsupported codepoints, but pdf-lib
 * will not throw `WinAnsi cannot encode "目"`-style errors because all
 * fonts we load here are Unicode-encoded subsets.
 */
function pickFontForText(text: string, candidates: EmbeddedFont[]): EmbeddedFont {
  if (candidates.length === 1) return candidates[0];
  for (const font of candidates) {
    // pdf-lib does not expose hasGlyphForCodePoint publicly, but the
    // underlying fontkit instance is reachable via the embedder.
    const fkFont = (font as unknown as {
      embedder?: { font?: { hasGlyphForCodePoint?: (cp: number) => boolean } };
    }).embedder?.font;
    if (!fkFont?.hasGlyphForCodePoint) {
      // Standard14 fonts (Helvetica) lack this introspection; only safe
      // to use when the text is ASCII.
      let asciiOnly = true;
      for (const ch of text) {
        if (ch.codePointAt(0)! > 0x7e) { asciiOnly = false; break; }
      }
      if (asciiOnly) return font;
      continue;
    }
    let covers = true;
    for (const ch of text) {
      if (!fkFont.hasGlyphForCodePoint(ch.codePointAt(0)!)) {
        covers = false;
        break;
      }
    }
    if (covers) return font;
  }
  return candidates[candidates.length - 1];
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
 *
 * Font selection:
 *   Each text string is drawn with the first font in `fontFallbacks` whose
 *   underlying fontkit instance reports glyph coverage for every codepoint.
 *   The Latin font is the last candidate, used for ASCII-only strings (e.g.
 *   page numbers) and as the final fallback.
 */
function stampHeaderFooter(
  pdfDoc: PDFDocument,
  opts: {
    title: string;
    font: EmbeddedFont;
    fontFallbacks: EmbeddedFont[];
    sections: SectionInfo[];
    firstChapterPage: number;
  },
): void {
  const { title, font, fontFallbacks, sections, firstChapterPage } = opts;
  const totalPages = pdfDoc.getPageCount();

  // Order: non-Latin fonts first (so CJK/Thai win when the text needs them),
  // Latin font last (handles ASCII page numbers and serves as final fallback).
  const candidates: EmbeddedFont[] = [...fontFallbacks, font];

  const titleFont = pickFontForText(title, candidates);

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
      font: titleFont,
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

    // Page number (right-aligned, ASCII-only)
    const pageNumStr = String(pageNum);
    const pageNumFont = pickFontForText(pageNumStr, candidates);
    const pageNumWidth = pageNumFont.widthOfTextAtSize(pageNumStr, fontSize);
    pdfPage.drawText(pageNumStr, {
      x: xRight - pageNumWidth,
      y: footerTextY,
      size: fontSize,
      font: pageNumFont,
      color: textColor,
    });

    // Section label (left-aligned, from chapter pages onward).
    // Picked per-page because chapter labels in different languages may
    // need different fonts (e.g. CJK for ko/ja chapter titles, Thai font
    // for th chapter titles, Latin for English appendix headings).
    const sectionLabel = pageSectionLabel[pageNum];
    if (sectionLabel && pageNum >= firstChapterPage) {
      const labelFont = pickFontForText(sectionLabel, candidates);
      const maxLabelWidth = contentWidth - pageNumWidth - 20;
      let displayLabel = sectionLabel;
      let labelWidth = labelFont.widthOfTextAtSize(displayLabel, fontSize);
      if (labelWidth > maxLabelWidth) {
        while (displayLabel.length > 0 && labelWidth > maxLabelWidth) {
          displayLabel = displayLabel.slice(0, -1);
          labelWidth = labelFont.widthOfTextAtSize(displayLabel + '\u2026', fontSize);
        }
        displayLabel += '\u2026';
      }
      pdfPage.drawText(displayLabel, {
        x: xLeft,
        y: footerTextY,
        size: fontSize,
        font: labelFont,
        color: textColor,
      });
    }
  }
}

export async function renderPdf(options: RenderOptions): Promise<void> {
  const theme = options.theme ?? defaultTheme;
  const config = options.config;

  fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });

  const ownsBrowser = !options.browser;
  const browser = options.browser ?? (await chromium.launch());

  // tmpDir is created after the browser is ready so a chromium.launch()
  // failure cannot leave an orphaned temp directory behind. Use an outer
  // try/finally so a failure between mkdtempSync and the inner try also
  // cleans up the browser when we own it.
  let tmpDir: string | undefined;
  let pdfBuffer: Buffer;
  let chapterInfoList: ChapterInfo[] = [];
  let sectionList: SectionInfo[] = [];
  let page: Awaited<ReturnType<Browser['newPage']>> | undefined;
  try {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bai-docs-'));
    const tmpHtmlPath = path.join(tmpDir, 'document.html');
    fs.writeFileSync(tmpHtmlPath, options.html, 'utf-8');
    page = await browser.newPage({
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
    if (page) {
      await page.close().catch(() => {});
    }
    if (ownsBrowser) {
      await browser.close();
    }
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  // ── Post-processing ──────────────────────────────────────────
  console.log('  Post-processing (header/footer + metadata)...');
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  // PDF metadata from config or sensible defaults
  const pdfMeta = config?.pdfMetadata;
  const flatTitle = options.title.trim().replace(/\n/g, ' ');
  pdfDoc.setTitle(`${flatTitle} ${options.version} (${options.lang})`);
  pdfDoc.setAuthor(pdfMeta?.author ?? 'docs-toolkit');
  pdfDoc.setSubject(pdfMeta?.subject ?? flatTitle);
  pdfDoc.setCreator(pdfMeta?.creator ?? 'docs-toolkit PDF Generator');
  pdfDoc.setProducer('Playwright + pdf-lib');
  pdfDoc.setCreationDate(new Date());

  const latinFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontFallbacks = await loadStampFallbackFonts(
    pdfDoc,
    options.lang,
    config?.cjkFontPaths,
  );
  if (fontFallbacks.length === 0 && options.lang !== 'en') {
    console.warn(
      `  Warning: No CJK/Thai fonts found for lang="${options.lang}". ` +
        `Header/footer stamp will fall back to Latin (Helvetica) — non-Latin ` +
        `glyphs may render as missing/tofu. Install Noto Sans CJK and TLWG ` +
        `(Loma/Garuda) fonts, or set "cjkFontPaths" in docs-toolkit.config.yaml.`,
    );
  }

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
    title: flatTitle,
    font: latinFont,
    fontFallbacks,
    sections: sectionList,
    firstChapterPage,
  });

  const finalBytes = await pdfDoc.save();
  fs.writeFileSync(options.outputPath, finalBytes);
}
