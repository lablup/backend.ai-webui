import { test } from "node:test";
import assert from "node:assert/strict";

import { collectBaseFonts, loadPdf } from "./_helpers.js";

// Patterns are intentionally loose: the toolkit may swap the specific
// Latin font (Helvetica vs Liberation) or the specific CJK fallback
// without the test caring — what matters is that *some* font of each
// family is embedded so the corresponding script renders.

const LATIN_PATTERN = /(Helvetica|Liberation|NotoSans(?:CJK)?|Arial)/i;
const CJK_PATTERN = /(NotoSansCJK|WenQuanYi|NotoSansKR|NanumGothic|NotoSansJP)/i;

test("PDF[en] — embeds at least one Latin-capable font", async () => {
  const doc = await loadPdf("en");
  const fonts = collectBaseFonts(doc);
  assert.ok(fonts.length > 0, `expected at least one embedded font, got none`);
  assert.ok(
    fonts.some((f) => LATIN_PATTERN.test(f)),
    `no Latin font matched ${LATIN_PATTERN} in: ${fonts.join(", ")}`,
  );
});

test("PDF[ko] — embeds at least one CJK-capable font (FR-2745)", async () => {
  const doc = await loadPdf("ko");
  const fonts = collectBaseFonts(doc);
  assert.ok(fonts.length > 0, `expected at least one embedded font, got none`);
  assert.ok(
    fonts.some((f) => CJK_PATTERN.test(f)),
    `no CJK font matched ${CJK_PATTERN} in: ${fonts.join(", ")}. ` +
      `If toolkit font selection changed, update CJK_PATTERN.`,
  );
});

test("PDF[en] — does NOT crash even if a CJK fallback got embedded too", async () => {
  // Some Chromium/font configs cause CJK fonts to be embedded as fallback
  // even on an English-only PDF. That is documented as acceptable —
  // the test simply confirms the load+enumeration succeeds.
  const doc = await loadPdf("en");
  const fonts = collectBaseFonts(doc);
  assert.ok(Array.isArray(fonts));
});
