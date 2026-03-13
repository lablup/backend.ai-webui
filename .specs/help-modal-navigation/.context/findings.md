# HelpDocumentModal Navigation Findings

## Decisions
| Date | Decision | Rationale | Issue |
|------|----------|-----------|-------|
| 2026-03-16 | Use js-yaml for YAML parsing | React app has no YAML parser; js-yaml is lightweight (~7KB gzip) and robust | - |
| 2026-03-16 | Compute external URL from doc path mechanically | Pattern is simple .md -> .html replacement; avoids duplicating the externalDocMatchingTable | - |
| 2026-03-16 | Strip anchors when matching TOC items | docPathMatchingTable uses anchors for sub-sections but TOC items are whole documents | - |

## Discoveries
- The React app currently has no YAML parsing dependency (js-yaml exists only in backend.ai-docs-toolkit)
- book.config.yaml has a flat structure (no nested sections) with 26 entries per language across 4 languages
- HelpDocumentModal receives docPath as a prop with no internal navigation state
- externalDocMatchingTable duplicates docPathMatchingTable with .html extensions -- can be computed

## Issues Encountered
| Date | Problem | Root Cause | Resolution | Issue |
|------|---------|-----------|------------|-------|
