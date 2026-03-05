# Test Plan: Endpoint URL Normalization (FR-2199)

## Overview

**Bug**: Endpoints with trailing slashes (e.g., `http://127.0.0.1:8090/`) caused double-slash
in API request URLs (e.g., `http://127.0.0.1:8090//func/...`), resulting in login failure.

**Fix**:
1. `LoginView.tsx` - `resolveEndpoint()` now strips trailing slashes via `.replace(/\/+$/, '')`
2. `LoginView.tsx` - `handleSubmit()` now passes the validated `ep` to `connectUsingSession()`
   and `connectUsingAPI()` (previously ignored)
3. `backend.ai-client-esm.ts` - `ClientConfig` constructor strips trailing slashes before
   constructing request URLs

**Regression risk**: Any change to endpoint handling in the login flow.

---

## Test Files

| File | Type | Purpose |
|------|------|---------|
| `e2e/auth/login.spec.ts` | E2E (Playwright) | Extend with trailing slash scenarios |
| `src/lib/backend.ai-client-esm.test.ts` | Unit (Jest) | Verify `ClientConfig` normalization |

---

## E2E Test Scenarios (Playwright)

Target file: `e2e/auth/login.spec.ts`
Test describe: `Endpoint URL normalization`
Tags: `@regression`, `@auth`, `@functional`

### Scenario 1: Login with single trailing slash on endpoint
**Actor**: User
**Precondition**: Session-based login mode, empty apiEndpoint in config
**Steps**:
1. Navigate to login page
2. Fill valid credentials (admin email + password)
3. Expand Advanced section and enter endpoint with trailing slash: `{webServerEndpoint}/`
4. Click Login button
**Expected**: Redirect to `/start`, breadcrumb shows "Start" — confirms no double-slash error

### Scenario 2: Login with multiple trailing slashes on endpoint
**Actor**: User
**Precondition**: Same as Scenario 1
**Steps**:
1. Navigate to login page
2. Fill valid credentials
3. Enter endpoint with multiple trailing slashes: `{webServerEndpoint}///`
4. Click Login button
**Expected**: Redirect to `/start` — all trailing slashes are stripped

### Scenario 3: No API request contains double-slash after normalization
**Actor**: User
**Precondition**: Network request interception enabled
**Steps**:
1. Navigate to login page
2. Intercept all outgoing requests
3. Login with trailing-slash endpoint
4. Inspect captured API request URLs
**Expected**: No captured URL contains `//` after the protocol part (`://`)

---

## Unit Test Scenarios (Jest)

Target file: `src/lib/backend.ai-client-esm.test.ts`
Test class: `ClientConfig`

### Scenario U1: Single trailing slash is stripped
- Input: `new ClientConfig('key', 'secret', 'http://api.example.com/', 'API')`
- Expected: `config._endpoint === 'http://api.example.com'`

### Scenario U2: Multiple trailing slashes are stripped
- Input: endpoint = `'http://api.example.com///'`
- Expected: `config._endpoint === 'http://api.example.com'`

### Scenario U3: Endpoint without trailing slash is unchanged
- Input: endpoint = `'http://api.example.com'`
- Expected: `config._endpoint === 'http://api.example.com'`

### Scenario U4: Endpoint with path component — only trailing slash stripped
- Input: endpoint = `'http://api.example.com/v2/'`
- Expected: `config._endpoint === 'http://api.example.com/v2'`

### Scenario U5: Default endpoint is used when none provided
- Input: `new ClientConfig('key', 'secret', undefined, 'API')`
- Expected: `config._endpoint === 'https://api.backend.ai'`

### Scenario U6: `_endpointHost` is derived from the normalized endpoint
- Input: endpoint = `'https://api.example.com/'`
- Expected: `config._endpointHost === 'api.example.com'`

---

## Out of Scope

- API mode login with trailing slash (same normalization path; covered transitively)
- Electron app login (separate build path; not covered by Playwright E2E)
- Test that Backend.AI server rejects double-slash requests (server behavior, not WebUI)
