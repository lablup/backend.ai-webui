---
applyTo: "react/**/*.tsx,react/**/*.ts"
---

# React Guidelines for Backend.AI WebUI

Project-specific deltas only. Generic React 19 / TypeScript practice is assumed and not
repeated here. Depth lives in the on-demand skills listed at the bottom.

## React Compiler — `'use memo'`

- `babel-plugin-react-compiler` runs in **annotation mode**: memoization happens only in
  function bodies that start with `'use memo'`.
- Add `'use memo'` as the **first statement of every component body and every custom hook
  body** (function bodies, not files). Never remove, rename, or backtick an existing one.
- Placement is strict: before any other code (comments are fine), quoted (`'use memo'` /
  `"use memo"`), never conditional. Only the first directive is processed.
- TypeScript/ESLint may report `Unknown directive: 'use memo'`. That is expected — do not
  "fix" it, and do not comment that it is invalid or deprecated.
- **Do not add `useMemo` / `useCallback` in new code.** Plain values, plain inline handlers.
  Manual memoization is only for a profiled bottleneck, and reviewers will push back.
  Full rule: `.claude/rules/react-compiler-memoization.md`.
- For effect callbacks that must read latest props/state without re-triggering, use
  `useEffectEvent` — never `// eslint-disable-next-line react-hooks/exhaustive-deps`.
  See `.claude/rules/use-effect-event.md`. (The old ahooks `useMemoizedFn` pattern is gone;
  `ahooks` is not a dependency.)

## Component system: BAI first, Astryx second, antd never

- **Reach for a `backend.ai-ui` component first** — `BAIFlex`, `BAIButton`, `BAIModal`,
  `BAICard`, `BAIText`, `BAITableAstryx`, … They own this project's defaults and wrap the
  Astryx internals.
- When no BAI equivalent exists, use **Astryx** (`@astryxdesign/core`) directly. Discover
  before writing: `astryx search "<thing>"`, `astryx component <Name>`. The CLI lives in
  the `react` workspace, so run it as `pnpm exec astryx …` from `react/` or
  `pnpm run astryx …` from the repository root — `pnpm exec` finds no binary at the root.
  See the `ASTRYX` block in `AGENTS.md` / `react/AGENTS.md`.
- **antd is not a dependency.** `import … from 'antd'` does not resolve and fails `tsc`;
  the workspace is exact-pinned so it cannot re-enter transitively. Never add one.
- `antd-style` (`createStyles` / `createGlobalStyle`) is also gone. Styling that props and
  tokens cannot express goes in a **co-located `.css` file** the component imports, written
  with `var(--…)` Astryx custom properties. No raw hex / px.
- Use `BAIFlex` for layout (`direction="row" | "column"`, `gap`), not a hand-rolled flex div.

### Shims — same call shape, different import

Three antd surfaces were replaced by self-hosted shims that are drop-in compatible. Adjust
the `../` depth to the file; the same specifiers exist on both sides of the workspace
(`react/src/*` re-exports the implementation in `packages/backend.ai-ui/src/*`).

| Was | Now (host `react/src/**` and BUI `packages/backend.ai-ui/src/**`) |
|---|---|
| `import { App } from 'antd'` | `import { App } from '../app-shim'` |
| `import { theme } from 'antd'` | `import { theme } from '../theme-shim'` |
| `import { Form } from 'antd'` | `import { Form } from '../form-engine'` |

- `App.useApp()` gives `{ message, modal }` with antd's exact call shape — `modal.confirm()`
  for throwaway confirmations, `message.*` for toasts. There is **no `notification`** on the
  shim; long-running notifications are the Jotai store in
  `react/src/hooks/useBAINotification.tsx`. `<BAIAppProvider>` is mounted once in
  `DefaultProviders`.
- `theme.useToken()` returns the antd-shaped `{ token, hashId, theme }` (numbers for
  dimensions, hex strings for colours) backed by Astryx tokens. Use tokens, never hard-coded
  colours — every component must work in light and dark.
