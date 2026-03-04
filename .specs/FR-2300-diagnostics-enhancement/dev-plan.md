# Diagnostics System Enhancement Dev Plan

## Spec Reference
`.specs/FR-2300-diagnostics-enhancement/spec.md`

## Epic: FR-2300

## Sub-tasks (Implementation Order)

### 1. Add `category` field to `DiagnosticResult` type and populate across all rules and hooks
- **Changed files**: `react/src/types/diagnostics.ts`, `react/src/diagnostics/rules/configRules.ts`, `react/src/diagnostics/rules/endpointRules.ts`, `react/src/diagnostics/rules/cspRules.ts`, `react/src/diagnostics/rules/storageProxyRules.ts`, `react/src/hooks/useEndpointDiagnostics.ts`, `react/src/hooks/useCspDiagnostics.ts`, `react/src/hooks/useStorageProxyDiagnostics.ts`, `react/src/hooks/useWebServerConfigDiagnostics.ts`
- **Dependencies**: None
- **Expected PR size**: M (100-200 lines)
- **Description**: Add `category: 'config' | 'csp' | 'endpoint' | 'storage'` to `DiagnosticResult` interface. Update every rule function return value and every inline `passed` result in hooks to include the appropriate `category`. Update existing tests to include the field in assertions. This is foundational -- export and filtering features depend on it.

### 2. Move `checkSslMismatch` from `endpointRules.ts` to `configRules.ts`
- **Changed files**: `react/src/diagnostics/rules/configRules.ts`, `react/src/diagnostics/rules/endpointRules.ts`, `react/src/diagnostics/rules/__tests__/configRules.test.ts`, `react/src/diagnostics/rules/__tests__/endpointRules.test.ts`, `react/src/hooks/useEndpointDiagnostics.ts`, `react/src/hooks/useWebServerConfigDiagnostics.ts`
- **Dependencies**: Sub-task 1 (category field must exist so the moved function returns category)
- **Expected PR size**: S (< 100 lines)
- **Description**: Move the `checkSslMismatch` function and its tests. Update imports in `useEndpointDiagnostics.ts` (still uses it) and `useWebServerConfigDiagnostics.ts` (already uses it). No behavioral change -- purely organizational.

