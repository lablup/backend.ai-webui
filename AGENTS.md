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
    - Open and update PRs with `gh stack submit --auto`, which creates them as drafts. For a genuinely single, unstacked PR, plain `git push` + `gh pr create` is acceptable. Leave them as drafts — marking a PR ready (`--open` / `gh pr ready`) belongs to the gate below, not here.
    - **Draft → ready goes through the `fw:pr-ready-gate` skill (FR-3508), never a bare `gh pr ready` / `--open`.** Copilot's automatic review is disabled on this repository, so the gate is what requests it: it asks Copilot to review while the PR is still a draft, fixes what is objectively wrong, brings anything needing a human decision back to you with the thread left open, replies to and resolves the rest, and only then flips the PR out of draft. Copilot is the first reader; humans are the second.
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
- Comment only what the code cannot say — ≤2 lines by default; the reasoning behind a change goes in the commit body and the PR, not the source file (`.claude/rules/comment-density.md`). The long justification blocks already in the tree are migration-era history: trim a file's blocks when you edit it, don't sweep.

### On-Demand Skills (loaded only when needed)

- **Storybook**: `storybook-patterns` skill (fw plugin; CSF 3, meta config, story patterns, checklists)
- **i18n**: `i18n-patterns` skill (fw plugin; translation keys, casing rules, language-specific guidelines)
- **Documentation**: `docs-writing-guide` skill (fw plugin; user manual structure, terminology, multilingual rules)
- **Backend.AI live data, field meanings, GraphQL**: `bai-agent` skill (preflight/login, the `search` -> `docs show`/`schema show`/`explain` -> `query` loop, and pointing the user at the `webui_url` the query result already carries). It ships with the CLI (`packages/backend.ai-agent-cli/skill/`), not as a repository skill: install it per user with `pnpm run bai-agent init --skill --no-login`. Its workflow contract is the generated `BAI-AGENT` block at the bottom of this file.
- **Relay mutations**: `relay-mutation-store-updates` skill (when a mutation can skip the refetch — update mutations must return their changed fields so Relay patches the normalized store; refetch only when list membership changes)

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

**`verify.sh` does not run the Astryx token gate.** Run it yourself after touching CSS, theme tokens, or any `var(--…)` — anywhere in the repository, `react/src` and `packages/backend.ai-ui/src` alike:

```bash
node scripts/migration-gates/astryx-token-gate.mjs --strict
```

It catches a failure mode nothing else reports: an **undeclared** `var(--name)` produces no compiler, lint or runtime error. With a fallback (`var(--radius-md, 6px)`) the literal wins forever and the token never participates in theming; without one the whole declaration is invalid at computed-value time. The declared set is not guessable — there is no `--color-text-tertiary` and no `--color-text-error` (the semantic error token is the solid `--color-error`) — so run the gate rather than assuming a name. It currently reports pre-existing findings, so the bar is **no new findings**, not zero.

### PR Review Checklist

When reviewing PRs (especially agent-generated ones), check:

- Verification results (`scripts/verify.sh` output in PR description)
- Semantic correctness: does the code do what the issue asks? (lint/tsc passing is not enough)
- i18n keys match actual UI text and follow naming conventions
- No unintended scope creep (files changed beyond what the issue requires)
- `TODO(needs-backend)` markers are properly placed with issue references
- No hardcoded strings, magic numbers, or debug artifacts left behind

