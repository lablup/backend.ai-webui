# HelpDocumentModal Sidebar TOC and Prev/Next Navigation Dev Plan

## Spec Reference
`.specs/help-modal-navigation/spec.md`

## Base Branch
`03-05-feat_fr-2212_add_in-app_help_documentation_modal` (PR #5745)

## Sub-tasks (Implementation Order)

### 1. Parse book.config.yaml and create useDocNavigation hook
- **Changed files**: `react/src/hooks/useDocNavigation.ts` (new)
- **Dependencies**: None
- **Expected PR size**: S (~60 lines)
- **Description**: Create a custom hook that fetches and parses `book.config.yaml` at runtime. The YAML file is served as a static asset from `/packages/backend.ai-webui-docs/src/book.config.yaml` (same pattern as the markdown files). Since the React app has no YAML parser dependency, parse it with a lightweight approach: fetch the file as text and parse the navigation structure using a simple line-by-line parser (the YAML structure is flat and predictable), or add `js-yaml` as a dependency to `react/package.json`. The hook accepts `docLang` and `currentDocPath` and returns:
  - `navItems: Array<{ title: string; path: string }>` -- ordered list for the current language
  - `currentIndex: number` -- index of the current document (-1 if not found)
  - `prevItem: { title: string; path: string } | null`
  - `nextItem: { title: string; path: string } | null`
  - `loading: boolean`

  This centralizes all navigation data logic so both the TOC sidebar and prev/next bar consume the same source of truth.

  **Covers**: R1 (data source), R2 (localized titles), R8/R9 (boundary detection), R13 (initial doc from route)

### 2. Refactor HelpDocumentModal to support internal doc path state
- **Changed files**: `react/src/components/HelpDocumentModal.tsx`, `react/src/components/WEBUIHelpButton.tsx`
- **Dependencies**: Sub-task 1 (uses useDocNavigation hook)
- **Expected PR size**: M (~120 lines)
- **Description**: Currently `HelpDocumentModal` receives `docPath` as a prop and has no internal navigation state. Refactor it so that:
  1. The initial `docPath` prop sets the starting document (preserving AC12).
  2. An internal `activeDocPath` state tracks which document is currently displayed.
  3. When `activeDocPath` changes, fetch the new markdown and scroll content to top (R11).
  4. The `externalDocURL` updates dynamically based on `activeDocPath` (AC10). Pass the `externalDocMatchingTable` lookup into the modal or provide a callback so the modal can resolve external URLs. The external docs site is built separately, so URL paths cannot be mechanically derived from markdown paths.
  5. Anchor handling (`#section-id`) still works for the initial open (AC13).
  6. Extract the markdown fetch logic into a reusable function that can be called with any path.

  **Covers**: R4 (click loads document), R11 (scroll to top), R13 (initial route-based), AC10 (external link updates), AC12 (route-based initial), AC13 (anchor links)

### 3. Add TOC sidebar panel to HelpDocumentModal
- **Changed files**: `react/src/components/HelpDocumentModal.tsx`
- **Dependencies**: Sub-task 2 (requires internal doc path state and useDocNavigation)
- **Expected PR size**: M (~180 lines)
- **Description**: Add a left sidebar panel to the modal body that displays the full navigation list from `useDocNavigation`. Implementation details:
  - Layout: The modal body becomes a horizontal flex container with two children -- the TOC sidebar (fixed width, ~220px) and the document content area (flex: 1).
  - Each TOC item is a clickable element showing the localized title.
  - The active document is visually highlighted (e.g., `colorPrimary` background tint, bold text, left border indicator).
  - Clicking a TOC item updates `activeDocPath`, which triggers document fetch and content scroll-to-top.
  - The TOC sidebar scrolls independently if content overflows (its own `overflow-y: auto`).
  - When navigating (via TOC click or prev/next in sub-task 4), auto-scroll the TOC to keep the active item visible using `scrollIntoView`.
  - Style using `createStyles` with antd tokens, consistent with existing `docsBody` styles.
  - The sidebar is always visible in this sub-task; responsive collapse is handled in sub-task 5.

  **Covers**: R1 (sidebar TOC), R2 (localized titles), R3 (highlight current), R4 (click to navigate), R5 (visible by default), R12 (auto-scroll TOC), AC1-AC4, AC11, AC14

### 4. Add prev/next navigation bar at bottom of content
- **Changed files**: `react/src/components/HelpDocumentModal.tsx`
- **Dependencies**: Sub-task 2 (requires internal doc path state and useDocNavigation)
- **Expected PR size**: S (~80 lines)
- **Description**: Add a navigation bar at the bottom of the document content area (below the markdown, inside the scrollable content or as a sticky footer of the content panel). The bar contains:
  - Left side: "< {Previous Title}" button (hidden when on first document, R8)
  - Right side: "{Next Title} >" button (hidden when on last document, R9)
  - Use `Button` with `type="text"` or a styled clickable div. Include `LeftOutlined` / `RightOutlined` icons.
  - Clicking either button updates `activeDocPath` and scrolls content to top.
  - The bar sits at the bottom of the content area with a top border separator.
  - When navigating via prev/next, the TOC highlight updates automatically (since both consume `activeDocPath` state) and the TOC auto-scrolls (AC6).

  **Covers**: R7 (prev/next bar), R8 (hide prev on first), R9 (hide next on last), R10 (show target title), R11 (scroll to top), AC5-AC7

### 5. Add responsive TOC sidebar collapse/expand
- **Changed files**: `react/src/components/HelpDocumentModal.tsx`
- **Dependencies**: Sub-task 3 (requires TOC sidebar to exist)
- **Expected PR size**: S (~80 lines)
- **Description**: Make the TOC sidebar responsive:
  - Track the modal's rendered width (or use the BAIModal's `windowState` if available, or a `ResizeObserver` on the modal body container).
  - When the modal width is below a breakpoint (~768px or when `windowState === 'default'` and viewport is narrow), collapse the sidebar by default.
  - Add a toggle button (hamburger/menu icon, e.g., `MenuOutlined` / `MenuFoldOutlined` / `MenuUnfoldOutlined` from `@ant-design/icons`) positioned at the top-left of the content area or in the TOC header area.
  - Sidebar state: `expanded` / `collapsed`. Use a `useState` with initial value based on width.
  - When collapsed, the sidebar has `display: none` or `width: 0` with overflow hidden.
  - Nice-to-have R17 (animation): Add CSS transition on the sidebar width for smooth collapse/expand.
  - Nice-to-have R16 (session persistence): Use `useState` without persistence for now; can add `sessionStorage` later if desired.

  **Covers**: R5 (expanded by default on desktop), R6 (hidden on narrow, toggleable), AC8 (narrow = hidden), AC9 (toggle button), R16 (partial), R17 (partial)

