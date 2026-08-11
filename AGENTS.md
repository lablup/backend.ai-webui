# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands worth knowing (the rest are standard `package.json` scripts)

- `pnpm run dev` - dev environment (TypeScript watch + Relay watch + React dev server under Portless on `*.localhost:1355`)
- `pnpm run relay` - compile GraphQL queries (`relay:watch` for watch mode)
- `bash scripts/verify.sh` - the verification harness (see Core Guidelines)
- `make i18n` - extract translation strings
- E2E tests (`/e2e/`, Playwright) require a full Backend.AI cluster running first

## Architecture Overview

### Architecture

This is a **React web application** using React 19 + Astryx (`@astryxdesign/core`) + Relay 20 (GraphQL).

**Astryx is the component system, and the only one.** New UI is written against Astryx
directly (see the `ASTRYX` block below for the discover-don't-guess workflow). Ant Design
is **gone** — removed on the `to-astryx` branch, down to the dependency itself: no
`package.json` declares it, no source file imports it, and there is no antd
`ConfigProvider` in the tree. antd is not a dependency of this workspace at
all — the workspace pins its dependency versions exactly, so it cannot
re-enter as a transitive dependency, and any `from 'antd'` import fails
`tsc` immediately. It is not migration debt any more; it is a regression
that will not compile.

Tech stack, dependencies, and directory layout are what the manifests and the tree say —
read `package.json` / `pnpm-workspace.yaml` / `ls` rather than expecting a list here.

### Development Workflow

1. **Dev Server**: Run `pnpm run dev` (TypeScript watch + Relay watch + React dev server under [Portless](https://github.com/vercel-labs/portless)). Portless is a `devDependency`, no global install needed; `dev.mjs` auto-starts the daemon on port 1355 (HTTPS by default).
2. **URL**: For branches matching `FR-XXXX` the dev URL is `https://fr-XXXX.localhost:1355`; otherwise Portless derives a branch-based subdomain (printed on startup). See `DEV_ENVIRONMENT.md` for theme color and troubleshooting.

# Additional Workflow Description

- All work items are created in Jira and serve as the starting point for understanding and resolving tasks.
- Work items are cloned as GitHub issues in the corresponding repository.
- GitHub PR titles follow this format:
  - prefix
    - feat: New features or feature improvements and changes
    - fix: Bug fixes
    - refactor: Refactoring
    - style: Design changes without functional changes
    - chore: Other small tasks
  - Format: `prefix(JIRA-ISSUE-NUMBER): title`
  - GitHub PR content starts with `Resolves #1234 (FR-1234)` where #1234 is the cloned issue number and FR-1234 is the Jira issue number. The space between `#1234` and `(FR-1234)` is required — without it GitHub does not auto-link the issue reference and downstream tooling (the `.github/workflows/project-status-sync.yml` workflow) fails to detect the link.

- **Tool Requirements**:
  - **Jira**: Use `jira-workflow` skill (fw plugin). Project config in `.jira.config`.
  - **GitHub**: Use `gh` CLI (preferred) or GitHub MCP (`mcp__github__*`)
  - **Git/PR**: Use **GitHub Stacked PRs** via the `gh stack` CLI (`github/gh-stack` extension) for all stacked branch/PR work. The command reference lives in the `gh-stack` skill (`.claude/skills/gh-stack/`) and the project conventions (naming, draft→ready lifecycle, bottom-up merge, sync/rebase/conflict loops, non-interactive agent rules) in the `fw:stacked-pr-workflow` skill — load both before stack work.
    - **Graphite (`gt`) is banned in this repository (FR-3391).** Never run any `gt` command; a permissions deny rule plus a `PreToolUse` hook block `gt` invocations. Stack metadata lives on GitHub itself.
    - Open and update PRs with `gh stack submit --auto` (drafts by default; `--open` to mark ready). For a genuinely single, unstacked PR, plain `git push` + `gh pr create` is acceptable.
- Follow the GitHub Stacked PRs strategy. Write work by appropriately stacking individual PRs.
- When amending a PR with significant changes, update the PR description to reflect the new scope. Minor fixes don't need description updates, but new features, deleted files, or changed approach should be reflected.

### Configuration

- Main config: `config.toml` (copied from `config.toml.sample`)
- Multiple environments supported via `configs/` directory
- Electron app config: `build/electron-app/app/config.toml`

### Internationalization

- JSON translation files in `resources/i18n/` (22 languages supported)
- **Host** components (`react/src/**`) use `useTranslation()` / `<Trans>` from `react-i18next`
- **BUI** components (`packages/backend.ai-ui/src/**`) use `useBAIi18n()` / `<BAITrans>` — they bind explicitly to BUI's own i18next instance, bypassing React Context lookup. Direct imports of `useTranslation` / `Trans` / `withTranslation` / `Translation` / `I18nextProvider` from `react-i18next` inside BUI are blocked by ESLint (FR-2986).
- Backend.AI UI package has own locale files in `packages/backend.ai-ui/src/locale/`
- Run `make i18n` to extract translation strings

## Important Notes

- Pre-commit hooks (Husky + lint-staged) run linting and formatting automatically
- Use `make clean` before building if encountering issues
- Electron app requires special build process with `make dep`
- React components use Relay; ensure GraphQL schema in `/data/` is up to date
- Backend.AI client library is a workspace package at `packages/backend.ai-client/` (built with tsup)

## Core Guidelines

### React Essentials (detail: `.github/instructions/react.instructions.md`, auto-loaded via applyTo)

- Use `'use memo'` directive at the top of component bodies for React Compiler optimization. Never remove existing `'use memo'`.
- Use `BAIButton` `action` prop for async operations (auto loading state). Reach for Astryx first, then a `BAI*` wrapper when it adds real behaviour; never introduce a new Ant Design import.
- Follow Relay fragment architecture: query orchestrator (useLazyLoadQuery) + fragment component (useFragment).
- Fragment prop naming: `queryRef` for Query types, `{typeName}Frgmt` for others.
- Use `useBAILogger` instead of `console.log`. Use pre-defined error boundaries (`BAIErrorBoundary`, `ErrorBoundaryWithNullFallback`).
- Use Jotai for global state, Relay for GraphQL state.

### On-Demand Skills (loaded only when needed)

- **Storybook**: `storybook-patterns` skill (fw plugin; CSF 3, meta config, story patterns, checklists)
- **i18n**: `i18n-patterns` skill (fw plugin; translation keys, casing rules, language-specific guidelines)
- **Documentation**: `docs-writing-guide` skill (fw plugin; user manual structure, terminology, multilingual rules)
- **Astryx UI fixes**: `astryx-fix` skill (measure-before-you-fix, theme-defaults-first procedure, known traps, verification bar)
- **Astryx UI bug reporting**: `astryx-bug-report` skill (capture-only intake for visual / behavioral defects, files them as Jira Bugs under epic FR-3491, duplicate + relates scan). Use it when the ask is "record this", `astryx-fix` when it is "fix this".

Component-authoring patterns (Relay tables, selects, modals, forms, layout) have no
dedicated skills: read `react.instructions.md` for the project deltas, then copy the
nearest existing sibling component.

### Terminology Precedence

When terms disagree, precedence is: (1) the live UI i18n label in `resources/i18n/{lang}.json`, (2) `terminology.json`, (3) `DOCUMENTATION-STYLE-GUIDE.md`. The higher-precedence source wins; fix the lower one to match (or open an FR to change the label). See `packages/backend.ai-webui-docs/TERMINOLOGY.md` for the term owner, new-term gate, and the atomic rename/deprecation checklist.

### Auto-Applied Instructions (loaded when editing matching files)

- `react.instructions.md` → `react/**/*.tsx,react/**/*.ts`
- `storybook.instructions.md` → `packages/backend.ai-ui/**/*.stories.tsx,packages/backend.ai-ui/**/*.stories.ts`
- `i18n.instructions.md` → `resources/i18n/**/*.json,packages/backend.ai-ui/src/locale/**/*.json` (use `i18n-patterns` skill for tsx/ts context)
- `e2e.instructions.md` → `e2e/**/*.ts`
- `docs.instructions.md` → `packages/backend.ai-webui-docs/**/*.md`

### Verification Harness

Run `bash scripts/verify.sh` from project root to check Relay, Lint, Format, and TypeScript. Output ends with `=== ALL PASS ===` on success. Agents should use this script instead of running checks individually.

### PR Review Checklist

When reviewing PRs (especially agent-generated ones), check:

- Verification results (`scripts/verify.sh` output in PR description)
- Semantic correctness: does the code do what the issue asks? (lint/tsc passing is not enough)
- i18n keys match actual UI text and follow naming conventions
- No unintended scope creep (files changed beyond what the issue requires)
- `TODO(needs-backend)` markers are properly placed with issue references
- No hardcoded strings, magic numbers, or debug artifacts left behind

<!-- ASTRYX:START -->
Astryx v0.3.0 · 155 components
CLI: run every command as `pnpm exec astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing. Full page → AppShell; sidebar nav → SideNav.
- Frame first: pick the shell (AppShell / Layout+LayoutPanel) and budget regions in px BEFORE writing content (`astryx docs layout`).
- Dense data = rows (Table, List/Item) edge-to-edge — never Card-wrapped list items. Card = dashboard widgets, galleries, settings groups only.
- Status → StatusDot/Token; Badge only for counts and enumerated states, never decoration.
- Custom styling: component props first; else the xstyle prop / StyleX tokens (@astryxdesign/core/theme/tokens.stylex). No raw hex/px.
- Tokens for every value (`astryx docs tokens`). Brand/accent via `astryx theme` — never override --color-* in :root.
- SELF-CHECK before you finish: re-read the file and replace any className=, style={{…}}, raw <div>/<span> layout, imported .css/@apply, or hardcoded #hex/px with the component or the xstyle prop + a token. If unsure a component/prop exists, run `astryx component <Name>` / `astryx search "<thing>"`; don't hand-roll CSS.
- MIGRATION RELAXATION (antd → Astryx): the className=/style={{…}} part of the SELF-CHECK is relaxed for files carried over from the antd era, which are still full of `className` / inline `style` and `theme.useToken()` reads. Do not rewrite those wholesale — convert a file's idioms when you are already changing it for another reason. A style that props/xstyle cannot express goes in a co-located `.css` file the component imports (P17), with `var(--…)` Astryx tokens; never a runtime style engine.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   155 components by category
  template --list    page + block recipes
  docs <topic>       color, elevation, icons, illustrations, internationalization, layout, migration, motion, principles, shape, spacing, styling, theme, tokens, typography
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any @astryxdesign/core bump
<!-- ASTRYX:END -->
The ASTRYX block above is `astryx init --features agents` output (run from `react/`, where the StyleX compiler is detected) in **StyleX mode**, plus the project-specific MIGRATION RELAXATION line. Canonical generated copy: `react/AGENTS.md`. Re-run the init from `react/` on every `@astryxdesign/core` bump and re-sync this block (keeping the relaxation line).

The block's `pnpm exec astryx <cmd>` assumes you are **inside `react/`**. `@astryxdesign/cli` is a devDependency of that workspace only, so the root `node_modules/.bin` has no `astryx` binary — and `pnpm exec` resolves binaries, not package scripts, so it fails at the root with `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`. **From the repository root, run `pnpm run astryx <cmd>` instead** (root `package.json` proxies it to the same CLI). Both forms take identical arguments.
