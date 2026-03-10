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

## PR Stack Strategy
- Sequential: 1 -> 2 -> 3 -> 4 -> 5
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

## Risks and Notes
- The sToken auth flow inherently requires imperative `globalThis.backendaiclient` usage. The spec acknowledges this. The hooks will wrap this pattern but cannot eliminate it.
- `appLauncherProxy.ts` is used as-is. No modifications to its internals per spec's out-of-scope section.
- Backward compatibility with all URL parameter formats is critical. The `useAppLauncherParams` hook must be thoroughly tested for edge cases.
- The `_createEduSession` logic is the most complex part (Sub-task 3). It involves session listing, template matching, image comparison, and conditional session creation with mounts/credentials.