- `Form` / `Form.Item` / `Form.List` / `Form.useForm` / `Form.useWatch` resolve to the
  self-hosted engine; `Form.Item` **is** `BAIFormItem`.
- Everything else that used to come from antd is a `BAI*` wrapper from `backend.ai-ui` or an
  Astryx primitive from `@astryxdesign/core/<Name>`.

### The antd-v6-shaped prop vocabulary is frozen deliberately

antd is gone but its prop **names** survived on purpose: `BAIAlert`, `BAICard`, `BAIModal`,
`BAISelect`, `BAITable`, … were given an antd-**v6**-shaped surface so the hundreds of
inherited call sites needed no edit when their internals were rebuilt on Astryx.

- Do **not** rename these props to Astryx spellings or invent a third one. `BAIAlert` takes
  `title` (not `message`); steps take `orientation` (not `direction`).
- When a wrapper's props `Omit<>` a name, that Omit targets the **v6** name.
- Some props describe a mechanism Astryx does not have and are accepted-and-ignored; each
  such case is recorded in the wrapper's own file header — check there before assuming a prop
  does something.
- Conventions for extending a wrapped component's props (`Omit<>` + `...rest`):
  `.claude/rules/component-props-extension.md`.

## Relay

- **Architecture**: split the query orchestrator (`useLazyLoadQuery`, owns fetch policy and
  Suspense boundary) from the fragment component (`useFragment`, owns presentation).
- **Prop naming**: `queryRef` for a `Query` type ref; `{typeName}Frgmt` for everything else
  (`userFrgmt`, `vfolderNodeFrgmt`, plural `usersFrgmt`).
- Colocate fragments with the component that reads them; request only the fields you need;
  paginate lists. Type refs with the generated `$key` types.
- Name the fragment result after the GraphQL type (`const users = useFragment(...)`), not
  `data` / `result`.
- Export the "one row" type so consumers don't re-derive it:
  `export type UserNodeInList = NonNullable<BAIUserNodesFragment$data[number]>;`
- Pagination argument modes are mutually exclusive — see `.claude/rules/graphql-pagination.md`.
- Depth: `relay-patterns`, `react-relay-table`, `create-relay-nodes-component` skills.

## Naming

| Kind | Convention |
|---|---|
| Shared component under `packages/backend.ai-ui/` | `BAI*` (`BAIButton`, `BAIFlex`, `BAIUserNodes`) |
| Relay-backed table bound to a GraphQL type | `*Nodes` (`SessionNodes`, `VFolderNodes`) — colocates a `@relay(plural: true)` fragment |
| Top-level route component in `react/src/pages/` | `*Page` (`AdminComputeSessionListPage`) |
| Modal / drawer shell | `*Modal` / `*Drawer` |
| Reusable group of `Form.Item`s | `*FormItems` (`ResourceAllocationFormItems`) |

Callback props: `onChange` (never `setValue` — migrated away in FR-1720), `onChangeOrder`,
`onRequestClose`, `customizeColumns`. Boolean props are descriptive, not `isXxx`
(`disableSorter`, `showResetButton`).

Variables and props start lowercase (camelCase). Exceptions: component names, types /
interfaces, enum members.

## Composition

- Prefer function-based extension over array-based: `customizeColumns?: (base: BAIColumnType[]) => BAIColumnType[]`
  lets consumers insert, filter, reorder or replace — `extraColumns` can only append.
- Use discriminated unions for component variants, with `neverProps?: never` on the other
  arm, and narrow the `*Props` bag to the fields call sites actually pass rather than
  re-exporting a whole upstream props type.
- Jotai for global state, Relay for GraphQL-backed state, React Context only for simple
  non-persisted UI state. Compose instead of drilling props 3+ levels.

## Async actions and refetching

- Async work on a button goes through `BAIButton`'s **`action`** prop (React Transition +
  automatic loading state + double-click guard). Do not hand-roll `useState(isLoading)`, and
  do not pair `action` with `onClick` on the same button. `onClick` is for simple sync state.
- `useFetchKey` drives manual refetch / cache invalidation; wire it into the query that must
  re-run after a mutation.
