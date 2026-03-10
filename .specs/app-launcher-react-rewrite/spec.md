# App Launcher React Rewrite

## Overview

Rewrite the existing `EduAppLauncher` component and `/applauncher` route to follow modern React patterns. The current implementation uses legacy `globalThis.backendaiclient` patterns with imperative code. The goal is to make it idiomatic React with proper hooks, state management, and UI feedback.

## Background

The `/applauncher` route enables external portals (e.g., education portals) to launch specific apps (JupyterLab, etc.) for Backend.AI sessions via URL parameters. An admin can generate a URL with an sToken (HMAC-signed credential), and when a user clicks the link, the WebUI:

1. Authenticates via the sToken (token-based login)
2. Finds or creates a compute session
3. Launches the requested app (e.g., JupyterLab) and redirects the user to it

### Example URL

```
/applauncher?sToken=BackendAI+signMethod%3DHMAC-SHA256%2C+credential%3DAKIAIOSFODNN7EXAMPLE%3A...&api_version=v7.20230615&date=2023-08-15+13%3A49%3A13.888434%2B00%3A00&endpoint=10.20.30.10%3A8081&session_id=d55813d5-ea62-4678-9d02-d9f078c2d28d&app=jupyterlab
```

### URL Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `sToken` | Yes | HMAC-SHA256 signed credential for authentication |
| `api_version` | No | Backend.AI API version |
| `date` | No | Request timestamp |
| `endpoint` | No | Backend.AI manager endpoint |
| `session_id` | No | Existing session ID to launch app on (if omitted, creates new session) |
| `app` | No | App to launch (default: `jupyter`). e.g., `jupyterlab`, `jupyter`, `vscode` |
| `session_template` / `sessionTemplate` | No | Session template name for new session creation |
| `cpu` / `mem` / `shmem` / `cuda-shares` / `cuda-device` | No | Resource allocation for new sessions |

## Current State (Problems)

1. **Legacy client pattern**: Uses `globalThis.BackendAIClient` / `globalThis.backendaiclient` directly instead of React context/hooks
2. **No UI feedback**: The component renders `<></>` (empty fragment) with no loading/error/progress states visible to the user
3. **Imperative flow**: All logic is in a single `_launch()` function chain inside `useEffect`, not decomposed into React-friendly hooks
4. **Duplicated proxy code**: `appLauncherProxy.ts` duplicates logic from `useBackendAIAppLauncher.tsx`
5. **No error boundary integration**: Uses custom `_dispatchNotification` instead of React error patterns
6. **Missing React Router integration**: Doesn't use `useSearchParams` for URL parameter handling

## Target State

### Architecture

```
/applauncher route
  -> AppLauncherPage (page component)
    -> useAppLauncherParams() - parse & validate URL search params
    -> AppLauncherFlow (flow orchestrator component)
      -> Step 1: Token Authentication (useTokenAuth hook)
      -> Step 2: Session Resolution (find existing or create new)
      -> Step 3: App Launch (reuse useBackendAIAppLauncher or appLauncherProxy)
      -> UI: Loading states, progress, error display
```

### Key Design Decisions

1. **Use `useSearchParams`** from React Router to parse URL parameters
2. **Step-based UI**: Show the user which step they're on (Authenticating -> Finding Session -> Launching App)
3. **Proper error handling**: Display errors inline with retry options, not just notifications
4. **Reuse existing proxy infrastructure**: Use `appLauncherProxy.ts` (or `useBackendAIAppLauncher`) for the actual app launch, don't duplicate
5. **Keep the legacy client init** for token login since the sToken auth flow requires the imperative client (this is an external auth flow, not the normal login flow)

### UI Design

A centered card/panel showing:
- Current step with progress indicator
- Step descriptions: "Authenticating...", "Finding session...", "Launching JupyterLab..."
- Error state with message and retry button
- Auto-redirect when app URL is ready

### Scope

- Rewrite `EduAppLauncher.tsx` and `EduAppLauncherPage.tsx`
- Keep both `/applauncher` and `/edu-applauncher` routes working
- Add proper TypeScript types for URL parameters
- Add loading/error/success UI states
- Reuse existing `appLauncherProxy.ts` for proxy operations
- Keep backward compatibility with all existing URL parameter formats

### Out of Scope

- Changing the sToken authentication mechanism itself
- Modifying `appLauncherProxy.ts` or `useBackendAIAppLauncher.tsx` internals
- Adding new URL parameters or features
- E2E tests (can be added later)