## PR Stack Strategy

All sub-tasks stack sequentially on the base branch:

```
03-05-feat_fr-2212_add_in-app_help_documentation_modal (base, PR #5745)
  |
  +-- 1. useDocNavigation hook
       |
       +-- 2. Internal doc path state refactor
            |
            +-- 3. TOC sidebar panel
            |    |
            |    +-- 5. Responsive collapse/expand
            |
            +-- 4. Prev/next navigation bar
```

Sub-tasks 3 and 4 both depend on sub-task 2 but are independent of each other (parallel OK). Sub-task 5 depends on sub-task 3.

Recommended linear stack order for PRs: 1 -> 2 -> 3 -> 4 -> 5

## Dependency Graph

```
[1] useDocNavigation hook
 |
 v
[2] Internal doc path state refactor
 |
 +--------+--------+
 |                  |
 v                  v
[3] TOC sidebar    [4] Prev/next bar
 |
 v
[5] Responsive collapse
```

## Implementation Notes

### YAML Parsing Strategy
The React app currently has no YAML parser. Two options:
1. **Add `js-yaml`** (~7KB gzipped) to `react/package.json` -- simple, robust, standard approach.
2. **Convert `book.config.yaml` to JSON** at build time -- zero runtime cost, but requires a build script change.
3. **Simple custom parser** -- the YAML structure is flat (no nesting beyond language keys), so a regex-based parser could work, but is fragile.

Recommendation: Option 1 (`js-yaml`) is the most pragmatic. The navigation data is small and fetched once.

### External URL Computation
When navigating to a new document via TOC or prev/next, the external docs URL needs updating. The external docs site is built separately with its own build pipeline, so URL structures and anchors may not map 1:1 from markdown paths. Maintain the existing `externalDocMatchingTable` in `WEBUIHelpButton.tsx` for route-based initial URLs. For in-modal navigation via TOC/prev-next, either pass the lookup table into the modal or fall back to the base external docs URL (without a specific page path) when an exact mapping is unavailable.

### Anchor Handling
The `docPathMatchingTable` maps some routes to paths with anchors (e.g., `admin_menu/admin_menu.md#section-id`). When the modal opens with such a path:
- The `activeDocPath` should be set to the full path including anchor.
- The TOC highlight should match the base file path (without anchor).
- The `useDocNavigation` hook should strip anchors when comparing paths for `currentIndex`.

### Window Controls Compatibility (AC14)
The TOC sidebar layout must work correctly across all BAIModal window states (default, maximized, fullscreen, minimized). Since the sidebar is inside the modal body, and BAIModal already handles body sizing per window state, the flex layout should adapt naturally. The minimized state hides the body entirely, so no special handling is needed.
