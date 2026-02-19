# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development

- `pnpm run server:d` - Start development server with watch mode
- `pnpm run build:d` - Build with watch mode for development
- `pnpm run wsproxy` - Start websocket proxy (required for local development)

### Build and Production

- `pnpm run build` - Full production build (cleans, copies resources, runs rollup)
- `pnpm run build:react-only` - Build only React components
- `pnpm run build:plugin` - Build plugins separately (Lit plugin system removed; kept as no-op)

### Quality Control

- `pnpm run lint` - Run ESLint (exits with 0 to not break builds)
- `pnpm run lint-fix` - Auto-fix ESLint issues
- `pnpm run format` - Check code formatting with Prettier
- `pnpm run format-fix` - Auto-fix code formatting

### Testing

- `pnpm run test` - Run Jest tests
- `pnpm run test` (in /react directory) - Run React-specific tests
- E2E tests require full Backend.AI cluster running first

### Electron App

- `pnpm run electron:d` - Run Electron app in development mode
- `make clean && make dep` - Prepare dependencies for Electron
- `make mac` / `make win` / `make linux` - Build platform-specific apps

## Architecture Overview

### Architecture

This is a **React web application** using React + Ant Design + Relay (GraphQL).
The legacy Lit-Element web components have been removed.

### Key Technologies

- **Build System**: Vite (React), Rollup (service worker only), pnpm for package management
- **Styling**: Ant Design (React)
- **State Management**: Jotai, Relay (GraphQL)
- **GraphQL**: Relay compiler for React components
- **Testing**: Jest for unit tests, Playwright for E2E tests
- **Electron**: Desktop app wrapper with websocket proxy

### Project Structure

```
src/                    # Legacy utilities and websocket proxy
  lib/                  # Shared libraries and utilities
  wsproxy/              # WebSocket proxy for desktop app
react/                  # React application (main UI)
  src/                  # React application code
  components/           # React UI components
resources/              # Static assets, i18n files, themes
packages/               # Monorepo workspace packages
e2e/                    # End-to-end tests
```

### Development Workflow

1. **Dual Server Setup**: Run both `pnpm run server:d` and `pnpm run wsproxy` for full development
2. **Build Process**: Multi-stage build copying resources, running TypeScript, and bundling
3. **Testing**: Both Jest unit tests and Playwright E2E tests
4. **Linting**: ESLint + Prettier with pre-commit hooks via husky

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
  - GitHub PR content starts with `Resolves #1234(FR-1234)` where #1234 is the cloned issue number and FR-1234 is the Jira issue number

- **CRITICAL - MCP Tool Requirements (No CLI alternatives)**:
  - **Jira**: Use Atlassian MCP (`mcp__Atlassian__*`) for ALL operations
    - `mcp__Atlassian__searchJiraIssuesUsingJql` - Search/query issues
    - `mcp__Atlassian__getJiraIssue` - Get issue details
    - `mcp__Atlassian__createJiraIssue` - Create issues
    - `mcp__Atlassian__editJiraIssue` - Update issues
  - **GitHub**: Use GitHub MCP (`mcp__github__*`) or `gh` CLI
    - `mcp__github__search_issues` - Search issues
    - `mcp__github__issue_read` - Get issue details
  - **Git/PR**: Use Graphite MCP (`mcp__graphite__run_gt_cmd`) for branch/commit/push
    - Do NOT use `git commit`, `git push`, `git checkout -b` directly
    - Allowed: `git status`, `git diff`, `git add`, `git log`, `git stash`
- **MCP Authentication Failure Handling**:
  - If an MCP tool call fails with an authentication/connection error, retry **at most once**.
  - If the retry also fails, do NOT enter an infinite retry loop. Instead, inform the user that the MCP connection appears to be broken and suggest:
    1. Run `/mcp` and select reconnect for the failing server
    2. If reconnect fails, restart Claude Code (the stored tokens are usually still valid)
  - This is a known issue where OAuth tokens are stored correctly but the session-level MCP connection state becomes stale (see [claude-code#10250](https://github.com/anthropics/claude-code/issues/10250)). A restart resolves it because Claude Code reads the persisted tokens on startup.
  - When the MCP connection is unavailable, proceed with alternative tools if possible (e.g., `gh` CLI for GitHub operations) rather than blocking the entire workflow.
- Follow Graphite's Stacked PR strategy. Write work by appropriately stacking individual PRs.

### Configuration

- Main config: `config.toml` (copied from `config.toml.sample`)
- Multiple environments supported via `configs/` directory
- Electron app config: `build/electron-app/app/config.toml`

### Key Libraries

- **antd** - Ant Design for React components
- **relay-runtime** - GraphQL client for React
- **electron** - Desktop app framework

### GraphQL/Relay Setup

- Schema files in `/data/`
- Relay compiler configured for React components
- Run `pnpm run relay` to compile GraphQL queries

### Internationalization

- JSON files in `resources/i18n/`
- Use `_t`, `_tr`, `_text` functions for translations
- Run `make i18n` to extract translation strings

### Build Output

- Production build: `build/rollup/`
- Electron app: `build/electron-app/`
- Static assets copied to build directories

## Important Notes

- Always run websocket proxy (`pnpm run wsproxy`) for local development
- Pre-commit hooks run linting and formatting automatically
- Use `make clean` before building if encountering issues
- Electron app requires special build process with `make dep`
- React components use Relay; ensure GraphQL schema is up to date

## Core Guidelines

### React Essentials (detail: `.github/instructions/react.instructions.md`, auto-loaded via applyTo)

- Use `'use memo'` directive at the top of component bodies for React Compiler optimization. Never remove existing `'use memo'`.
- Use `BAIButton` `action` prop for async operations (auto loading state). Prefer BAI components over Ant Design equivalents.
- Follow Relay fragment architecture: query orchestrator (useLazyLoadQuery) + fragment component (useFragment).
- Fragment prop naming: `queryRef` for Query types, `{typeName}Frgmt` for others.
- Use `useBAILogger` instead of `console.log`. Use pre-defined error boundaries (`BAIErrorBoundary`, `ErrorBoundaryWithNullFallback`).
- Use Recoil for global state, Relay for GraphQL state.

### On-Demand Skills (loaded only when needed)

- **Storybook**: `storybook-guide` skill (CSF 3, meta config, story patterns, checklists)
- **i18n**: `i18n-guide` skill (translation keys, casing rules, language-specific guidelines)
- **Documentation**: `docs-guide` skill (user manual structure, terminology, multilingual rules)
- **Relay**: `relay-patterns` skill (fragment architecture, naming conventions, query optimization)

### Auto-Applied Instructions (loaded when editing matching files)

- `react.instructions.md` → `react/**/*.tsx,react/**/*.ts`
- `storybook.instructions.md` → `packages/backend.ai-ui/**/*.stories.tsx,packages/backend.ai-ui/**/*.stories.ts`
- `i18n.instructions.md` → `resources/i18n/**/*.json,packages/backend.ai-ui/src/locale/**/*.json` (use `i18n-guide` skill for tsx/ts context)
- `e2e.instructions.md` → `e2e/**/*.ts`
- `docs.instructions.md` → `packages/backend.ai-webui-docs/**/*.md`
