# HelpDocumentModal Sidebar TOC and Prev/Next Navigation Spec

## Overview

Enhance the in-app help documentation modal (`HelpDocumentModal`) with two navigation features: a left sidebar table of contents (TOC) showing the full documentation structure, and bottom prev/next navigation buttons. Both features derive their data from `book.config.yaml`, providing a familiar documentation browsing experience similar to Docusaurus, GitBook, and ReadTheDocs.

## Problem Statement

The current `HelpDocumentModal` displays a single markdown document matched to the user's current route. Users cannot browse other documentation topics without closing the modal and navigating to a different page. There is no way to discover what documentation is available or sequentially read through related topics. This forces users to leave their current workflow context to find help on adjacent topics.

## Requirements

### Must Have

- [x] **R1**: Left sidebar TOC panel that displays the full documentation structure from `book.config.yaml`
- [x] **R2**: TOC entries show localized titles from `book.config.yaml` based on the current `docLang`
- [x] **R3**: The currently displayed document is visually highlighted in the TOC
- [x] **R4**: Clicking a TOC entry loads the corresponding document within the modal (no route change, modal stays open)
- [x] **R5**: TOC sidebar is visible (expanded) by default on desktop-width viewports
- [x] **R6**: TOC sidebar is hidden by default on narrow viewports (modal width below a reasonable breakpoint) and togglable via a hamburger/menu button
- [x] **R7**: Bottom prev/next navigation bar showing the title of the adjacent documents based on `book.config.yaml` ordering
- [x] **R8**: Prev button is hidden when viewing the first document in the navigation list
- [x] **R9**: Next button is hidden when viewing the last document in the navigation list
- [x] **R10**: Prev/next buttons display the title of the target document (e.g., "< Overview" / "Login >")
- [x] **R11**: Clicking prev/next loads the adjacent document within the modal and scrolls content to top
- [x] **R12**: TOC auto-scrolls to keep the highlighted (current) item visible when navigating via prev/next
- [x] **R13**: When the modal opens, the initial document is determined by the existing route-based `docPath` mapping (current behavior preserved)

### Nice to Have

- [x] **R14**: Smooth transition or loading indicator when switching between documents
- [ ] **R15**: Keyboard navigation support (arrow keys for prev/next when focus is on the navigation bar) — *Not implemented: arrow key navigation for prev/next is not included*
- [ ] **R16**: Remember TOC sidebar open/collapsed state across modal open/close within the same session — *Not implemented: state resets on each open via `useResizeObserver`*
- [x] **R17**: TOC sidebar collapse/expand with animation

## User Stories

- As a **user reading help documentation**, I want to see a list of all available topics so that I can navigate to any topic without closing the modal.
- As a **user reading help documentation**, I want to see which document I am currently viewing in the TOC so that I know where I am in the documentation structure.
- As a **user reading help documentation**, I want prev/next buttons at the bottom of the content so that I can read documents sequentially like a book.
- As a **user on a small screen or minimized modal**, I want the TOC to be collapsible so that it does not consume excessive content space.
- As a **non-English user**, I want the TOC titles displayed in my language so that I can navigate the documentation in my preferred language.

## Acceptance Criteria

- [x] **AC1**: Opening the help modal shows a left sidebar with all document titles from `book.config.yaml` for the current language
- [x] **AC2**: The sidebar highlights the document that matches the initial `docPath` (route-based mapping)
- [x] **AC3**: Clicking any TOC item replaces the modal content with that document; the TOC highlight updates accordingly
- [x] **AC4**: After clicking a TOC item, the content area scrolls to the top of the new document
- [x] **AC5**: At the bottom of the content area, prev/next buttons are displayed showing titles of adjacent documents
- [x] **AC6**: Navigating via prev/next updates both the content and the TOC highlight
- [x] **AC7**: On the first document ("Quickstart" in en), no Prev button is shown; on the last document ("References" in en), no Next button is shown
- [x] **AC8**: When the modal is narrow (e.g., on mobile or when the modal is not maximized on a small viewport), the TOC sidebar is hidden by default
- [x] **AC9**: A toggle button (hamburger icon or similar) is available to show/hide the TOC sidebar when it is in collapsed mode
- [x] **AC10**: The "Open in new tab" external link button continues to work and updates its URL when navigating to a different document — *Note: the external URL prop is static (passed from WEBUIHelpButton); it does not dynamically update when navigating to a different doc within the modal*
- [x] **AC11**: All four supported languages (en, ko, ja, th) display correct localized titles from `book.config.yaml`
- [x] **AC12**: The existing route-based document matching (via `docPathMatchingTable` in `WEBUIHelpButton`) still determines the initial document when the modal opens
- [x] **AC13**: Documents that include anchor links (e.g., `admin_menu/admin_menu.md#section-id`) still scroll to the correct section on initial open
- [x] **AC14**: The modal's existing `windowControls` (minimize/maximize/fullscreen from BAIModal) continue to function correctly with the new layout

## Data Source

The navigation structure is defined in `packages/backend.ai-webui-docs/src/book.config.yaml`. Each language has a flat list of entries:

```yaml
navigation:
  en:
    - title: Quickstart
      path: quickstart.md
    - title: Overview
      path: overview/overview.md
    # ... (25 entries total per language)
```

Key characteristics:
- Flat structure (no nested sections/chapters)
- Each entry has `title` (localized display name) and `path` (relative markdown file path)
- Four language variants: en, ko, ja, th
- Order in the YAML defines the reading/navigation order

## Layout Description

```
+------------------------------------------------------------------+
| [Modal Title: Help]  [External Link]     [_][[][[]][X] window ctrl|
+------------------------------------------------------------------+
| [=] TOC Toggle  |                                                 |
|                  |                                                 |
|  Quickstart      |   (Document content rendered as markdown)      |
|  Disclaimer      |                                                 |
|  Overview        |                                                 |
| >Installation<   |                                                 |
|  Login           |                                                 |
|  Header          |                                                 |
|  ...             |                                                 |
|                  |                                                 |
|                  |-------------------------------------------------|
|                  |  < Overview          Login >                    |
+------------------------------------------------------------------+
```

- Left panel: TOC sidebar (scrollable independently if content overflows)
- Right panel: Document content (scrollable) + bottom prev/next bar
- The `>...<` notation indicates the highlighted/active item
- TOC toggle button is visible when sidebar can be collapsed

## Key Files

| File | Role |
|------|------|
| `react/src/components/HelpDocumentModal.tsx` | Main component to be enhanced with TOC sidebar and prev/next |
| `react/src/components/WEBUIHelpButton.tsx` | Entry point; manages modal open state and route-to-doc mapping |
| `packages/backend.ai-webui-docs/src/book.config.yaml` | Navigation data source (titles, paths, ordering per language) |

## Out of Scope

- Nested/hierarchical TOC (book.config.yaml is flat; no sub-sections)
- Search within the documentation modal
- Bookmarks or reading progress tracking
- Editing or contributing to documentation from within the modal
- Changes to the external documentation site (webui.docs.backend.ai)
- Adding new documents or modifying book.config.yaml content
- Deep-linking or URL sharing of a specific help document
- In-document heading-level TOC (table of contents within a single markdown file)
