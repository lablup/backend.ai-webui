# Portless Dev Environment — Dev Plan

## Spec Reference

- Spec: [`.specs/FR-2320-portless-dev-environment/spec.md`](./spec.md)
- Epic: [FR-2320 — Portless integration for dev environment](https://lablup.atlassian.net/browse/FR-2320)
- Source issues: FR-2304, GitHub #5986
- Spec task (already implemented, PR #6030): FR-2321

## Overview

The epic replaces the legacy port-offset–based local dev configuration (`scripts/dev-config.js`, `BAI_WEBUI_DEV_PORT_OFFSET`) with [Portless](https://github.com/vercel-labs/portless). After this work, `pnpm run dev`, `pnpm run wsproxy`, and `pnpm run storybook` all run behind named `.localhost` URLs derived from the project directory name (e.g. `http://webui.localhost:1355`).

The work is split into **two consolidated sub-tasks**, grouped by concern rather than by file:

1. **FR-2701** adds Portless as the default path while keeping the legacy flow reachable via `PORTLESS=0`.
2. **FR-2702** removes the legacy flow after FR-2701 is merged.

This grouping is chosen so that each PR is reviewer-friendly (one coherent concern per PR) and **partial-merge safe**: bottom-up in a Graphite stack, each PR independently leaves `main` in a working state.

## Sub-task Table

| Key | Title | Depends on | Affected files | Branch |
|-----|-------|-----------|----------------|--------|
| [FR-2701](https://lablup.atlassian.net/browse/FR-2701) | Integrate Portless as primary dev path with legacy fallback | — | `package.json`, `packages/backend.ai-ui/package.json`, `src/wsproxy/local_proxy.js`, `DEV_ENVIRONMENT.md`, `README.md`, `CLAUDE.md`, `AGENTS.md`, webui-connection-info skill | `feat/portless-integration` |
| [FR-2702](https://lablup.atlassian.net/browse/FR-2702) | Remove legacy port-offset dev config | FR-2701 | `scripts/dev-config.js` (delete), `scripts/dev-config.test.ts` (delete), `package.json`, `packages/backend.ai-ui/package.json`, `.env.development.local.sample`, `DEV_ENVIRONMENT.md`, `README.md`, `CLAUDE.md`, `AGENTS.md`, webui-connection-info skill | `feat/portless-remove-legacy` |

## Execution Waves

### Wave 1 — FR-2701

Introduce Portless as the default path. Explicitly preserves `scripts/dev-config.js`, `scripts/dev-config.test.ts`, and `BAI_WEBUI_DEV_PORT_OFFSET` so the `PORTLESS=0` escape hatch continues to work.

### Wave 2 — FR-2702

Remove the legacy port-offset system and the `PORTLESS=0` escape hatch. Portless becomes the only supported local dev path.

## Dependency Graph

```
FR-2701 ──blocks──► FR-2702
```

## PR Stack Strategy

Single linear Graphite stack:

```
main ◄── FR-2701 (feat/portless-integration) ◄── FR-2702 (feat/portless-remove-legacy)
```

Merges bottom-up: FR-2701 lands first, then FR-2702.

## Partial-Merge Safety

Each PR must leave `main` in a working state **when merged alone** (bottom-up), per Graphite conventions.

### FR-2701 merged alone (without FR-2702)

- Adds the Portless-based default path for `pnpm run dev`, `pnpm run wsproxy`, and Storybook.
- Does **not** delete `scripts/dev-config.js`, `scripts/dev-config.test.ts`, or `BAI_WEBUI_DEV_PORT_OFFSET`.
- A developer with Portless installed hits the default path and gets the new behavior.
- A developer **without** Portless (or who hasn't run it yet) can set `PORTLESS=0` and fall through to the exact same legacy flow main had before the PR.
- Jest tests for `scripts/dev-config.test.ts` still pass because the source file is untouched.
- Docs describe Portless as the primary path and mention the `PORTLESS=0` legacy fallback, so no instructions become stale.
- **Conclusion:** `main` remains green whether or not FR-2702 ever lands.

### FR-2702 merged on top of FR-2701

- Deletes the legacy files and the `PORTLESS=0` branch only after FR-2701 has made Portless the default and proven it.
- Because FR-2701 is already on `main`, `pnpm run dev` works via Portless from the moment FR-2702 lands; there is no window where the default path is broken.
- FR-2702 would **not** be safe to merge alone on pre-FR-2701 `main`: removing `scripts/dev-config.js` without the Portless wrapper in place would break `pnpm run dev`. Graphite's bottom-up merge rule prevents this scenario.
- **Conclusion:** the stack is safe only in the intended order, which Graphite enforces.

## Risk Notes

- **Portless as external dependency**: if Portless changes its CLI surface, the wrappers in FR-2701 may need adjustment. Mitigated by pinning the documented install version and keeping the `PORTLESS=0` fallback live through FR-2701 (removed only in FR-2702 after the flow has been validated).
- **HMR through proxy**: CRA/Craco HMR is historically sensitive to proxying. Validate HMR end-to-end during FR-2701; if it fails, consider `WDS_SOCKET_PATH` / `CHOKIDAR_USEPOLLING` tweaks before merging.
- **Theme color injection**: Currently sourced from `scripts/dev-config.js`. FR-2701 must reproduce the theme-color export in the Portless path (inline, or by sourcing `dev-config.js env`). Once FR-2702 deletes `dev-config.js`, the inline path is the only one left — verify it before merging FR-2702.
- **wsproxy dynamic ports (10000–30000)**: Portless cannot manage these. Document in FR-2701's rewrite of `DEV_ENVIRONMENT.md` as an accepted architectural constraint of V1 proxy mode.
- **Safari `.localhost` resolution**: requires `sudo portless hosts sync`. Must be called out prominently in the rewritten `DEV_ENVIRONMENT.md` (FR-2701).
- **Stale `blocks` links from discarded sub-tasks**: FR-2703, FR-2704, FR-2705, FR-2706 were transitioned to "Not Planned" and still carry `blocks` links from the earlier plan. The `$FW_JIRA link` subcommand does not support removal; the links are cosmetic (the target tickets are closed) and can be ignored or cleaned up manually in Jira if desired.
- **Electron dev flow (`pnpm run electron:d`)**: out of scope per spec. FR-2701 docs must state this explicitly.

## Verification

Both sub-tasks must run `bash scripts/verify.sh` before PR submission and include the `=== ALL PASS ===` line in the PR description. FR-2702 additionally must confirm via grep that no references to `BAI_WEBUI_DEV_PORT_OFFSET`, `dev-config`, or `PORTLESS=0` remain in the repo (outside changelogs).