### 3. Endpoint health check 404 handling
- **Changed files**: `react/src/diagnostics/rules/endpointRules.ts`, `react/src/diagnostics/rules/__tests__/endpointRules.test.ts`, `react/src/hooks/useEndpointDiagnostics.ts`, `resources/i18n/en.json` (i18n keys)
- **Dependencies**: Sub-task 1 (category field)
- **Expected PR size**: S (< 100 lines)
- **Description**: Modify `checkEndpointReachability` (or the hook's query logic) to distinguish 404 from other < 500 statuses. The hook's `queryFn` currently treats `response.status < 500` as reachable -- it needs to return the status code so the rule function can produce a `warning` for 404. Add a new `endpoint-not-found` result ID and i18n keys. Update unit tests for 200, 401, 403, 404, 500 scenarios.

### 4. Add `configRules` unit test coverage (7 untested functions)
- **Changed files**: `react/src/diagnostics/rules/__tests__/configRules.test.ts`
- **Dependencies**: Sub-task 2 (checkSslMismatch tests move here)
- **Expected PR size**: L (300+ lines, test-only)
- **Description**: Add comprehensive tests for `checkPlaceholderValues`, `checkConnectionMode`, `checkUrlFields`, `checkResourceLimits`, `checkGeneralNumericFields`, `checkImageReferences`, `checkPluginConfiguration`. Note: these functions do not yet exist in `configRules.ts` (only `checkBlocklistValidity` exists). This sub-task requires first implementing these 7 functions based on the spec's acceptance criteria, then writing tests. If the functions are to be created as stubs first, this task covers both creation and testing.

### 5. CSP `frame-src` check
- **Changed files**: `react/src/diagnostics/rules/cspRules.ts`, `react/src/diagnostics/rules/__tests__/cspRules.test.ts`, `react/src/hooks/useCspDiagnostics.ts`, `resources/i18n/en.json`
- **Dependencies**: Sub-task 1 (category field)
- **Expected PR size**: M (100-200 lines)
- **Description**: Add `checkCspFrameSrc` function in `cspRules.ts` using the existing `getEffectiveSources` and `matchesCspSource` helpers (note: these are currently module-private -- may need to be exported or the new function placed in the same file). Check `frame-src` with fallback to `default-src`. Integrate into `useCspDiagnostics` hook. Add unit tests.

### 6. Configurable storage volume threshold
- **Changed files**: `react/src/hooks/useStorageProxyDiagnostics.ts`, `react/src/hooks/useWebUIConfig.ts` (or wherever config reading lives), `config.toml.sample`, `resources/i18n/en.json`
- **Dependencies**: Sub-task 1 (category field)
- **Expected PR size**: S (< 100 lines)
- **Description**: The `checkStorageVolumeHealth` function already accepts a `threshold` parameter with default 90. Read `[resources] storageWarningThreshold` from config.toml via the existing `useRawConfig` hook and pass it to the rule function. Add the key to `config.toml.sample` with a comment.

### 7. CORS diagnostics check
- **Changed files**: `react/src/diagnostics/rules/endpointRules.ts`, `react/src/diagnostics/rules/__tests__/endpointRules.test.ts`, `react/src/hooks/useEndpointDiagnostics.ts`, `resources/i18n/en.json`
- **Dependencies**: Sub-task 1 (category field), Sub-task 3 (endpoint rules changes should land first to avoid conflicts)
- **Expected PR size**: M (100-200 lines)
- **Description**: Add `checkCorsHeaders` pure rule function in `endpointRules.ts` that evaluates pre-fetched CORS response data (headers object). In the hook, add a new TanStack Query that sends an OPTIONS preflight request to the API endpoint and checks `Access-Control-Allow-Origin`. Produce `warning` if CORS is misconfigured, `passed` if correct. Handle network errors gracefully.

### 8. Toggle passed results in DiagnosticsPage UI
- **Changed files**: `react/src/pages/DiagnosticsPage.tsx`, `react/src/components/DiagnosticResultList.tsx`, `resources/i18n/en.json`
- **Dependencies**: Sub-task 1 (category field)
- **Expected PR size**: S (< 100 lines)
- **Description**: Add a Switch/Checkbox to DiagnosticsPage that controls whether `passed` results are shown. Pass the filter state down to each section component or handle it at the `DiagnosticResultList` level via a new `hidePassed` prop. Default to showing all. State is local (useState), not persisted.

### 9. Diagnostics result export
- **Changed files**: `react/src/pages/DiagnosticsPage.tsx`, `react/src/hooks/useEndpointDiagnostics.ts`, `react/src/hooks/useCspDiagnostics.ts`, `react/src/hooks/useStorageProxyDiagnostics.ts`, `react/src/hooks/useWebServerConfigDiagnostics.ts`, `resources/i18n/en.json`
- **Dependencies**: Sub-task 1 (category field required in export), Sub-task 8 (UI changes to DiagnosticsPage should land first)
- **Expected PR size**: M (150-250 lines)
- **Description**: Add an "Export" button next to the "Refresh" button on DiagnosticsPage. Collect all `DiagnosticResult[]` from all four section hooks. The page needs access to all results -- currently each section component owns its hook. Refactor to lift hook calls to the page level (or add a new aggregating hook). Build a JSON object with `exportedAt`, `webuiVersion`, and `results` array. Trigger a file download via `Blob` + `URL.createObjectURL`. Handle sections that are still loading or errored.

### 10. Auto-diagnostics notification after login
- **Changed files**: New file `react/src/hooks/useAutoDiagnostics.ts`, `react/src/components/MainLayout.tsx` (or equivalent post-login wrapper), `resources/i18n/en.json`
- **Dependencies**: Sub-task 1 (category field), Sub-task 2 (checkSslMismatch in configRules), Sub-task 3 (endpoint reachability with 404)
- **Expected PR size**: M (150-250 lines)
- **Description**: Create a new hook `useAutoDiagnostics` that runs a subset of critical checks (endpoint reachability, SSL mismatch) after login. Only runs for superadmin users (check `baiClient.is_superadmin`). If any check returns `critical`, show a toast/notification via antd's `notification` API with a link to the Diagnostics page. Use `sessionStorage` to track dismissal (per-session, not persisted). The check runs asynchronously and does not block the login flow. Integrate the hook into the post-login layout component.

### 11. (Nice to Have) Deduplicate data sources
- **Changed files**: `react/src/hooks/useApiEndpoint.ts` (or new shared hook), `react/src/hooks/useEndpointDiagnostics.ts`, `react/src/hooks/useWebServerConfigDiagnostics.ts`, `react/src/hooks/useCspDiagnostics.ts`
- **Dependencies**: Sub-tasks 7, 9, 10 (all endpoint-related changes should land first)
- **Expected PR size**: S (< 100 lines)
- **Description**: Extract `apiEndpoint` reading (`baiClient._config.endpoint`) into a shared hook (possibly `useApiEndpoint` which already exists -- check its current scope). Update all diagnostics hooks to use the shared hook instead of inline access.

### 12. (Nice to Have) Smarter refresh with invalidateQueries
- **Changed files**: `react/src/pages/DiagnosticsPage.tsx`, `react/src/hooks/useEndpointDiagnostics.ts`, `react/src/hooks/useStorageProxyDiagnostics.ts`
- **Dependencies**: Sub-tasks 7, 9 (all query-based hooks should be finalized first)
- **Expected PR size**: M (100-200 lines)
- **Description**: Replace the `refreshKey` increment pattern (which remounts all sections and clears Relay caches) with TanStack Query's `invalidateQueries` for the two TanStack-based hooks. Relay-based hooks (storage proxy) would need a separate approach (e.g., `fetchQuery` with network-only). Each section becomes independently refreshable.

## PR Stack Strategy

### Wave 1 (Foundational, parallel)
- Sub-task 1: category field (foundation for everything)

### Wave 2 (Core fixes, parallel after Wave 1)
- Sub-task 2: Move checkSslMismatch
- Sub-task 3: 404 handling
- Sub-task 5: CSP frame-src check
- Sub-task 6: Configurable storage threshold
- Sub-task 8: Toggle passed results

### Wave 3 (Depends on Wave 2)
- Sub-task 4: configRules unit tests (after Sub-task 2)
- Sub-task 7: CORS diagnostics (after Sub-task 3)

### Wave 4 (Features depending on prior work)
- Sub-task 9: Export (after Sub-task 8)
- Sub-task 10: Auto-diagnostics notification (after Sub-tasks 2, 3)

### Wave 5 (Nice to Have)
- Sub-task 11: Deduplicate data sources
- Sub-task 12: Smarter refresh

## Dependency Graph

```
Sub-task 1 (category field)
  |
  +---> Sub-task 2 (move checkSslMismatch)
  |       |
  |       +---> Sub-task 4 (configRules tests)
  |       +---> Sub-task 10 (auto-diagnostics)
  |
  +---> Sub-task 3 (404 handling)
  |       |
  |       +---> Sub-task 7 (CORS diagnostics)
  |       +---> Sub-task 10 (auto-diagnostics)
  |
  +---> Sub-task 5 (CSP frame-src)
  |
  +---> Sub-task 6 (storage threshold)
  |
  +---> Sub-task 8 (toggle passed)
          |
          +---> Sub-task 9 (export)

Sub-task 9 ──> Sub-task 11 (deduplicate)
Sub-task 7 ──> Sub-task 11 (deduplicate)
Sub-task 7 ──> Sub-task 12 (smarter refresh)
Sub-task 9 ──> Sub-task 12 (smarter refresh)
```

## Risks and Notes

1. **Sub-task 4 (configRules tests)**: The spec references 7 untested functions (`checkPlaceholderValues`, `checkConnectionMode`, `checkUrlFields`, `checkResourceLimits`, `checkGeneralNumericFields`, `checkImageReferences`, `checkPluginConfiguration`), but currently `configRules.ts` only exports `checkBlocklistValidity`. These functions need to be implemented first. This sub-task is larger than typical and may need to be split into "implement functions" and "write tests" if scope is too large.

2. **Sub-task 9 (export)**: Currently each section component internally calls its own hook. To collect all results for export, the page needs direct access to all hook results. This requires refactoring the component hierarchy -- either lifting hooks to the page level or creating an aggregating hook. This has moderate refactoring risk.

3. **Sub-task 10 (auto-diagnostics)**: Needs careful placement in the component tree to run after login but not block rendering. Must identify the correct post-login layout component for integration.

4. **Sub-task 12 (smarter refresh)**: The storage proxy hook uses Relay (`useLazyLoadQuery`), not TanStack Query. Switching to `invalidateQueries` only works for TanStack-based hooks. Relay-based sections need a different invalidation approach, making this more complex than it appears.
