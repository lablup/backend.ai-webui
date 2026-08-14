/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

const normalize = (s: string) => s.normalize('NFC').toLowerCase().trim();

// Compactness of q as a subsequence of t: the character span consumed beyond
// q's own length. null when q is not a subsequence of t.
const subsequenceSpread = (q: string, t: string): number | null => {
  let from = 0;
  let first = -1;
  let last = -1;
  for (const ch of q) {
    const idx = t.indexOf(ch, from);
    if (idx < 0) return null;
    if (first < 0) first = idx;
    last = idx;
    from = idx + 1;
  }
  return last - first + 1 - q.length;
};

/**
 * Rank a palette entry against a query. 0 = no match; higher = better.
 * Matches the current-locale label and English keyword aliases (FR-3549:
 * dual-language indexing; chosung matching deliberately deferred).
 */
export const spotlightMatchScore = (
  query: string,
  label: string,
  keywords: ReadonlyArray<string> = [],
): number => {
  const q = normalize(query);
  if (!q) return 1;
  const targets = [normalize(label), ...keywords.map(normalize)];
  let best = 0;
  targets.forEach((t, i) => {
    let score = 0;
    if (t === q) {
      score = 100;
    } else if (t.startsWith(q)) {
      score = 90;
    } else {
      const idx = t.indexOf(q);
      if (idx >= 0) {
        score = 70 - Math.min(idx, 20);
      } else {
        const spread = subsequenceSpread(q, t);
        if (spread !== null) {
          score = 40 - Math.min(spread, 20);
        }
      }
    }
    // Keyword hits rank below equivalent label hits.
    if (score > 0 && i > 0) score -= 5;
    best = Math.max(best, score);
  });
  if (best === 0 && q.includes(' ')) {
    const tokens = q.split(/\s+/);
    if (tokens.every((tok) => targets.some((t) => t.includes(tok)))) {
      best = 35;
    }
  }
  return best;
};