<!-- ASTRYX:START -->
Astryx v0.5.2 · 163 components
CLI: run every command as `pnpm exec astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing, page frame included.
- Frame first: read `astryx docs layout` before writing any page or screen — page frame, region widths, breakpoint behavior.
- Dense data = rows (Table, List/Item), never Card-wrapped list items; Card is for standalone widgets. Status = StatusDot/Token; Badge = counts only.
- Custom styling: component props first; else the xstyle prop / StyleX tokens (@astryxdesign/core/theme/tokens.stylex). No raw hex/px.
- Tokens for every value (`astryx docs tokens`). Brand/accent belongs in the theme (`astryx theme list` / `theme add <slug>`, or `astryx theme template` for a custom one) — never override --color-* in :root.
- SELF-CHECK before you finish: re-read the file and replace any className=, style={{…}}, raw <div>/<span> layout, imported .css/@apply, or hardcoded #hex/px with the component or the xstyle prop + a token. If unsure a component/prop exists, run `astryx component <Name>` / `astryx search "<thing>"`; don't hand-roll CSS.
- MIGRATION RELAXATION (antd → Astryx): the className=/style={{…}} part of the SELF-CHECK is relaxed for files carried over from the antd era, which are still full of `className` / inline `style` and `theme.useToken()` reads. Do not rewrite those wholesale — convert a file's idioms when you are already changing it for another reason. A style that props/xstyle cannot express goes in a co-located `.css` file the component imports (P17), with `var(--…)` Astryx tokens; never a runtime style engine.
- BUI INTEGRATION (this repo): `backend.ai-ui` is registered as an Astryx integration, so `astryx component`, `astryx search` and `astryx component --list` cover the `BAI*` wrappers next to core's primitives, and `astryx docs backend-ai-ui` explains the layer. The `component --list` count in the generated line below is core's own — `astryx init` counts only what core discovers — so the live catalog is larger than the number printed there; run the command to see it. When a `BAI*` component and a core primitive both fit, use the `BAI*` one — it carries the project defaults, and it imports from `backend.ai-ui` (the Import line `astryx component` prints for it names core — an upstream CLI bug, still present in 0.5.2). A new `BAI*` component ships a same-stem `{Name}.doc.ts` beside its source.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   163 components by category
  template --list    page + block recipes
  docs <topic>       browser-support, cli-integrations, color, elevation, getting-started, icons, illustrations, internationalization, layout, migration, motion, principles, shape, spacing, styling-libraries, styling, theme, tokens, typography, working-with-ai, backend-ai-ui
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any @astryxdesign/core bump
<!-- ASTRYX:END -->
The ASTRYX block above is `astryx init --features agents` output (run from `react/`, where the StyleX compiler is detected) in **StyleX mode**, plus the project-specific MIGRATION RELAXATION line. Canonical generated copy: `react/AGENTS.md`. Re-run the init from `react/` on every `@astryxdesign/core` bump and re-sync this block (keeping the relaxation line).

The block's `pnpm exec astryx <cmd>` assumes you are **inside `react/`**. `@astryxdesign/cli` is a devDependency of that workspace only, so the root `node_modules/.bin` has no `astryx` binary — and `pnpm exec` resolves binaries, not package scripts, so it fails at the root with `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`. **From the repository root, run `pnpm run astryx <cmd>` instead** (root `package.json` proxies it to the same CLI). Both forms take identical arguments.

<!-- BAI-AGENT:start -->
bai-agent · 13 commands
Agent-facing CLI over this checkout: the user manual, the GraphQL schema, the i18n stores and — once logged in — the live manager.
CLI: run every command as `pnpm run bai-agent <cmd>` from the repository root (shown below as `bai-agent ...`).
The proxy runs the bundle, so build it first: `pnpm --filter backend.ai-agent-cli build`. Without the proxy, still from the repository root: `node packages/backend.ai-agent-cli/dist/cli.js <cmd>`.
Preflight, answer-or-link rules and a ready-to-run query cookbook: the `bai-agent` skill, shipped with the CLI (`packages/backend.ai-agent-cli/skill/SKILL.md`) and installed per user by `pnpm run bai-agent init --skill --no-login`.

WORKFLOW — discover, don't guess. Before answering anything about Backend.AI data:
1. `bai-agent doctor` — checkout and stored session in one pass; exit 0 means the environment is ok. Then `bai-agent whoami` — exit 3 means log in (see RULES).
2. `bai-agent search "<english UI term>"` — START HERE: one ranked list over manual + schema + terminology. Every hit carries the `command:` that opens it.
3. `bai-agent docs show <id>` · `schema show <Type>.<field>` · `explain <Type>.<field>=<VALUE>` — the hit in full. `schema show` is what the SDL declares; `explain` is what it means to a user.
4. `bai-agent query '<document>'` — ask the manager. Validated against the checkout's SDL before any network call. Rows come back carrying `webui_path` / `webui_url` under `data.links` — hand that to the user so they can open it themselves.

OUTPUT: `--json` prints one envelope on stdout — {"apiVersion":"bai-agent/v1","type":…,"data":…}; a failure prints {"apiVersion","error","code","suggestions?","hint?"} on stderr and nothing on stdout. Text is the same data as aligned `key: value` records. `hint` is a concrete next step — a command to run, or for a refused mutation, the WebUI page to do it on — never prose.
EXIT: 0 ok · 1 error (schema_mismatch, version_mismatch, repo_not_found, repo_incomplete, internal) · 2 usage · 3 auth_required · 4 mutation_refused · 5 not_found.

RULES:
- Search in the ENGLISH terms the UI shows ("Resource Group", not "scaling_group"). The index is English-only; a non-English query is normalised through the i18n stores, never translated.
- Never mix GraphQL pagination modes: `first`+`after` XOR `last`+`before` XOR `limit`+`offset`. The `*V2` connections reject a mix at runtime, and page-number paging is `limit`+`offset`. See `.claude/rules/graphql-pagination.md`.
- `schema_mismatch` is YOUR document, not the manager: the checkout's SDL rejected it locally, before any request. Fix it with `schema show <Type>`; never retry it unchanged.
- A mutation runs only with `--allow-mutation` AND a field on the allow-list (`packages/backend.ai-agent-cli/src/mutation-allowlist.ts`). Either miss exits 4 `mutation_refused` before the network. Do not route around it — extend the list in a reviewed PR, or use the WebUI.
- Destructive actions (delete, purge, terminate, revoke) are never run from here. Give the human the WebUI page from the refusal's `hint` and let them press the button.
- Exit 3 `auth_required` → `bai-agent login --endpoint <url>`; take the endpoint and the account from the `webui-connection-info` skill. The CLI never handles a password: `login` borrows the browser's session, and `--paste` covers a browser that cannot reach this machine.
- Cite what the CLI returned: `search`, `docs show` and `explain` carry a deployed-docs `url`. `explain` prints `MISSING` for a piece nothing curates — report that, never fill it in from memory.
- Re-run `bai-agent init --features agents` after any CLI change and re-sync this block.

COMMANDS:
  version   Print the CLI version and the detected checkout.
  manifest  Print the CLI capability manifest (commands and their flags).
  init      Set this machine up (endpoint, data sync, login, skill), or with --features print the CLAUDE.md agent block.
  doctor    Diagnose the CLI environment and the detected checkout.
  sync      Fetch the checkout data (SDL, i18n, manual) for use outside a WebUI checkout.
  search    Rank manual sections, schema entries and terminology for a query.
  docs      Search the user manual, or print one of its sections.
  schema    Search the GraphQL schema, print one type / field / enum value, or sync the SDL from a backend release.
  login     Hand this machine a WebUI session, through the browser or by pasting one.
  logout    Delete the stored session file. The manager is not contacted.
  whoami    Show the account the stored session belongs to.
  query     Run a raw GraphQL document against the manager, pre-validated against the checkout SDL.
  explain   Explain what a schema type, field or value means to a WebUI user, tagged by where each piece came from.
<!-- BAI-AGENT:end -->

The BAI-AGENT block above is `bai-agent init --features agents` output, generated from the CLI's own command registry (`packages/backend.ai-agent-cli/src/registry.ts`) — **do not hand-edit it**. Re-run `pnpm --filter backend.ai-agent-cli build && pnpm run bai-agent init --features agents --write` after any change to the CLI; `src/init/block.test.ts` fails when the committed block and the generator disagree. The prose outside the markers survives a re-write.
