# REVIEW.md — reviewing a pull request in Backend.AI WebUI

Read this before reviewing a PR here, whether you are the ready gate's `/code-review` run, a
review bot, or a person. Build, architecture and component conventions live in `CLAUDE.md` /
`AGENTS.md`; this file is only about what to report and how.

Backend.AI WebUI is a React 19 + Astryx (imported through `@lablup/ui-common`, never
`@astryxdesign/*`) + Relay 20 application. Ant Design is not a dependency.

## What failure looks like in this repository

Report these. Each points at the rule that defines it; cite the rule in the finding.

- **A component renders wrong or not at all.** A fragment spread missing from the parent query,
  a field read that the fragment does not select, a component or hook body without `'use memo'`
  as its first statement, or a Suspense boundary that hides a card header or flashes the fallback
  on a background refetch. (`.github/instructions/react.instructions.md` — Relay, React Compiler;
  `.claude/rules/use-bai-card.md` — Suspense pairing.)
- **A permission or scope leak.** Admin-only UI or an `admin*` query reachable by a user who
  cannot use it, a leaf component reading the ambient project instead of its `project` prop, or
  the wrong `scope` / `project` passed to a query. (`docs/adr/0001-explicit-project-prop-contract.md`,
  `docs/adr/0012-scoped-search-fields-in-place-of-admin-fields.md`, `react/src/routes.tsx`
  `handle.access`.)
- **An i18n key that does not exist.** A `t('…')` key absent from `resources/i18n/en.json`, or a
  BUI `comp:…` key absent from `packages/backend.ai-ui/src/locale/en.json` — the UI then shows the
  raw key. Also `useTranslation` inside `packages/backend.ai-ui/src/**` (BUI uses `useBAIi18n()`,
  FR-2986). (`.github/instructions/i18n.instructions.md`.)
- **Two pagination modes in one connection call** — `first` + `offset`, `limit` + `after`, … on a
  `*V2` field fails only at runtime. (`.claude/rules/graphql-pagination.md`.)
- **An irreversible action without typed confirmation.** Permanent delete, purge or terminate
  behind a `BAIPopconfirm` or a plain `modal.confirm` instead of `BAIDeleteConfirmModal` with
  `requireConfirmInput`. (`.claude/rules/destructive-confirmation.md`.)
- **An undeclared design token.** A `var(--…)` name that the Astryx token gate does not know
  produces no error anywhere; it silently never themes. (`CLAUDE.md` — Verification Harness;
  `node scripts/migration-gates/astryx-token-gate.mjs --strict`.)
- **An `antd` or `@astryxdesign/*` import**, or a host-side twin of a BUI / ui-common component.
  (`CLAUDE.md` — Architecture; `docs/adr/0009-ui-common-as-the-single-entry-point-to-astryx.md`;
  `.claude/rules/bui-component-home.md`.)
- **A security hole.** HTML rendered without sanitising (`dangerouslySetInnerHTML` with user or
  server data), a user-controlled URL passed to `window.open`, an `href` or a redirect, or a
  credential or token written to a log, a URL or the PR body. The gate runs `/security-review`
  only on High-tier PRs, so a Medium-tier reviewer checks these themselves.
- **A decision that contradicts an ADR in force** without a superseding ADR in the same PR.
  (`.claude/rules/adr.md`.)

## Evidence rule

Every finding names a file and line in the diff and says how to show it fails — the query that
returns nothing, the route a non-admin can open, the key `en.json` does not have. A guess from a
name ("this looks like it might…") is not a finding. If you cannot point at the line, do not post.

## What not to post

1. Style, naming, formatting, "consider …", and cleanup that changes no behaviour. Lint and
   Prettier already ran (`scripts/verify.sh`).
2. Requests to comment self-explanatory code. Comment density follows
   `.claude/rules/comment-density.md`.
3. Anything already answered, fixed in a later commit, or raised by another reviewer in the
   thread. Read the whole conversation first; one issue per comment, never a bundle.
4. **Nits: at most 3 per review.** Drop the rest.
5. A defect in lines the PR did not add or change is tagged **Pre-existing** — reported so it is
   not lost, never blamed on the author or required in this PR.
6. The contents of generated or vendored files. Skip:
   - `**/__generated__/**` — Relay compiler output (review the `graphql` tags in `.tsx`/`.ts`
     files and `data/schema.graphql` instead)
   - `react/src/generated/**` — the search-palette index (review `react/src/routes.tsx` and the
     extractor instead)
   - `pnpm-lock.yaml`, `**/*.lock`, `**/*.lock.yml`
   - `*.d.ts` declaration files and other build artifacts under `dist/` or `build/`

   Only the **set** of generated files is worth a glance: a `graphql` tag changed with no
   matching `__generated__` file, or generated files changed with no input that explains them.
   This list is kept in sync with `.claude/rules/review-ignored-paths.md`; change both together.

