import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PDFDocument, PDFDict, PDFName } from "pdf-lib";

export const PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export function pdfPath(lang: string): string {
  // The PDF filename template in `docs-toolkit.config.yaml` substitutes
  // `{title}` / `{version}` / `{lang}`. We don't recompute it here —
  // we glob a strict pattern instead so a template tweak surfaces as a
  // test failure rather than silently picking up a stale file.
  const distDir = path.join(PACKAGE_ROOT, "dist");
  const missingPdfError =
    `tests/pdf: no PDF found for lang=${lang} under ${distDir}. ` +
    `Run \`pnpm --filter backend.ai-docs-toolkit-example pdf\` first.`;
  if (!fs.existsSync(distDir)) {
    // Without this guard, `fs.readdirSync` throws ENOENT and the test
    // failure swallows the actionable "run pdf first" message.
    throw new Error(missingPdfError);
  }
  const candidates = fs
    .readdirSync(distDir)
    .filter((f) => f.startsWith("DocsToolkitExample_") && f.endsWith(`_${lang}.pdf`));
  if (candidates.length === 0) {
    throw new Error(missingPdfError);
  }
  if (candidates.length > 1) {
    throw new Error(
      `tests/pdf: multiple PDFs match lang=${lang}: ${candidates.join(", ")}. Clean dist/ first.`,
    );
  }
  return path.join(distDir, candidates[0]);
}

export async function loadPdf(lang: string): Promise<PDFDocument> {
  const buf = fs.readFileSync(pdfPath(lang));
  return PDFDocument.load(buf);
}

/**
 * Walk the PDF's indirect objects and collect every `/Font` /BaseFont name.
 * Returned as a deduplicated, sorted list. The leading slash is stripped
 * (so callers compare against `Helvetica` rather than `/Helvetica`); the
 * `XXXXXX+` font-subset prefix that Playwright/Chromium adds is also
 * stripped so callers can match `WenQuanYiZenHei` directly.
 */
export function collectBaseFonts(doc: PDFDocument): string[] {
  const found = new Set<string>();
  doc.context.enumerateIndirectObjects().forEach(([, obj]) => {
    if (obj instanceof PDFDict) {
      const t = obj.get(PDFName.of("Type"));
      if (t && t.toString() === "/Font") {
        const baseFont = obj.get(PDFName.of("BaseFont"));
        if (baseFont) {
          // toString() yields e.g. "/CAAAAA+WenQuanYiZenHei".
          let name = baseFont.toString().replace(/^\//, "");
          name = name.replace(/^[A-Z]{6}\+/, "");
          found.add(name);
        }
      }
    }
  });
  return [...found].sort();
}

export interface BaselineFile {
  en: number;
  ko: number;
  [key: string]: unknown;
}

export function loadBaseline(): BaselineFile {
  const p = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "baseline.json",
  );
  return JSON.parse(fs.readFileSync(p, "utf8")) as BaselineFile;
}
