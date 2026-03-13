# HelpDocumentModal Search and Highlight Spec

## Overview

Add full-text search capability to the HelpDocumentModal that searches across all documentation pages, highlights matched text in the content area, and provides match-by-match navigation. The search UI is accessible both from the TOC sidebar and via a keyboard shortcut.

## Problem Statement

The HelpDocumentModal currently supports TOC-based and prev/next navigation, but users have no way to find specific content by keyword. When a user needs to locate information about a particular topic (e.g., "quota", "SSH", "model serving endpoint"), they must manually browse through ~25 documents. A search feature would let users quickly find relevant content across the entire documentation set.

## Requirements

### Must Have

- [x] **R1**: A search input field at the top of the TOC sidebar that accepts free-text queries
- [x] **R2**: A floating search bar that appears when the user presses Ctrl+F (Windows/Linux) or Cmd+F (macOS) while the modal is focused
- [x] **R3**: Search queries are matched against the text content of all markdown documents listed in `book.config.yaml` for the current language
- [x] **R4**: Search is case-insensitive
- [x] **R5**: TOC sidebar items display a match count badge (e.g., "(3)") next to documents that contain matches
- [x] **R6**: TOC items with matches are visually distinguishable from those without (e.g., non-matching items are dimmed, or matching items are highlighted)
- [x] **R7**: Clicking a TOC item that has matches navigates to that document and scrolls to the first match
- [x] **R8**: In the currently displayed document, all occurrences of the search term are visually highlighted (e.g., yellow/amber background)
- [x] **R9**: A match navigation bar shows the current match position and total count (e.g., "3 of 12 matches") with up/down arrow buttons to jump between matches
- [x] **R10**: The match navigation bar applies to the current document's matches (not global across all documents)
- [x] **R11**: Navigating between matches scrolls the content area to bring the active match into view
- [x] **R12**: The currently active match is visually distinct from other highlighted matches (e.g., darker highlight or outline)
- [x] **R13**: Clearing the search input removes all highlights and restores the TOC to its normal state
- [x] **R14**: Search works correctly across all four supported languages (en, ko, ja, th)

### Nice to Have

- [x] **R15**: Debounced search input to avoid excessive re-rendering while typing (e.g., 300ms debounce)
- [ ] **R16**: Search results are sorted in the TOC by match count (most matches first), or the default TOC order is preserved with match counts as secondary info — *Implemented: default TOC order preserved with match counts as badges (not sorted by count)*
- [ ] **R17**: Show a snippet/preview of the matched text in the TOC or in a dropdown below the search input — *Not implemented*
- [x] **R18**: Persist the search query when navigating between documents so the user can continue exploring matches in other documents
- [x] **R19**: Keyboard shortcuts for match navigation (Enter or F3 for next match, Shift+Enter or Shift+F3 for previous match)
- [x] **R20**: Search input auto-focus when the floating search bar is triggered via keyboard shortcut

## User Stories

- As a **user looking for specific information**, I want to search across all help documents so that I can quickly find content about a topic without browsing each document individually.
- As a **user viewing search results**, I want to see which documents contain matches and how many so that I can prioritize which document to read.
- As a **user reading a document with search results**, I want matched text highlighted so that I can quickly spot the relevant sections.
- As a **user reading a document with multiple matches**, I want to jump between matches using navigation controls so that I can review each occurrence without manually scrolling.
- As a **keyboard-oriented user**, I want to trigger search with Ctrl+F/Cmd+F so that I can search without reaching for the mouse.

## Acceptance Criteria