## Tags and summary format

Each finding starts with one tag: **Important** (would ship wrong behaviour, leak data or
permission, break a contract, or violate a written rule above), **Nit** (anything else in the
PR's own lines), or **Pre-existing**.

The summary starts with the count — `N findings — a Important, b Nit, c Pre-existing` — and says
plainly when nothing needs fixing: `0 findings — nothing to fix`.

## PR conventions

- PR title `prefix(#N): title` (`feat` / `fix` / `refactor` / `style` / `chore`), body starting
  `Resolves #N`, branch `type/gh-N-slug`. Do not ask for a Jira key, including on issues whose
  body ends with `JIRA Issue: FR-XXXX`.
- Legacy PRs opened before the switch may use `prefix(FR-1234): title` and
  `Resolves #1234 (FR-1234)`. Accept them in flight; do not suggest the form for new PRs.
- The PR body carries **Testing**, **Risk** and **How to revert** (`.github/PULL_REQUEST_TEMPLATE.md`).

## Risk tiers

The ready gate — the fw plugin's `pr-ready-gate` skill (`scripts/risk-tier.sh` next to its
SKILL.md) — reads the two lists below; `docs/adr/0015-risk-tiered-review-policy-in-review-md.md`
records why. Globs match the changed path case-insensitively. **High**: any changed file
matches. **Low**: every changed file matches. Everything else is **Medium**. The tier sets the
review: Low → `/code-review medium`, 0 suggested approvals; Medium → `high`, 1 approval; High →
`xhigh` plus a security review, 2 approvals. Approvals are a suggestion; branch protection
decides. Files that steer the reviewer, the agents or CI (`REVIEW.md`, `AGENTS.md`, `.claude/**`,
`.github/**`, the verification harness and its lanes, lint/build/test configs, ADRs) are High
even though some are Markdown: High wins over Low. These lists replace the gate's built-in
ones, so a default worth keeping is listed here again.

### High

```
**/REVIEW.md
**/AGENTS.md
**/CLAUDE.md
**/SKILL.md
**/.claude/**
.github/**
scripts/**
react/scripts/**
.husky/**
docs/adr/**
docs/ARCHITECTURE.md
**/*.config.{js,mjs,ts,cjs,mts}
**/tsconfig*.json
packages/eslint-config-bai/**
react/vite-plugins/**
**/.prettierrc*
**/.prettierignore
**/.npmrc
.nvmrc
Makefile
package.json
**/package.json
pnpm-workspace.yaml
pnpm-lock.yaml
config.toml*
configs/**
customHttp.yml
electron-app/**
preload.js
app-packager.js
packages/backend.ai-client/src/**
packages/backend.ai-agent-cli/src/**
react/src/routes.tsx
react/src/hooks/useRouteAccess*
react/src/hooks/useSToken*
react/src/**/*login*
react/src/**/*keypair*
react/src/**/*credential*
react/src/**/*permission*
react/src/**/*rbac*
react/src/**/*role*
react/src/**/*scope*
react/src/**/*delete*
react/src/**/*purge*
react/src/**/*terminate*
packages/backend.ai-ui/src/**/*login*
packages/backend.ai-ui/src/**/*keypair*
packages/backend.ai-ui/src/**/*credential*
packages/backend.ai-ui/src/**/*permission*
packages/backend.ai-ui/src/**/*rbac*
packages/backend.ai-ui/src/**/*role*
packages/backend.ai-ui/src/**/*scoped*
packages/backend.ai-ui/src/**/*delete*
packages/backend.ai-ui/src/**/*purge*
packages/backend.ai-ui/src/**/*terminate*
packages/backend.ai-ui/src/app-shim/**
e2e/**/*login*
e2e/**/auth*
e2e-agent/**/*login*
e2e-agent/**/auth*
```

### Low

```
**/*.md
docs/**
packages/backend.ai-webui-docs/**
resources/i18n/**
packages/backend.ai-ui/src/locale/**
**/*.stories.*
**/*.test.*
**/*.spec.*
e2e/**
e2e-agent/**
**/*.e2e.*
**/__generated__/**
react/src/generated/**
```

The security stems are scoped to `react/src`, BUI `src` and the e2e login helpers rather than
kept as the gate's repo-wide `**/auth*` / `**/*credential*` defaults, which match
`AuthorIcon.tsx` and the manual's screenshots. The client package's docs and tests fall to Low
on purpose; its `src/**` and `.prettierrc*` stay High.
