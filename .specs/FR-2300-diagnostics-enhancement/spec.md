# Diagnostics System Enhancement Spec

> **Epic**: FR-2300 ([link](https://lablup.atlassian.net/browse/FR-2300))

## Overview

Enhance the existing WebUI diagnostics system with new diagnostic checks (CORS, auto-notification), result export capability, and address logical gaps and quality improvements across the diagnostics architecture. This work spans new features, bug-level logic fixes, test coverage gaps, and structural improvements to the `DiagnosticResult` type system and UI.

## Problem Statement

The diagnostics system (introduced in FR-1957) provides four collapsible sections: CSP, Storage Proxy, Endpoint Connectivity, and Web Server Config. While functional, several gaps have been identified through code review:

- Users must manually navigate to the Diagnostics page to discover critical issues -- there is no proactive notification after login.
- Diagnostic results cannot be exported for sharing with support teams, forcing manual screenshots.
- CORS issues cause silent failures that are not detected by the current checks.
- Several rule functions have incorrect or incomplete logic (e.g., 4xx treated as "reachable", `checkSslMismatch` in the wrong module).
- `configRules.ts` has 8 exported functions but only 1 has unit tests.
- The `DiagnosticResult` type lacks a `category` field, making cross-section filtering impossible.
- The refresh mechanism remounts all sections instead of selectively invalidating caches.
- Passed diagnostic results clutter the UI when users only want to see issues.

## Requirements

### Must Have

#### New Features
- [ ] **Diagnostics Result Export**: An export button on the DiagnosticsPage that downloads all diagnostic results (from all sections) as a JSON file. The export includes timestamp, WebUI version, and all `DiagnosticResult` entries with their resolved severity, id, category, and interpolation values.
- [ ] **Auto-Diagnostics Notification**: After login, run a subset of critical diagnostic checks (endpoint reachability, config SSL mismatch) and display a toast/banner if any critical issues are detected. Only runs for **superadmin** users. The notification links to the Diagnostics page. Users can dismiss the notification for the current session ("Don't show again" per session, not persisted across sessions).
- [ ] **CORS Diagnostics**: Send a preflight (OPTIONS) request to the API endpoint to check if `Access-Control-Allow-Origin` permits requests from the WebUI's origin. Display results within the existing "Endpoint Connectivity" section. Produce a `warning` result if the server does not respond with appropriate CORS headers, and a `passed` result if CORS is correctly configured.

#### Logical Gaps to Fix
- [ ] **Move `checkSslMismatch` to `configRules.ts`**: Relocate `checkSslMismatch` from `endpointRules.ts` to `configRules.ts`. It is config validation logic (comparing two config values), not an endpoint connectivity check. Update all imports accordingly. Update the corresponding test file (`endpointRules.test.ts` -> `configRules.test.ts`).
- [ ] **configRules unit test coverage**: Add unit tests for all untested functions in `configRules.ts`: `checkPlaceholderValues`, `checkConnectionMode`, `checkUrlFields`, `checkResourceLimits` (and `checkGeneralNumericFields`), `checkImageReferences`, `checkPluginConfiguration`. Each function should have tests covering: normal valid input, boundary values, empty/missing input, and error cases.
- [ ] **Endpoint health check 404 handling**: The current endpoint health check treats any `response.status < 500` as reachable, including 404. A 404 response from the API endpoint likely indicates a misconfigured endpoint URL. Produce a `warning`-severity result when the health check returns 404, distinct from the existing `critical` result for unreachable endpoints.
- [ ] **Configurable storage volume threshold**: The 90% storage volume usage threshold in `checkStorageVolumeHealth` is hardcoded. Accept the threshold as a parameter (already has a default parameter `threshold = 90`), and allow it to be configured via `config.toml` (e.g., `[resources] storageWarningThreshold`). The hook `useStorageProxyDiagnostics` should read this config value and pass it to the rule function.
- [ ] **CSP `frame-src` check**: Add a new rule function `checkCspFrameSrc` in `cspRules.ts` that checks whether CSP `frame-src` (falling back to `default-src`) permits the origins needed for iframe-based features (app launcher, file browser). Integrate into the existing CSP diagnostics section. Produce a `warning` if `frame-src` restricts required origins.

#### Improvements
- [ ] **Add `category` field to `DiagnosticResult`**: Extend the `DiagnosticResult` interface with a `category` field typed as `'config' | 'csp' | 'endpoint' | 'storage'`. All existing rule functions and hooks must populate this field. This enables cross-section filtering and is required by the export feature to group results.
- [ ] **Toggle passed results**: Add a UI toggle (switch or checkbox) on the DiagnosticsPage to hide `passed`-severity results and show only issues (`critical`, `warning`, `info`). Default state: show all results. The toggle state does not persist across page navigations.

### Nice to Have

- [ ] **Deduplicate data sources**: Both `useWebServerConfigDiagnostics` and `useEndpointDiagnostics` independently read `apiEndpoint` from `baiClient._config.endpoint`. Extract this into a shared hook or context to avoid redundant access and ensure consistency.
- [ ] **Smarter refresh**: Replace the current `refreshKey` increment approach (which remounts all sections and clears all caches) with TanStack Query's `invalidateQueries` for finer-grained cache invalidation. Each section should be independently refreshable without affecting other sections' cached data.

## User Stories

- As an **administrator**, I want to export all diagnostic results as a JSON file so that I can share them with the support team without taking screenshots.
- As a **superadmin**, I want to be notified of critical diagnostic issues immediately after login so that I don't miss configuration problems that cause silent failures.
- As a **superadmin**, I want to dismiss the auto-diagnostics notification for the rest of my session so that it does not repeatedly interrupt my work.
- As an **administrator**, I want CORS issues to be detected in the Endpoint Connectivity section so that I can identify cross-origin configuration problems before they cause failures in the app.
- As an **administrator**, I want to toggle off passed diagnostic results so that I can focus only on items that need attention.
- As a **developer**, I want comprehensive unit tests for all `configRules.ts` functions so that config validation logic is protected against regressions.
- As a **developer**, I want `checkSslMismatch` in the correct module (`configRules.ts`) so that the codebase organization reflects actual usage patterns.
- As a **developer**, I want a `category` field on `DiagnosticResult` so that I can filter and group results programmatically without relying on section boundaries.

## Acceptance Criteria

### Diagnostics Result Export
- [ ] An "Export" button is visible on the DiagnosticsPage next to the existing "Refresh" button.
- [ ] Clicking the button downloads a `.json` file containing all diagnostic results from all sections.
- [ ] The exported JSON includes: `exportedAt` (ISO timestamp), `webuiVersion` (string), and `results` (array of objects with `id`, `severity`, `category`, `titleKey`, `descriptionKey`, `interpolationValues`).
- [ ] The export works correctly when some sections are loading or have errors (exports available results, notes unavailable sections).

### Auto-Diagnostics Notification
- [ ] After successful login, critical diagnostic checks (endpoint reachability, SSL mismatch) run automatically **only for superadmin users**.
- [ ] Non-superadmin users do not trigger auto-diagnostics and never see the notification.
- [ ] If any check returns `critical` severity, a toast or banner notification appears.
- [ ] The notification includes a link/button to navigate to the Diagnostics page.
- [ ] The notification can be dismissed, and once dismissed, does not reappear for the remainder of the browser session.
- [ ] If no critical issues are found, no notification is shown.
- [ ] The auto-diagnostics checks do not block or delay the login flow -- they run asynchronously after the main UI loads.

### CORS Diagnostics
- [ ] An OPTIONS preflight request is sent to the configured API endpoint.
- [ ] If the response includes `Access-Control-Allow-Origin` that permits the WebUI's origin, a `passed` result is shown.
- [ ] If the response does not include appropriate CORS headers, a `warning` result is shown with remediation guidance.
- [ ] If the OPTIONS request fails entirely (network error, timeout), the result explains the failure.
- [ ] CORS check results appear within the "Endpoint Connectivity" collapsible section.
- [ ] A pure rule function in `endpointRules.ts` evaluates the pre-fetched CORS response (consistent with existing architecture).

### checkSslMismatch Relocation
- [ ] `checkSslMismatch` is exported from `configRules.ts`, not `endpointRules.ts`.
- [ ] All imports of `checkSslMismatch` reference `configRules.ts`.
- [ ] Tests for `checkSslMismatch` are in `configRules.test.ts`.
- [ ] `endpointRules.ts` no longer exports `checkSslMismatch`.
- [ ] No functional behavior change -- all existing tests pass.

### configRules Unit Test Coverage
- [ ] `checkPlaceholderValues`: Tests cover configs with no placeholders, single placeholder, multiple placeholders across sections, non-object sections, empty config.
- [ ] `checkConnectionMode`: Tests cover valid modes (API, SESSION), invalid mode string, case insensitivity, SESSION mode with matching URLs, SESSION mode with mismatched URLs, placeholder input.
- [ ] `checkUrlFields`: Tests cover valid URLs, invalid URLs, missing sections, placeholder URLs (skipped), empty/blank values, mixed valid and invalid.
- [ ] `checkResourceLimits`: Tests cover values within range, below min, above max, missing fields, non-numeric values, boundary values (exact min/max).
- [ ] `checkGeneralNumericFields`: Tests cover the same patterns as `checkResourceLimits` for `[general]` section fields.
- [ ] `checkImageReferences`: Tests cover valid image references (registry/namespace:tag@arch), invalid formats, empty/blank values, placeholder values (skipped).
- [ ] `checkPluginConfiguration`: Tests cover valid plugin names, invalid plugin names (special chars), valid JS filenames, invalid JS filenames, comma-separated page values, placeholder values (skipped).

### Endpoint Health Check 404 Handling
- [ ] A 404 response from the API endpoint produces a `warning`-severity result (not `passed`).
- [ ] The warning result has a distinct `id` (e.g., `endpoint-not-found`) and descriptive i18n keys.
- [ ] Non-404 responses below 500 (e.g., 200, 401, 403) continue to be treated as reachable.
- [ ] Unit tests cover 200, 401, 403, 404, and 500 response scenarios.

### Configurable Storage Threshold
- [ ] `checkStorageVolumeHealth` continues to accept `threshold` as a parameter with default `90`.
- [ ] `useStorageProxyDiagnostics` reads a threshold value from config (e.g., `[resources] storageWarningThreshold`).
- [ ] If the config value is absent, the default 90% threshold is used.
- [ ] If the config value is present and valid (number between 1-100), it is used as the threshold.

### CSP frame-src Check
- [ ] A new `checkCspFrameSrc` function exists in `cspRules.ts`.
- [ ] It checks `frame-src` directive, falling back to `default-src` per CSP spec.
- [ ] It verifies that the API endpoint origin is permitted for iframe embedding.
- [ ] Unit tests cover: frame-src present and allowing, frame-src present and blocking, frame-src absent with default-src fallback, no CSP.

### DiagnosticResult category Field
- [ ] `DiagnosticResult` interface includes `category: 'config' | 'csp' | 'endpoint' | 'storage'`.
- [ ] All rule functions in `configRules.ts` produce results with `category: 'config'`.
- [ ] All rule functions in `cspRules.ts` produce results with `category: 'csp'`.
- [ ] All rule functions in `endpointRules.ts` produce results with `category: 'endpoint'`.
- [ ] All rule functions in `storageProxyRules.ts` produce results with `category: 'storage'`.
- [ ] Hooks that produce inline `passed` results also include the appropriate `category`.

### Toggle Passed Results
- [ ] A toggle control is visible on the DiagnosticsPage.
- [ ] When toggled on (hide passed), only `critical`, `warning`, and `info` results are displayed.
- [ ] When toggled off (show all), all results including `passed` are displayed.
- [ ] The toggle defaults to showing all results.
- [ ] The toggle state resets on page navigation (not persisted).

## Out of Scope

- **API Version Compatibility Check**: Checking WebUI vs Backend.AI Manager version compatibility is deferred. This requires defining a version compatibility matrix and coordination with the backend team.
- **WebSocket Connection Diagnostics**: Testing actual WebSocket handshake with wsproxy is deferred. This requires careful handling of WebSocket lifecycle and may need backend changes for a health-check endpoint.
- **Persisting auto-diagnostics dismissal across sessions**: The "Don't show again" behavior is per-session only. Cross-session persistence (e.g., localStorage with TTL) is out of scope.
- **Real-time diagnostics monitoring**: Continuous background polling or WebSocket-based live diagnostics updates.
- **Diagnostics for individual user sessions**: The diagnostics system checks system-wide configuration, not per-user session health.
- **Export format selection**: Only JSON export is in scope. CSV, PDF, or other formats are not included.
- **i18n of exported content**: Exported JSON uses i18n keys, not resolved translations. Resolving translations in the export is out of scope.

## Technical Context

### Existing Architecture

The diagnostics system follows a layered architecture:

1. **Type system**: `DiagnosticResult` with severity levels (`critical`, `warning`, `info`, `passed`) in `react/src/types/diagnostics.ts`
2. **Pure rule functions**: Stateless functions in `react/src/diagnostics/rules/` that take data and return `DiagnosticResult | null` or `DiagnosticResult[]`
3. **Hooks**: Compose rule functions with data fetching (`useEndpointDiagnostics`, `useCspDiagnostics`, `useStorageProxyDiagnostics`, `useWebServerConfigDiagnostics`)
4. **UI**: `DiagnosticsPage` with `Collapse` sections, each rendering a section component that uses its corresponding hook

### Key Files

- `react/src/types/diagnostics.ts` -- DiagnosticResult type definition
- `react/src/diagnostics/rules/configRules.ts` -- 8 exported functions, 1 tested
- `react/src/diagnostics/rules/endpointRules.ts` -- checkSslMismatch (to be moved), checkEndpointReachability
- `react/src/diagnostics/rules/cspRules.ts` -- CSP directive parsing and checks
- `react/src/diagnostics/rules/storageProxyRules.ts` -- Storage volume health check
- `react/src/pages/DiagnosticsPage.tsx` -- Main page with 4 collapsible sections
- `react/src/hooks/useEndpointDiagnostics.ts` -- Endpoint health check via TanStack Query
- `react/src/hooks/useWebServerConfigDiagnostics.ts` -- Config validation hook

### Existing Test Coverage

- `configRules.test.ts` -- Only `checkBlocklistValidity` (1 of 8 functions)
- `endpointRules.test.ts` -- `checkSslMismatch`, `checkEndpointReachability` (complete)
- `cspRules.test.ts` -- All CSP rule functions (complete)
- `storageProxyRules.test.ts` -- `checkStorageVolumeHealth` (complete)

## Related Issues

- FR-1957: Diagnostics system initial implementation (source context)
