# AGENTS.md

Project-specific guidance for AI coding agents.

<!-- UI-COMMON:START -->
@lablup/ui-common v0.2.0-alpha.20.canary-20261023160327-a60e44171 · Astryx v0.7.3 · 173 components
CLI: run every command as `pnpm exec ui-common <cmd>` (shown below as `ui-common ...`).

SETUP (once, first in your entry stylesheet) — without these, components render unstyled:
  @layer reset, theme, base, astryx-base, astryx-theme, ui-common, components, utilities;
  @import "@lablup/ui-common/reset.css";
  @import "@lablup/ui-common/astryx.css";
  @import "@lablup/ui-common/theme/lablup/theme.css";
  @import "@lablup/ui-common/ui-common.css";

WORKFLOW — start every page from a template, never from scratch:
1. `ui-common build "<idea>"` — names the template to scaffold from and the parts it lacks.
2. `ui-common template <name> <path>` — scaffold it; keep its frame, gap and padding; replace the content.
3. `ui-common template <Block>` for parts it lacks; `ui-common component <Name>` to read props before using one.
Changing an existing page? Keep it: skip step 2 and add blocks/components inside its sections.

RULES:
- No <div> — components handle all layout and spacing.
- Read `ui-common docs layout` before changing a template's frame.
- Dense data = rows (Table, List/Item), not Card-wrapped lists. Badge = counts only.
- Style with component props first, then the xstyle prop / StyleX tokens. No raw hex/px.
- Palettes and custom colors go through the theme, never :root overrides. Run `ui-common theme add <slug>` to import; `theme eject <slug>` only forks source. See `ui-common docs theme`.
- SELF-CHECK: re-read the file; replace any className=, style={{…}}, raw <div>/<span>, imported .css/@apply, or hardcoded #hex/px with the component or the xstyle prop + a token.

`ui-common help` lists every command. Key ones beyond the workflow:
  search "<query>"   find any component / hook / doc / template
  discover <words>   integrations you could add
  docs <topic>       getting-started, principles, tokens, theme … (`ui-common docs` lists all)
  docs cli           commands and API reference
  docs authoring     build an integration package, and every field it holds
  upgrade --from <old version> --apply   run after a dependency bump

