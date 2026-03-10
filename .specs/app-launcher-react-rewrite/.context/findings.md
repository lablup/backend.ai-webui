# App Launcher React Rewrite Findings

## Decisions
| Date | Decision | Rationale | Issue |
|------|----------|-----------|-------|
| 2026-03-10 | Keep globalThis.backendaiclient for token auth | sToken flow requires imperative client init, not the Relay-based hook | All |
| 2026-03-10 | Reuse appLauncherProxy.ts as-is | Spec explicitly marks proxy internals as out of scope | #5835 |
| 2026-03-10 | Sequential PR stack (not parallel) | Each sub-task builds on the previous; all touch the same feature | All |
| 2026-03-10 | Use Ant Design Steps for progress UI | Existing pattern in codebase (SessionLauncherPage uses Steps) | #5835 |

## Discoveries
- Existing i18n keys under `eduapi.*` cover most error messages (7 keys in en.json). New keys needed only for step descriptions.
- `useBackendAIAppLauncher` hook requires a Relay ComputeSessionNode fragment, making it unusable for the token login flow. `appLauncherProxy.ts` provides standalone equivalents.
- `useLoginOrchestration.ts` already has `isAppLauncherPage()` check that skips normal login for `/applauncher` and `/edu-applauncher`. No changes needed.
- `useApiEndpoint` hook resolves endpoint from localStorage then config atom, matching the current `_initClient` fallback logic.

## Issues Encountered
| Date | Problem | Root Cause | Resolution | Issue |
|------|---------|-----------|------------|-------|