- [x] **AC1**: A search input is visible at the top of the TOC sidebar when the sidebar is expanded
- [x] **AC2**: Pressing Ctrl+F (Windows/Linux) or Cmd+F (macOS) while the modal is open and focused opens a floating search bar (and does not trigger the browser's native find-in-page)
- [x] **AC3**: Typing a query (minimum 2 characters) triggers a search across all documents for the current language
- [x] **AC4**: TOC items with matching documents show a count badge (e.g., "(5)") indicating the number of text matches in that document
- [x] **AC5**: TOC items without matches appear visually dimmed or de-emphasized during an active search
- [x] **AC6**: Clicking a TOC item with matches loads that document and scrolls to the first highlighted match
- [x] **AC7**: All occurrences of the search term in the displayed document are highlighted with a visible background color
- [x] **AC8**: The currently focused match has a distinct visual style (e.g., darker/outlined) compared to other matches
- [x] **AC9**: A match navigation indicator shows "N of M" (e.g., "3 of 12") with up/down buttons
- [x] **AC10**: Clicking up/down in the match navigation scrolls to the previous/next match within the current document
- [x] **AC11**: When the user navigates to a different document (via TOC click) while a search is active, the highlights and match counter update for the new document's matches
- [x] **AC12**: Clearing the search input (or pressing Escape) removes all highlights, hides the match navigation bar, and restores the TOC to its default appearance
- [x] **AC13**: Search is case-insensitive (searching "session" matches "Session", "SESSION", "session")
- [x] **AC14**: Search works for non-Latin scripts (Korean, Japanese, Thai) in corresponding language docs
- [x] **AC15**: The floating search bar (Ctrl+F) and the TOC sidebar search input are synchronized -- typing in one updates the other
- [x] **AC16**: The search does not interfere with existing navigation features (prev/next buttons, TOC click navigation, anchor scrolling)
- [x] **AC17**: When no matches are found for a query, a "No results" message is displayed

## Layout Description

### TOC Sidebar with Search

```
+------------------------------------------------------------------+
| [Modal Title: Help]  [External Link]     [_][[][[]][X] window ctrl|
+------------------------------------------------------------------+
| [=] TOC Toggle  |  [Ctrl+F search bar - floating]   (if active)  |
|                  |  [ search query_____ ] [< 3/12 >] [X]         |
| [Search docs...] |------------------------------------------------|
|                  |                                                 |
|  Quickstart      |   (Document content with highlighted matches)  |
|  Disclaimer      |                                                 |
|  Overview   (2)  |   Lorem ipsum dolor sit amet, ===search===    |
| >Install<   (5)  |   term appears here. Another ===SEARCH===     |
|  Login            |   term in different case.                     |
|  Header      (1) |                                                |
|  ...             |                                                |
|                  |-------------------------------------------------|
|                  |  < Overview          Login >                    |
+------------------------------------------------------------------+
```

- `[Search docs...]`: Search input at the top of the TOC sidebar
- `(N)`: Match count badge next to documents with results
- `===search===`: Highlighted match in content (yellow background)
- The currently active match uses a stronger highlight (e.g., orange or outlined)
- Floating search bar appears below the title bar when triggered by Ctrl+F/Cmd+F
- `[< 3/12 >]`: Match navigation controls (prev/next arrows with position indicator)
- Dimmed TOC items have no matches

### Match Navigation Detail

```
+-------------------------------------------+
|  [ search query_____ ]  [^] 3/12 [v]  [X] |
+-------------------------------------------+
```

- Text input for the search query
- Up arrow (^): go to previous match
- Down arrow (v): go to next match
- "3/12": current match index / total matches in current document
- [X]: clear search

## Key Files

| File | Role |
|------|------|
| `react/src/components/HelpDocumentModal.tsx` | Main component to be enhanced with search UI and highlight logic |
| `react/src/hooks/useDocNavigation.ts` | Hook providing navigation data from `book.config.yaml` |
| `react/src/hooks/useDocSearch.ts` | Hook providing full-text search with debounced queries, document pre-fetching, and concurrency-limited indexing |
| `react/src/components/WEBUIHelpButton.tsx` | Entry point; manages modal open state |
| `packages/backend.ai-webui-docs/src/book.config.yaml` | Document list and paths per language |
| `packages/backend.ai-webui-docs/src/{lang}/**/*.md` | Markdown source files to be searched (~5400 lines across ~25 files for English) |

## Performance Considerations

- The total documentation corpus is approximately 5400 lines across ~25 files (English). This is small enough to fetch and search client-side without a backend search index.
- Documents should be fetched and cached when the modal opens (or lazily on first search) to avoid redundant network requests during repeated searches.
- Search execution against the cached corpus should feel instant for this data size.

## Out of Scope

- Server-side search index or backend search API
- Fuzzy/approximate matching (only exact substring matching is required)
- Search across multiple languages simultaneously (search operates on the currently selected language only)
- Regex or advanced query syntax (e.g., boolean operators, phrase matching)
- Search history or saved searches
- Indexing of image alt-text or metadata
- Changes to the documentation content or `book.config.yaml` structure

## Related Issues

- FR-2212: Sidebar TOC and prev/next navigation (the existing navigation feature this builds upon)
