# App Launcher React Rewrite Dev Plan

## Spec Reference
`.specs/app-launcher-react-rewrite/spec.md`

## Sub-tasks (Implementation Order)

### 1. Add AppLauncher types and useAppLauncherParams hook - #5832
- **Changed files**: `react/src/hooks/useAppLauncherParams.ts` (new)
- **Dependencies**: None
- **Expected PR size**: S (< 100 lines)
- **Description**: Define `AppLauncherParams` and `AppLauncherResources` TypeScript interfaces. Create `useAppLauncherParams()` hook using React Router `useSearchParams` to parse all URL parameters with proper validation (sToken required, case-insensitive sToken/stoken, session_template/sessionTemplate alias, cuda-shares -> cuda.shares mapping).

### 2. Add useTokenAuth hook for sToken authentication - #5833
- **Changed files**: `react/src/hooks/useTokenAuth.ts` (new)
- **Dependencies**: Sub-task 1 (#5832 blocks #5833)
- **Expected PR size**: M (100-200 lines)
- **Description**: Extract client init + token login + project info preparation from `EduAppLauncher.tsx` into a hook. Encapsulates `_initClient`, `_token_login`, `_prepareProjectInformation`. Returns `authenticate()` function and status/error state. Keeps `globalThis.backendaiclient` pattern per spec. Uses `fetchAndParseConfig` for proxy URL config. Uses existing i18n keys (`eduapi.CannotAuthorizeSessionByToken`, `eduapi.CannotInitializeClient`).

### 3. Add useSessionResolver hook for session find/create logic - #5834
- **Changed files**: `react/src/hooks/useSessionResolver.ts` (new)
- **Dependencies**: Sub-tasks 1, 2 (#5832, #5833 block #5834)
- **Expected PR size**: M (200-300 lines)
- **Description**: Extract session resolution logic from `EduAppLauncher.tsx`. Handles both paths: direct session_id use and template-based session creation (list sessions, match template, check image/status, create if needed with mounts/bootstrap_script/resources). Returns `resolveSession()` function and status/sessionId/appName state. Uses existing i18n keys (`eduapi.NoSessionTemplate`, `eduapi.CannotCreateSessionWithDifferentImage`, etc.).

### 4. Add AppLauncherFlow component with step-based UI - #5835
- **Changed files**: `react/src/components/AppLauncherFlow.tsx` (new), `resources/i18n/en.json` (add step description keys)
- **Dependencies**: Sub-tasks 1, 2, 3 (#5832, #5833, #5834 block #5835)
- **Expected PR size**: M (150-250 lines)
- **Description**: Orchestrator component with 3-step visible UI: Authenticating -> Finding Session -> Launching App. Uses Ant Design `Steps` component in a centered card. Integrates `useAppLauncherParams`, `useTokenAuth`, `useSessionResolver`, and `openWsproxy`/`connectToProxyWorker` from `appLauncherProxy.ts`. Shows error states with retry button. Auto-redirects on success via `window.open(url, '_self')`.

### 5. Rewrite EduAppLauncherPage to use AppLauncherFlow - #5836
- **Changed files**: `react/src/pages/EduAppLauncherPage.tsx` (rewrite), `react/src/components/EduAppLauncher.tsx` (delete)
- **Dependencies**: Sub-task 4 (#5835 blocks #5836)
- **Expected PR size**: S (< 50 lines net change)
- **Description**: Replace lazy-loaded `EduAppLauncher` with `AppLauncherFlow` in the page component. Remove the old 454-line `EduAppLauncher.tsx`. Verify routes (`/applauncher`, `/edu-applauncher`) and login orchestration skip behavior remain intact.

### 6. Add E2E tests for full Edu App Launcher flow
- **Changed files**: `e2e/app-launcher/app-launcher-edu-flow.spec.ts` (new), `e2e/utils/stoken-helper.ts` (new)
- **Dependencies**: Sub-task 5 (#5836) — full implementation must be complete
- **Expected PR size**: M (200-400 lines)
- **Description**: Add end-to-end tests that exercise the complete `/applauncher` flow with a real Backend.AI cluster. Includes:
  - **sToken helper** (`e2e/utils/stoken-helper.ts`): Utility to generate HMAC-SHA256 signed tokens from access key + secret key, matching the Backend.AI manager's verification algorithm.
  - **Tier 2 tests** (auth-only): Valid sToken authentication succeeds past step 1, invalid sToken shows error.
  - **Tier 3 tests** (full flow): Direct `session_id` path launches app and redirects; template-based path creates session and launches app; template reuse path finds existing session.
  - **Error scenario tests**: Missing template, image mismatch, non-RUNNING session status.
  - **Tags**: `@edu-flow`, `@requires-backend`, `@requires-session-template`
  - **Environment**: Requires `BAI_ACCESS_KEY`, `BAI_SECRET_KEY`, `BAI_ENDPOINT`, `BAI_SESSION_TEMPLATE` environment variables.
  - **Test setup/teardown**: Creates session template in `beforeAll`, cleans up sessions and template in `afterAll`.

## PR Stack Strategy
- Sequential: 1 -> 2 -> 3 -> 4 -> 5 -> 6
- Stack name: `feature/app-launcher-react-rewrite`

## Dependency Graph
```
#5832 (types + params hook)
  |
  v
#5833 (useTokenAuth)
  |
  v
#5834 (useSessionResolver)
  |
  v
#5835 (AppLauncherFlow UI)
  |
  v
#5836 (page integration + cleanup)
  |
  v
#TBD  (E2E tests for full edu flow)
```

## Key Files Reference
| File | Role |
|------|------|
| `react/src/components/EduAppLauncher.tsx` | Current implementation (454 lines) - to be replaced |
| `react/src/pages/EduAppLauncherPage.tsx` | Current page wrapper - to be rewritten |
| `react/src/helper/appLauncherProxy.ts` | Standalone proxy utilities - reused as-is |
| `react/src/hooks/useBackendAIAppLauncher.tsx` | Relay-based app launcher hook - NOT used (requires fragment) |
| `react/src/hooks/useLoginOrchestration.ts` | Skips orchestration for applauncher routes - no changes |
| `react/src/hooks/useApiEndpoint.ts` | Resolves API endpoint from localStorage/config - reused |
| `react/src/hooks/useWebUIConfig.ts` | Config atoms including `fetchAndParseConfig` - reused |
| `react/src/routes.tsx` | Route definitions - no changes needed |
| `resources/i18n/en.json` | i18n keys under `eduapi.*` - reuse existing, add step descriptions |
| `e2e/app-launcher/app-launcher-page.spec.ts` | E2E: step-based UI tests (Tier 1, no backend) |
| `e2e/app-launcher/app-launcher-edu-flow.spec.ts` | E2E: full edu flow tests (Tier 2+3, requires backend) — NEW |
| `e2e/utils/stoken-helper.ts` | E2E: sToken HMAC-SHA256 generation utility — NEW |

## Backend.AI API Contract

### Authentication Flow (useTokenAuth)
1. **Init client**: Create `BackendAIClientConfig` with `'SESSION'` auth mode, then `BackendAIClient` instance
2. **Config proxy**: Read `config.toml` via `fetchAndParseConfig` for `wsproxy.proxyURL`
3. **Version check**: `client.get_manager_version()` to verify connectivity
4. **Token login**: `client.token_login(sToken, extraParams)` → `POST /server/token-login`
5. **Project info**: GraphQL query for `user { email, groups { name, id } }` to populate group/project caches

### Session Resolution Flow (useSessionResolver)
1. **Direct session_id**: Skip to app launch via `openWsproxy(client, sessionId, app)`
2. **Template-based**:
   a. List sessions via `client.computeSession.list(fields, statusList, accessKey, limit, offset)`
   b. List templates via `client.sessionTemplate.list(false)` and filter by name
   c. Match existing session's image against template's `spec.kernel.image`
   d. If no match → create via `client.createSessionFromTemplate(templateId, null, null, resources, timeout)`
   e. Launch app via `openWsproxy(client, sessionId, parsedAppName)`

### App Launch Flow (appLauncherProxy.ts)
1. Determine wsproxy version (v1 for Electron, v2 for web)
2. V1: `PUT /conf` to configure proxy → `GET proxy/{token}/{session}/add?app=<name>`
3. V2: `computeSession.startService()` → `GET v2/proxy/{token}/{session}/add?app=<name>`
4. `connectToProxyWorker()` to get final redirect URL
5. `window.open(url, '_self')` to redirect user

## Risks and Notes
- The sToken auth flow inherently requires imperative `globalThis.backendaiclient` usage. The spec acknowledges this. The hooks will wrap this pattern but cannot eliminate it.
- `appLauncherProxy.ts` is used as-is. No modifications to its internals per spec's out-of-scope section.
- Backward compatibility with all URL parameter formats is critical. The `useAppLauncherParams` hook must be thoroughly tested for edge cases.
- The `_createEduSession` logic is the most complex part (Sub-task 3). It involves session listing, template matching, image comparison, and conditional session creation with mounts/credentials.
- Token name may be configurable via `config.api.auth_token_name` (defaults to `sToken`).

### E2E Testing Risks
- **sToken signing algorithm**: The HMAC-SHA256 double-signing (signingKey = HMAC(secret, date), signature = HMAC(signingKey, hostname)) must exactly match the Backend.AI manager implementation. Any drift will cause auth failures in E2E tests. Reference: `backend.ai/src/ai/backend/manager/` token verification code.
- **Session creation latency**: Template-based session creation can take 30s-3min depending on image availability and resource scheduling. E2E tests need generous timeouts (5-10 min for beforeAll) and cleanup strategies.
- **AppProxy availability**: The full flow requires AppProxy (coordinator + worker) to be running. Tests should detect and skip gracefully if proxy is not available.
- **Resource contention**: E2E sessions consume compute resources. Tests must clean up sessions in afterAll and use unique session name prefixes (e.g., `e2e-edu-flow-`) for safe cleanup of leaked sessions.
- **Environment-specific**: Full flow tests require specific env vars (`BAI_ACCESS_KEY`, `BAI_SECRET_KEY`, etc.) and will be skipped in CI environments that don't have a Backend.AI cluster.
