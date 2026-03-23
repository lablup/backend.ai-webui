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

## E2E Testing Discoveries (2026-03-19)

### sToken Authentication Flow (from backend.ai codebase analysis)
- **Token format**: `BackendAI signMethod=HMAC-SHA256, credential=<accessKey>:<signature>`
- **Signing algorithm**: Double-HMAC-SHA256
  1. `signingKey = HMAC-SHA256(secretKey, dateString)` where dateString = `YYYY-MM-DD`
  2. `signature = HMAC-SHA256(signingKey, hostname)` where hostname is extracted from the endpoint URL
- **Token login endpoint**: `POST /server/token-login` with sToken + extra URL params
- **No edu-specific session type**: Backend.AI uses standard `INTERACTIVE` sessions for education; the edu flow is purely a WebUI concern

### Backend Infrastructure for E2E
- **AppProxy** has two tiers: Coordinator (routing authority, circuit management) and Worker (actual HTTP/WebSocket proxying)
- Manager communicates with AppProxy via `AppProxyClient.create_endpoint()` / `delete_endpoint()`
- Session status lifecycle: PENDING → SCHEDULED → PREPARING → PULLING → PREPARED → CREATING → RUNNING
- **Session template API**: `GET /session_template/` lists templates, `POST /session/_/create-from-template` creates from template
- **Education API helpers** (`backendaiclient.eduApp`): `get_mount_folders()`, `get_user_projects()`, `get_user_credential(sToken)`

### Existing E2E Patterns to Reuse
- `SessionLauncher` class handles session creation/termination with unique naming and cleanup
- `loginAsUser()` and `modifyConfigToml()` utilities for test setup
- `waitForTtydTerminal()` pattern for polling proxy readiness with reload-on-failure
- Serial test configuration (`test.describe.configure({ mode: 'serial' })`) for shared session state
- Tags: `@regression`, `@app-launcher`, `@functional` for filtering

## Issues Encountered
| Date | Problem | Root Cause | Resolution | Issue |
|------|---------|-----------|------------|-------|
