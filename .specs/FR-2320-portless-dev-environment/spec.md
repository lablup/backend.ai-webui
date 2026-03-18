# Portless Integration for Dev Environment Spec

> **Epic**: FR-2320 ([link](https://lablup.atlassian.net/browse/FR-2320))

## Overview

Replace the existing port-number-based local development configuration (`scripts/dev-config.js`, `BAI_WEBUI_DEV_PORT_OFFSET`, etc.) with [Portless](https://github.com/vercel-labs/portless), giving developers stable, human-readable `.localhost` URLs (e.g., `http://webui.localhost:1355`) instead of `http://localhost:9081`. This simplifies multi-instance development, eliminates manual port management, and provides a more production-like local experience.

## Problem Statement

The current development setup requires developers to:

1. **Remember and manage port numbers** -- The React dev server defaults to port 9081, but when running multiple instances, developers must manually set `BAI_WEBUI_DEV_PORT_OFFSET` in `.env.development.local` to avoid port collisions.
2. **Run a separate configuration step** -- The `dev` script evaluates `scripts/dev-config.js` to compute port offsets and export environment variables before starting the dev server.
3. **Coordinate ports across services** -- The WebSocket proxy runs on port 5050, Storybook on 6006, and the React dev server on 9081+offset. Developers must know which port belongs to which service.

Portless solves these problems by auto-assigning ephemeral ports behind named `.localhost` URLs, so developers never need to think about port numbers.

## Requirements

### Must Have

- [ ] `pnpm run dev` starts the React dev server behind a Portless-managed URL (e.g., `http://webui.localhost:1355`)
- [ ] Portless is installed as a global tool requirement, documented in the project README and `DEV_ENVIRONMENT.md`
- [ ] The `dev` script in `package.json` is updated to launch the React dev server via Portless (e.g., `portless webui <existing start command>`)
- [ ] The `scripts/dev-config.js` port-offset system is removed or deprecated -- Portless handles port assignment automatically
- [ ] Multi-instance development works without manual configuration: each git worktree or project clone automatically gets a unique URL via Portless worktree integration or distinct app names
- [ ] The assigned Portless URL is clearly printed to the terminal when the dev server starts, so developers know where to access the app
- [ ] Existing developer workflows (TypeScript watch, Relay watch, React dev server) continue to run concurrently as they do today
- [ ] `PORTLESS=0 pnpm run dev` provides an escape hatch that bypasses Portless and falls back to a plain port-based setup
- [ ] WebSocket proxy (`pnpm run wsproxy`) is also managed by Portless with a named URL (e.g., `http://wsproxy.webui.localhost:1355`)
- [ ] Storybook (`pnpm run storybook` in `packages/backend.ai-ui/`) runs behind a Portless URL (e.g., `http://storybook.webui.localhost:1355`)

- [ ] Theme color differentiation (currently via `THEME_HEADER_COLOR` in `.env.development.local`) continues to work alongside Portless -- if `scripts/dev-config.js` is removed, theme color injection must be handled by the updated `dev` script or a simplified config helper

### Nice to Have

- [ ] HTTPS mode is supported via `portless proxy start --https` for scenarios where the backend endpoint uses HTTPS

## User Stories

- As a developer, I want to run `pnpm run dev` and access the app at a memorable URL like `http://webui.localhost:1355` so that I do not need to remember port numbers.
- As a developer working on multiple branches simultaneously (git worktrees), I want each worktree to automatically get a distinct URL so that I can run multiple dev servers without configuration.
- As a developer, I want to disable Portless with a single environment variable (`PORTLESS=0`) so that I can fall back to the traditional port-based setup if needed.
- As a new team member, I want clear setup instructions for installing and starting Portless so that I can get the dev environment running quickly.
- As a developer, I want the WebSocket proxy and Storybook accessible at named URLs alongside the main app so that I do not need to remember separate port numbers for each service.

## Acceptance Criteria

- [ ] Running `pnpm run dev` starts the React dev server and it is accessible at `http://webui.localhost:1355` (or the configured Portless proxy port)
- [ ] Running `portless list` shows the registered `webui` app with its ephemeral port
- [ ] Two simultaneous dev server instances (e.g., from different git worktrees) each get distinct URLs and do not conflict
- [ ] Setting `PORTLESS=0` before `pnpm run dev` starts the dev server on a traditional port (e.g., 9081) without Portless; the same escape hatch applies to `pnpm run wsproxy` (falls back to port 5050) and Storybook (falls back to port 6006)
- [ ] TypeScript watch (`tsc --watch`), Relay watch, and React dev server all run concurrently as before
- [ ] HMR (Hot Module Replacement) works correctly through the Portless proxy
- [ ] WebSocket proxy is accessible at `http://wsproxy.webui.localhost:1355` when started via Portless
- [ ] Storybook is accessible at `http://storybook.webui.localhost:1355` when started via Portless
- [ ] `DEV_ENVIRONMENT.md` and `README.md` are updated with Portless setup instructions (install, proxy start, usage)
- [ ] `scripts/dev-config.js` port-offset logic is removed; the file is either deleted or simplified to only handle non-port configuration (e.g., theme color)
- [ ] `.env.development.local.sample` is updated to remove `BAI_WEBUI_DEV_PORT_OFFSET`
- [ ] The Portless proxy auto-starts when the `dev` script runs if it is not already running, so developers do not need a separate manual step

## Out of Scope

- Portless integration for the production build or CI/CD pipelines -- Portless is a local development tool only
- Portless integration for the Electron app development workflow
- Custom TLD support (e.g., `.test` instead of `.localhost`) -- the default `.localhost` is sufficient
- Automatic Portless installation via postinstall scripts -- developers install it globally once

## Dependencies and Constraints

- **Portless requires Node.js 20+** -- the project uses Node 24 (`.nvmrc`), which satisfies this requirement
- **Portless proxy auto-start** -- the `dev` script should attempt to auto-start the Portless proxy if it is not already running, removing the need for a separate `portless proxy start` step; if auto-start fails (e.g., Portless not installed), the script should print a clear error with installation instructions
- **Safari users** may need to run `sudo portless hosts sync` for `.localhost` subdomain resolution -- this should be documented
- **CRA/Craco dev server** must respect the `PORT` environment variable injected by Portless -- this is already the case (the current `dev` script passes `PORT=$BAI_WEBUI_DEV_REACT_PORT`)
- **WebSocket proxy** (`src/wsproxy/local_proxy.js`) reads `PROXYBASEPORT` from env (not `PORT`) -- the `wsproxy` script must either map Portless-injected `PORT` to `PROXYBASEPORT` (e.g., `PROXYBASEPORT=$PORT node ...`), or `local_proxy.js` must be updated to fall back to `PORT` when `PROXYBASEPORT` is not set

## Files Affected

The following files will be modified or removed as part of this work:

| File | Change |
|------|--------|
| `package.json` | Update `dev` and `wsproxy` scripts to launch via Portless (wsproxy is **updated**, not removed); remove `dev:config` and `dev:setup` scripts (diagnostic/setup-only, no longer needed) |
| `packages/backend.ai-ui/package.json` | Update `storybook` script to use Portless |
| `scripts/dev-config.js` | Remove or simplify (keep only theme color logic if needed) |
| `scripts/dev-config.test.ts` | Update or remove tests for port-offset logic |
| `.env.development.local.sample` | Remove `BAI_WEBUI_DEV_PORT_OFFSET`; keep `THEME_HEADER_COLOR` and its presets |
| `src/wsproxy/local_proxy.js` | Update to fall back to `PORT` env var when `PROXYBASEPORT` is not set, for Portless compatibility |
| `DEV_ENVIRONMENT.md` | Rewrite with Portless-based instructions |
| `README.md` | Update dev setup section |
| `CLAUDE.md` | Update dev commands and port references |
| `AGENTS.md` | Update port configuration references |

## Related Issues

- FR-2304: Integrate Portless into WebUI development environment
- GitHub #5986: Integrate Portless into WebUI development environment