- `BAIUnmountAfterClose` must wrap modal/drawer content that holds a form — otherwise form
  state goes stale across open/close.
- Irreversible destructive actions require typed confirmation, not a popconfirm — see
  `.claude/rules/destructive-confirmation.md`.

## i18n — two separate i18next instances (FR-2986)

- **Host** (`react/src/**`): `useTranslation()` / `<Trans>` from `react-i18next`.
- **BUI** (`packages/backend.ai-ui/src/**`): `useBAIi18n()` / `<BAITrans>`, imported by
  relative path from the package's own hook. These bind explicitly to BUI's i18next instance
  and bypass React Context; direct `react-i18next` imports inside BUI are blocked by ESLint.
- Never hard-code user-facing text; new strings need all supported locales.
  Depth: `fw:i18n-patterns` skill and `.github/instructions/i18n.instructions.md`.

## Logging and error handling

- **No `console.*`** (ESLint `no-console`). Use `const { logger } = useBAILogger();` —
  imported from `backend.ai-ui` — with the right level (`debug` / `info` / `warn` / `error`).
  The logger is disabled in production automatically and supports `withContext`.
- **No empty `catch {}`** — it trips the security scanner. Either log via `logger.error`, or
  make the ignore explicit: `catch { return undefined; }`.
- Use the pre-defined boundaries: `BAIErrorBoundary` (user-facing fallback) and
  `ErrorBoundaryWithNullFallback` (silent). Do not write new error boundary components.

## File conventions

- Import order is enforced by `@trivago/prettier-plugin-sort-imports` with **no groups
  configured** — one block sorted by module specifier (ASCII). Do not insert blank lines or
  group comments between imports; `pnpm format-fix` strips them.
- Use `lodash-es`, never `lodash`.
- Hook call order inside a body: i18n / theme / app → context hooks → router & URL state →
  Relay → `useState` → derived values → effects → handlers. Every hook above any early return.
- Derive, don't mirror: no `useState` + `useEffect` for a value computable from props/state.

## Verification

`bash scripts/verify.sh` (Relay compile, ESLint, Prettier, TypeScript) must pass. Unit tests
are Vitest; E2E is Playwright under `e2e/` (see the `playwright-test-*` agents in
`.claude/agents/`).

## On-demand skills

`react-form` (Form/`Form.Item`, validators) · `react-modal-drawer` · `react-layout`
(`BAIFlex`, spacing, breakpoints) · `react-relay-table` · `react-suspense-fetching`
(fetch policies, `fetchKey`) · `react-url-state` (`nuqs`) · `react-async-actions` ·
`tab-url-state` · `relay-patterns` · `create-relay-nodes-component` ·
`relay-infinite-scroll-select` · `astryx-fix` (visual/behavioural fixes on Astryx UI) ·
`fw:i18n-patterns` · `fw:storybook-patterns`.

## Review checklist (project-specific)

- [ ] `'use memo'` first line of every new component / hook body; no speculative
      `useMemo` / `useCallback`; no `exhaustive-deps` disables.
- [ ] No `antd` import, no `antd-style`; BAI component used where one exists, Astryx
      otherwise; `App` / `theme` / `Form` imported from the shims.
- [ ] BAI wrapper props keep their antd-v6-shaped names; props interface extends the wrapped
      component's props via `Omit<>` with `...rest` forwarded.
- [ ] Relay: orchestrator/fragment split, `queryRef` / `{typeName}Frgmt` naming, `$key`
      types, colocated fragments, single pagination mode.
- [ ] `BAIButton action` for async work; `useFetchKey` where refetch is needed;
      `BAIUnmountAfterClose` around form-bearing modals/drawers.
- [ ] i18n: correct hook for the package (`useTranslation` vs `useBAIi18n`), no hard-coded
      user-facing strings.
- [ ] `useBAILogger` instead of `console.*`; no empty catch; pre-defined error boundaries.
- [ ] Tokens/`var(--…)` instead of hard-coded colours or px; works in light and dark.
- [ ] `bash scripts/verify.sh` passes.
