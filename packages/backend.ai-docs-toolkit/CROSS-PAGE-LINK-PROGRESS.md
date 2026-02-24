# Cross-Page Link Resolution - Progress Tracker

## Overall Status: COMPLETE

## Steps

| # | Step | Status | Notes |
|---|------|--------|-------|
| 1 | Add types (`AnchorEntry`, `AnchorRegistry`, `LinkDiagnostic`) | ✅ Done | Lines 38-61 |
| 2 | Implement `buildAnchorRegistryFromRendered()` | ✅ Done | 2-pass architecture: builds from rendered HTML for accurate IDs |
| 3 | Implement `detectDuplicateAnchors()` | ✅ Done | Detects cross-file explicit anchor duplicates |
| 4 | Implement `rewriteCrossPageLinks()` | ✅ Done | Supports single-page + multi-page (via flag) |
| 5 | Implement `reportLinkDiagnostics()` | ✅ Done | Grouped console output by type |
| 6 | Integrate into `processMarkdownFilesForWeb()` | ✅ Done | 2-pass: render all → build registry → rewrite links |
| 7 | Export types in `src/index.ts` | ✅ Done | |
| 8 | Build & test | ✅ Done | 28 chapters, 5/5 cross-page links verified, 0 broken links |

## Log

- **2026-02-24 start**: Plan created, implementation starting in worktree
- **2026-02-24**: Initial implementation with pre-render scan → heading ID mismatch (& → &amp; in slugify)
- **2026-02-24**: Refactored to 2-pass architecture: render first, build registry from rendered HTML
- **2026-02-24**: All tests pass, build succeeds, no false-positive broken link warnings

## Architecture Decision: 2-Pass vs Pre-Scan

Initially tried pre-scanning raw markdown for headings, but Marked converts `&` → `&amp;` before passing to
the heading renderer, causing `slugify()` to produce different IDs than the actual rendered HTML.

**Solution**: Render all chapters first (Pass 1), then build the anchor registry from the rendered
headings array and HTML (which have accurate IDs), then rewrite links (Pass 2).