UI-COMMON (@lablup/ui-common v0.2.0-alpha.20.canary-20261023160327-a60e44171 wraps Astryx v0.7.3):
- Import only from @lablup/ui-common: the root, or the same subpath Astryx uses (@lablup/ui-common/Button, /theme/tokens.stylex, /lab). Never import @astryxdesign/* directly.
- Layers: declare `@layer reset, theme, base, astryx-base, astryx-theme, ui-common, components, utilities;` once, first, in the entry stylesheet. ui-common's styles sit in `ui-common`; yours go in `components` / `utilities`.
- Use AlertModal (@lablup/ui-common/AlertModal), not AlertDialog: ui-common hides AlertDialog.
- Use Modal (@lablup/ui-common/Modal), not Dialog: ui-common hides Dialog.
- CommandPalette (@lablup/ui-common/CommandPalette) comes from ui-common: Astryx's, wrapped, same API and import path. The palette sits at a fixed offset from the top of the viewport instead of centred, so its input stays put while the result list shrinks or grows. The API is Astryx's.
- ComplexSelector (@lablup/ui-common/ComplexSelector) comes from ui-common: its own copy of Astryx's, same API and import path. Adds hasClear and onClear, a clear button as Selector has (facebook/astryx#6362).
- Drawer (@lablup/ui-common/Drawer) comes from ui-common: its own copy of Astryx's, same API and import path. A scrimless drawer stays out of the top layer (show() and a z-index), so ui-common's Modal and notification stack paint above it; a Modal inside a scrimmed drawer opens above it; aria-modal passes through. DrawerHeader is Astryx's, re-exported unchanged.
- Popover (@lablup/ui-common/Popover) comes from ui-common: Astryx's, wrapped, same API and import path. Its content is not part of the Form.Item it opens from, as antd's: a control inside takes none of the item's status or label. The API is Astryx's.
- Tour (@lablup/ui-common/lab) comes from ui-common: its own copy of Astryx's, same API and import path. A step's highlight is promoted into the top layer once, so under StrictMode the spotlight dim no longer covers the callout.
- Form controls (CheckboxInput, CheckboxList, DateInput, DateRangeInput, DateTimeInput, FileInput, MultiSelector, NumberInput, RadioList, SegmentedControl, Selector, Slider, Switch, TextArea, TextInput, TimeInput, Tokenizer, Typeahead) are ui-common's Form.Item wrappers at Astryx's import paths: no label, description, isRequired or status message props. Use them inside Form.Item, which owns label, extra, rules and help; `status` is "error" | "warning" for the border only.
- Theme: <Theme theme={lablupTheme}> with lablupTheme from @lablup/ui-common/theme/lablup/built, plus @lablup/ui-common/theme/lablup/theme.css. A product palette is its own defineTheme over lablupTheme.
- Strings: every built-in string is a prop; defaults come from ui-common's catalog. Pass uiCommonMessages from @lablup/ui-common/i18n-catalog to Astryx's InternationalizationProvider. Never a product i18n runtime.
- ui-common's own components: AlertModal, Board, BoardItemTitle, BooleanToken, BulkEditFormItem, BulkErrorModal, ColorPicker, ConfirmPopover, CountBadge, CountdownBorder, DataGrid, DeleteConfirmModal, DigitPopIn, DividedRow, DoubleBadge, DoubleToken, ErrorState, Form, IconWithTooltip, ImageWithFallback, ListBanner, Modal, NotificationItem, NotificationStack, OverlayScrollbar, PageHeader, PageLayout, PagedSelector, ProgressWithLabel, SelectionLabel, SkeletonCard, SkeletonChart, SkeletonRow, SkeletonText, SmoothHeight, StatCard, Statistic, StepNumberInput, TagsInput, TextHighlighter, TokenList, TokenRow, UncontrolledInput, UnitGrid. `pnpm exec ui-common docs ui-common` explains them.
- Templates are ui-common's own: create-modal, dashboard-board, detail-drawer, info-modal, list-page, list-toolbar, settings-page, tabbed-page. They import only @lablup/ui-common, react and lucide-react. Astryx's templates are not offered (they import @astryxdesign/* directly).
- The `ui-common` bin is @lablup/ui-common-cli, a devDependency pinned to the same version as @lablup/ui-common; bump both together. Without it installed, `pnpm dlx @lablup/ui-common-cli@next <cmd>` (or `npx @lablup/ui-common-cli@next <cmd>`); drop `@next` once 0.2.0 is published.
- After bumping @lablup/ui-common and @lablup/ui-common-cli: `pnpm exec ui-common upgrade --from <old version>`, then read ui-common-upgrade-report.md.
<!-- UI-COMMON:END -->
PROJECT LINES (this repo; outside the generated markers so `ui-common agents --write` keeps them, and they win where they disagree with the block):
- SETUP (this repo): `react/src/index.css` declares the layer order and imports only `reset.css` and `astryx.css`. The theme is webui's own Backend.AI theme family (`react/src/astryx-theme/`, a `defineTheme` over `neutralTheme`), not `lablupTheme` and not `theme/lablup/theme.css`. `ui-common.css` is not imported either: it holds only global scrollbar rules, and each ui-common component imports its own CSS.
- CLI (this repo): the `ui-common` bin comes from `@lablup/ui-common-cli`, a `react/` devDependency pinned in the catalog next to `@lablup/ui-common`, so `pnpm exec ui-common <cmd>` works inside `react/`. From the repository root run `pnpm run ui-common <cmd>` (root `package.json` proxies it into `react/`); from `packages/backend.ai-ui/`, `pnpm -w run ui-common <cmd>`. `ui-common astryx <cmd>` runs the Astryx CLI without rewriting its output.
- MIGRATION RELAXATION (antd → Astryx): the className=/style={{…}} part of the SELF-CHECK is relaxed for files carried over from the antd era, which are still full of `className` / inline `style` and `useTheme().token('--…')` reads (the former `theme.useToken()` reads; FR-3605 retired the theme-shim). Do not rewrite those wholesale — convert a file's idioms when you are already changing it for another reason. A style that props/xstyle cannot express goes in a co-located `.css` file the component imports (P17), with `var(--…)` Astryx tokens; never a runtime style engine. In a style position, prefer `'var(--…)'` over a `token()` read: `token()` is for values JS must compute with (numeric props, SVG attributes).
- STATUS SEMANTICS (this repo; overrides "Status = StatusDot/Token; Badge = counts only" above — ADR 0007): Badge = a value the system changes on its own over time (lifecycle/health status, in-progress markers, live tickers, counts). Token = a value that changes only when a user edits it, or a category/classification label (names, types, permissions, tags, versions, on/off settings, recorded outcomes). StatusDot stays for dot-only status. BUI chips are named *Badge / *Token by the primitive they render; "Tag" is only a domain noun. Rule: .claude/rules/badge-vs-token.md.
- BUI INTEGRATION (this repo): `backend.ai-ui` is registered as an Astryx integration, so `ui-common component`, `ui-common search` and `ui-common component --list` cover the `BAI*` wrappers next to ui-common's and core's components, and `ui-common docs backend-ai-ui` explains the layer. The component count in the block's first line is core's own, so the live catalog is larger; run the command to see it. When a `BAI*` component and a ui-common or core component both fit, use the `BAI*` one — it carries the project defaults, and it imports from `backend.ai-ui`. A new `BAI*` component ships a same-stem `{Name}.doc.ts` beside its source; a new product-neutral component goes to ui-common instead (.claude/rules/bui-component-home.md).

## Migration conversion idioms (branch `to-astryx`)

Some antd patterns have no one-to-one Astryx component and are **not** allowed
to be dropped ad hoc — they have a standing composition recipe in
`.specs/FR-3482-astryx-migration/CONVERSION-IDIOMS.md`. Read it before recording a
PILOT-DECISION that gives up a layout capability. Currently:

- **antd vertical tabs** (`tabPosition`/`tabPlacement="left" | "start"`) →
  the Astryx `settings-sidebar` template composition
  (`Layout` + `LayoutPanel` nav column of `List`/`ListItem isSelected` +
  `LayoutContent` pane), **not** a horizontal `TabList`. Run
  `pnpm exec ui-common template settings-sidebar`. The "discover, don't guess"
  workflow above includes `ui-common template --list` / `ui-common search` — a
  component-level lookup alone will wrongly report the capability as missing.
