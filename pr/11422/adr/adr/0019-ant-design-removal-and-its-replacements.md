# 0019 — Ant Design removal and its replacements

## Summary

> Unfamiliar terms are collected in the [Glossary](#glossary) at the end.

- **Removed packages**: `antd`, `antd-style`, `@ant-design/icons`, `ahooks`, and the `@lobehub/*` packages are not dependencies of `react/` or `packages/backend.ai-ui/` (BUI), directly or transitively. `pnpm-lock.yaml` resolves none of them, so an import of any of them fails module resolution in `tsc` and Vite.
- **One component system**: Astryx, reached through `@lablup/ui-common` as [ADR 0009](0009-ui-common-as-the-single-entry-point-to-astryx.md) defines, is the only component system.
- **Replacements**: Each removed package has one replacement in the repository: `lucide-react` and BUI's `BAI*Icon` files for icons, BUI's own hooks for the `ahooks` hooks, BUI's [app-shim](#glossary) for `App.useApp()`, co-located `.css` files for `antd-style`, and vendored brand icons for `@lobehub/*`.
- **No antd emulation**: A replacement keeps an antd call shape where that saves call-site edits, but it does not reproduce antd engine behavior. `BAITable` passes a column's `render` `(value, record, index)`, with `value === undefined` for a column without `dataIndex`, not the record that [rc-table](#glossary) passed. `BAITable.cellValue.test.tsx` pins it.
- **E2E locators**: A new or edited e2e test adds no `.ant-*` locator, because nothing in the app renders an `ant-` class.

## Context

- **What is left of antd**: The code from the antd era still carries antd-shaped call sites: `App.useApp().modal.confirm({ … })`, the `Icon` component frame of the bespoke icons, the `ahooks` hook names, the [frozen antd-v6 prop](0017-single-select-for-client-held-option-lists.md#glossary) names of the `BAI*` wrappers, and `className` / inline `style` usage. None of these import antd any more.
- **Why a decision is needed**: A contributor who meets an antd-shaped call site can read it as an invitation to re-add antd or a sibling package, or to make a replacement behave more like antd. This record fixes which replacement each removed package has and where antd behavior stops.

## Diagram

```mermaid
flowchart LR
  subgraph removed["Not installed"]
    antd["antd"]
    icons["@ant-design/icons"]
    style["antd-style"]
    ahooks["ahooks"]
    lobe["@lobehub/icons and @lobehub/fluent-emoji"]
  end
  subgraph bui["packages/backend.ai-ui/src"]
    appshim["app-shim/<br/>App, message, modal, BAIAppProvider"]
    iconshim["icons/iconShim.tsx and BAI*Icon files"]
    hooks["hooks/<br/>useToggle, useControllableValue, ..."]
    table["components/Table/BAITable.tsx"]
    buicss["styles/backend.ai-ui.css"]
  end
  subgraph host["react/src"]
    hostshim["app-shim/index.tsx"]
    brand["components/brandIcons/"]
    emoji["components/FluentEmojiIcon.tsx"]
    cocss["co-located .css files"]
  end
  lucide["lucide-react"]
  uic["@lablup/ui-common, ADR 0009"]
  antd -- "App.useApp call shape" --> appshim
  antd -- "Table column render" --> table
  icons -- "glyph names" --> lucide
  icons -- "Icon frame and CustomIconComponentProps" --> iconshim
  style -- "createStyles blocks" --> cocss
  icons -- "icon baseline and spin keyframes" --> buicss
  ahooks -- "12 hooks, same names" --> hooks
  lobe -- "36 brand glyphs" --> brand
  lobe -- "CDN URL template" --> emoji
  appshim -- "re-exported from backend.ai-ui" --> hostshim
  appshim -- "renders Modal and Toast" --> uic
  table -- "renders DataGrid" --> uic
```

## Decision

### 1. Removed packages stay out

| Removed package         | Replacement                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `antd` components       | Astryx through `@lablup/ui-common` (ADR 0009) and the `BAI*` wrappers in `backend.ai-ui`                 |
| `antd` `App.useApp()`   | the app-shim, section 4                                                                                  |
| `@ant-design/icons`     | `lucide-react` and the `BAI*Icon` files, section 2                                                       |
| `antd-style`            | a co-located `.css` file, section 5                                                                      |
| `ahooks`                | the hooks in `packages/backend.ai-ui/src/hooks/`, section 3                                              |
| `@lobehub/icons`        | `react/src/components/brandIcons/` (`createBrandIcon.tsx` and 36 static modules under `generated/`)      |
| `@lobehub/fluent-emoji` | `react/src/components/FluentEmojiIcon.tsx`, which builds the `/resources/fluentemoji/...` URL on its own |

- **Guard**: The guard is the dependency graph itself. `pnpm-lock.yaml` holds none of these packages and no `rc-*` package, so an import fails to resolve in `tsc`, Vite, and Vitest. No ESLint rule is the guard: the two leftover entries named in Consequences cover only the project-agnostic pages.
- **New need**: When a feature needs something a removed package offered, the contributor builds it on Astryx and puts it where `.claude/rules/bui-component-home.md` says: ui-common for a product-neutral component, BUI for one that depends on Backend.AI.

### 2. Icons

- **Icon set**: `lucide-react` is the icon set of both `react/` and BUI. The catalog in `pnpm-workspace.yaml` pins it to `^1.37.0`, a single major and the one `@astryxdesign/theme-neutral` depends on, so one copy is installed.
- **Own glyphs**: A Backend.AI glyph that lucide lacks is an SVG plus a `BAI*Icon` component in `packages/backend.ai-ui/src/icons/`. The component imports the SVG as `./X.svg?react`, takes props `Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'>`, renders `<Icon component={logo} aria-label={…} />`, and is exported from `icons/index.ts`; `BAIGitHubIcon.tsx` is the example. The GitHub and GitLab brand glyphs are `BAIGitHubIcon` and `BAIGitLabIcon`, because lucide 1.x has no brand icons.
- **Icon frame**: `icons/iconShim.tsx` default-exports `Icon`, which renders `<span role="img" class="bai-icon">` around an SVG sized `1em` with `fill: currentColor`, and supports `spin` and `rotate`. Its `CustomIconComponentProps`, `IconBaseProps`, and `IconComponentProps` types copy the `@ant-design/icons` declarations, so a `BAI*Icon` props interface written against them compiles unchanged.
- **Class name**: The frame uses `bai-icon` and `bai-icon-spin`, never `anticon`. A literal `anticon` class in the bundle therefore means `@ant-design/icons` came back.
- **Inline size**: An inline lucide glyph that replaces an antd icon takes `size="1em"`, because antd icons were `1em` and lucide's default is 24px.

### 3. Utility hooks

- **Ported hooks**: The 12 `ahooks` hooks the repository used live in `packages/backend.ai-ui/src/hooks/` under their `ahooks` names, with no `BAI` prefix: `useControllableValue`, `useToggle`, `useSessionStorageState`, `useLocalStorageState`, `useUpdateEffect`, `useNetwork`, `useDebounce`, `useDebounceFn`, `useThrottleFn`, `usePrevious`, `useHover`, and `useEventListener`. `hooks/index.ts` exports them, and `react/` imports them from `backend.ai-ui`.
- **No new dependency**: The ports use only React and `lodash-es`. `useDebounceFn` and `useThrottleFn` delegate the timing to `lodash-es` `debounce` and `throttle`.
- **Home of a new hook**: A new generic hook goes into `packages/backend.ai-ui/src/hooks/`, not into a new npm package.
- **Stable callbacks**: `hooks/internal/useLatest.ts` holds `useLatest` and `useLatestCallback`, which the ports need, and `backend.ai-ui` does not export them. Application code that needs the latest values inside an effect uses `useEffectEvent`, as `.claude/rules/use-effect-event.md` says.

### 4. Imperative feedback

- **Call shape**: `App.useApp()`, `useApp()`, `message`, and `modal.confirm` / `modal.error` / `modal.info` / `modal.warning` / `modal.success` keep antd's call shape and return values. They come from `packages/backend.ai-ui/src/app-shim/`, which renders Astryx components through ui-common.
- **Import path**: `backend.ai-ui` exports the app-shim. `react/src/app-shim/index.tsx` re-exports it, and files in `react/src` import it from that directory (`../app-shim`). `BAIAppProvider`, mounted in `react/src/components/DefaultProviders.tsx`, hosts the toasts and modals.
- **Tier rule**: Which confirmation an action uses is `.claude/rules/destructive-confirmation.md`. A one-click `modal.confirm` is for reversible actions only.

### 5. Styling without a runtime style engine

- **No style engine**: The code uses no runtime CSS-in-JS engine: no `createStyles`, no `antd-style`, and no emotion. A style that component props and `xstyle` cannot express goes into a co-located `.css` file that the component imports.
- **Tokens**: Such a `.css` file uses declared Astryx `var(--…)` tokens. `scripts/migration-gates/astryx-token-gate.mjs` lists undeclared ones, and the bar in `CLAUDE.md` is no new findings.
- **No style element**: `react/eslint.config.js` rejects a JSX `<style>` element through `no-restricted-syntax`, because a strict CSP `style-src 'nonce-...'` drops it. A value that changes at runtime goes through a CSS custom property.
- **BUI stylesheet**: BUI ships `src/styles/backend.ai-ui.css`, which `src/index.ts` imports as its first layered stylesheet and the package exports as `backend.ai-ui/styles.css`. `package.json` keeps `"**/*.css"` in `sideEffects` so that bundlers do not drop it.
- **Layer order**: The stylesheet opens with the same `@layer` order statement as `react/src/index.css`, and puts its rules in `@layer components`. `scripts/migration-gates/layer-order-gate.mjs`, run by `scripts/verify.sh`, fails when the copies disagree.

### 6. The `BAITable` cell-value contract

- **Render arguments**: A `BAITable` column's `render` receives `(value, record, index)`, as `tableTypes.ts` declares. `value` is the value at the column's `dataIndex`.
- **No `dataIndex`**: A column without `dataIndex` receives `value === undefined`. A computed column reads the row from the second argument: `render: (_value, row) => …`.
- **No quirk emulation**: rc-table returns the whole record for an empty path, which is why `render: (row) => …` worked under antd. `readDataIndex` in `Table/dataGridColumns.tsx` returns `undefined` for a missing `dataIndex` and does not reproduce that. `packages/backend.ai-ui/src/components/Table/BAITable.cellValue.test.tsx` pins both directions, so a change that brings the emulation back fails the test.

### 7. E2E locators

- **No `.ant-*` locator**: A new or edited spec or page object under `e2e/` adds no `.ant-*` locator. Such a locator matches zero elements and fails only after its whole timeout.
- **Fix on touch**: A change that edits a file containing a `.ant-*` locator replaces that locator in the same change. `git grep -n '\.ant-' -- e2e` lists the remaining ones; on 2026-11-03 they are in 41 files.
- **Preferred locators**: A locator uses the role and accessible name first, then a label lookup, then a `data-testid`, in the order `.github/instructions/e2e.instructions.md` gives.

### 8. antd-shaped props stay

- **Frozen vocabulary**: The `BAI*` wrappers keep their [frozen antd-v6 prop](0017-single-select-for-client-held-option-lists.md#glossary) names (`title` on `BAIAlert`, `okButtonProps`, `allowClear`, …). Call sites keep these names. `.claude/rules/component-props-extension.md` defines the vocabulary and how a wrapper extends it.

## Rejected alternatives

- **Emulate rc-table in `BAITable`**: `BAITable` could return the record for a column without `dataIndex`, as rc-table does. Its advantage is that `render: (row) => …` call sites need no edit. It is rejected because the `render` type would then misstate its first argument, and every later reader of `BAITable` would need to know rc-table to predict what `render` receives.
- **antd as an optional peer of BUI**: BUI could list `antd`, `@ant-design/icons`, and `antd-style` as optional peers while wrappers still used them. Its advantage is a gradual removal. It is rejected because BUI's published `.d.ts` describes each wrapper with the types of what it wraps, so a consumer needs antd installed to type-check against the barrel as long as any wrapper uses antd types.
- **Keep `ahooks`**: The repository could keep the dependency for the hooks it uses. Its advantage is that no port code needs maintenance. It is rejected because the 12 hooks in use fit in BUI on React and `lodash-es`, with no new dependency.
- **Keep `@lobehub/icons`**: The repository could keep the package for its 36 brand glyphs. Its advantage is that new brand glyphs arrive with package updates instead of being vendored by hand. It is rejected because its `@lobehub/ui` peer pulled a component library and the last `rc-*` packages into the install.
- **Keep the `anticon` class**: The icon frame could keep antd's class names for old CSS and selectors. It is rejected because that class is how a reader recognizes real `@ant-design/icons` output, and keeping it in first-party code would hide a reintroduction.

## Consequences

- **Loud failure**: An attempt to re-add an antd import fails at type-check time, because the package is not installed. The failure does not depend on a lint rule.
- **Stale lint entries**: The project-agnostic override block in `react/eslint.config.js` still names `antd-style` (`useThemeMode`) and `@lobehub/fluent-emoji` in its `no-restricted-imports` lists. These entries are leftovers, not the guard, and removing them changes nothing.
- **antd-shaped code remains**: Files from the antd era keep `className`, inline `style`, and `useTheme().token('--…')` reads. `CLAUDE.md`'s MIGRATION RELAXATION lets them stay until a file is edited for another reason.
- **E2E backlog**: The legacy `.ant-*` locators in `e2e/` keep failing until a change touches their files.

## Sources

- GitHub: #10802 (absorbed from `.specs/` on 2026-11-03).
- Jira: FR-3482 (the migration, PR #8626) and FR-3488 (retiring the migration gates, PR #8649). Both merged 2026-08-11, the date of the decision.
- Formerly `.specs/FR-3482-astryx-migration/`, removed in #10802; see git history.
- Related: [ADR 0009](0009-ui-common-as-the-single-entry-point-to-astryx.md) (ui-common as the only path to Astryx), [ADR 0014](0014-bai-names-for-ui-common-form-controls.md) (the `BAI<X>` names of form controls), [ADR 0017](0017-single-select-for-client-held-option-lists.md) (`BAISelect` and its antd-v6 props), [ADR 0018](0018-adrs-as-the-only-design-record.md) (ADRs as the only design record).

## Glossary

| Term     | Meaning                                                                                                                                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| app-shim | The app-shim is BUI's module in `packages/backend.ai-ui/src/app-shim/` that exports `App.useApp()`, `message`, and `modal` with antd's call shape and renders them with Astryx components. It contains no antd code. |
| rc-table | rc-table is the table engine antd's `Table` was built on. Its `getPathValue` returns the whole record for an empty `dataIndex` path, so antd passed the record as `render`'s first argument for such a column.       |
