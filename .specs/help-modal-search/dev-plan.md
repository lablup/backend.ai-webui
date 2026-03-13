# HelpDocumentModal Search and Highlight Dev Plan

## Spec Reference
`.specs/help-modal-search/spec.md`

## Parent Issue
[#6001](https://github.com/lablup/backend.ai-webui/issues/6001) — Add search and highlight support to HelpDocumentModal

## Sub-tasks (Implementation Order)

### 1. useDocSearch hook — #6002
- **Changed files**: `react/src/hooks/useDocSearch.ts` (new), `react/src/hooks/useDocNavigation.ts` (minor refactor to share YAML parsing)
- **Dependencies**: None
- **Expected PR size**: M (~150-200 lines)
- **Description**: Core search logic — fetch all markdown docs for the current language, cache content, provide case-insensitive substring search with per-document match counts and positions. Includes 300ms debounce. Extracts shared YAML parsing utility from `useDocNavigation.ts`.

### 2. TOC sidebar search input + match count badges — #6003
- **Changed files**: `react/src/components/HelpDocumentModal.tsx`
- **Dependencies**: Sub-task 1 (#6002 blocks #6003)
- **Expected PR size**: M (~150-200 lines)
- **Description**: Add `<Input>` at top of TOC sidebar, integrate `useDocSearch`, display `(N)` match count badges on TOC items, dim non-matching items during active search, restore TOC on clear.

### 3. Content text highlighting — #6004
- **Changed files**: `react/src/components/HelpDocumentModal.tsx`
- **Dependencies**: Sub-task 1 (#6002 blocks #6004), Sub-task 2 (#6003 blocks #6004)
- **Expected PR size**: M (~200-250 lines)
- **Description**: After markdown renders, use DOM TreeWalker to find text nodes containing the search term, split and wrap matches in `<mark>` elements with `data-match-index` attributes. Add CSS styles for highlight (yellow) and active highlight (orange). Re-apply on document change during active search.

### 4. Match navigation bar — #6005
- **Changed files**: `react/src/components/HelpDocumentModal.tsx`
- **Dependencies**: Sub-task 3 (#6004 blocks #6005)
- **Expected PR size**: S (~100-150 lines)
- **Description**: Add "N of M matches" indicator with up/down arrow buttons. Track `activeMatchIndex` state, scroll corresponding `<mark>` into view, swap active highlight CSS class. Show "No results" when query has no matches. Reset on document navigation.

### 5. Floating search bar with Ctrl+F/Cmd+F — #6006
- **Changed files**: `react/src/components/HelpDocumentModal.tsx`
- **Dependencies**: Sub-task 2 (#6003 blocks #6006)
- **Expected PR size**: M (~150-200 lines)
- **Description**: Register `keydown` listener for Ctrl+F/Cmd+F on modal container, `preventDefault` to suppress browser find. Show floating bar with search input + navigation controls. Synchronize with TOC sidebar search input (shared state). Auto-focus on open. Escape to close. Support Enter/F3 and Shift+Enter/Shift+F3 for match navigation.

### 6. i18n translations — #6007
- **Changed files**: `resources/i18n/*.json` (all 22 language files)
- **Dependencies**: Sub-task 2 (#6003 blocks #6007)
- **Expected PR size**: S (~50-80 lines across many files)
- **Description**: Add translation keys for search placeholder, match counter, "No results", navigation tooltips, and clear button text. Keys: `webui.menu.SearchDocs`, `webui.menu.MatchCount`, `webui.menu.NoSearchResults`, etc.

## PR Stack Strategy

Sequential stack (each PR builds on the previous):
```
main
  -> feat/help-search-hook          (Sub-task 1: #6002)
    -> feat/help-search-toc         (Sub-task 2: #6003)
      -> feat/help-search-highlight (Sub-task 3: #6004)
        -> feat/help-search-nav     (Sub-task 4: #6005)
      -> feat/help-search-floating  (Sub-task 5: #6006, parallel with 3-4)
    -> i18n/help-search-keys        (Sub-task 6: #6007, parallel with 3-5)
```

Parallelism opportunities:
- Sub-tasks 3+4 (highlight + navigation) and Sub-task 5 (floating bar) can run in parallel after Sub-task 2
- Sub-task 6 (i18n) can run in parallel after Sub-task 2
- In practice, sequential execution is simpler since all modify the same file

## Dependency Graph

```
#6002 (useDocSearch hook)
  |
  v
#6003 (TOC search + badges)
  |
  +-------+-------+
  |       |       |
  v       v       v
#6004   #6006   #6007
(highlight) (floating) (i18n)
  |
  v
#6005
(match nav)
```

## Waves for batch-implement

- **Wave 1**: #6002 (useDocSearch hook)
- **Wave 2**: #6003 (TOC search input + badges)
- **Wave 3**: #6004, #6006, #6007 (highlight, floating bar, i18n — parallel)
- **Wave 4**: #6005 (match navigation bar)

## Risks and Notes

- **DOM manipulation for highlighting**: Wrapping text in `<mark>` elements after react-markdown renders is the trickiest part. Must handle edge cases: matches spanning across markdown inline elements, matches inside code blocks (should skip), and re-rendering when React updates the DOM. Consider using `useEffect` with a dependency on `markdown` content.
- **Browser find override**: `preventDefault` on Ctrl+F only works when the modal has focus. If focus is outside the modal, the browser's native find will still trigger. This is acceptable per the spec ("while the modal is focused").
- **Performance**: ~25 docs, ~5400 lines total. Client-side search will be fast. No concerns here.
- **Shared file risk**: Sub-tasks 2-5 all modify `HelpDocumentModal.tsx`. Sequential execution within the stack is strongly recommended to avoid merge conflicts.
