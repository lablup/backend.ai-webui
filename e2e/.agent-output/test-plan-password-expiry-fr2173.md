# Test Plan: Password Expiry Flow (FR-2173)

## Overview

**Issue:** FR-2173 — Password change modal blocked by login modal on password expiry.

**Root cause:** When a user's password has expired, the backend responds to `POST /server/login`
with `authenticated: false` and `data.details` beginning with `"Password expired on "`.
The app then shows a `ResetPasswordRequiredInline` modal (zIndex 1002) while keeping the login
`BAIModal` open in the background. Before the fix, the login modal's mask overlay and wrapper
remained visible, visually blocking the password change modal.

**Fix:** When `needToResetPassword` is true, the login `BAIModal` receives:
- `mask={false}` — mask overlay is removed
- `styles.wrapper = { display: 'none' }` — the dialog wrapper is hidden

This allows the password change modal to appear above the login modal without obstruction.

## Mock Strategy

Playwright route interception is used to simulate the password-expired backend response without
requiring a real account with an expired password.

**Mocked endpoints:**

| Endpoint | Mock response | Purpose |
|---|---|---|
| `POST **/server/login` | `{ authenticated: false, data: { type: '...password-expired', title: '...', details: 'Password expired on ...' } }` | Trigger the password expiry flow |
| `POST **/server/update-password-no-auth` | `{ result: 'ok' }` | Simulate successful password update |

All other backend calls (`GET /`, `POST /server/login-check`) are passed through to the real cluster.

## Flow: Login → Password Expiry

```
User fills credentials & clicks Login
  ↓
connectUsingSession()
  ├── GET / (get_manager_version) → real backend
  ├── POST /server/login-check → real backend (authenticated: false, no session)
  ├── block() → "Connecting to cluster..." shown for ≤2s
  └── POST /server/login → MOCKED → { authenticated: false, data: { details: "Password expired on ..." } }
        ↓
      fail_reason = "Password expired on ..."
      handleLoginFailReason() → setNeedToResetPassword(true)
        ↓
      setIsBlockPanelOpen(false), setIsLoading(false)
      isLoginPanelOpen stays true, but:
        - BAIModal mask = false  (no overlay)
        - BAIModal wrapper display: none (hidden)
      ResetPasswordRequiredInline (zIndex 1002) becomes visible
```

## Test Scenarios

### 1. Password change modal appears on expired password (Happy path entry)

**Tag:** `@regression @auth @functional`

**Steps:**
1. Set up config: SESSION mode, empty endpoint
2. Navigate to webui login page
3. Mock `POST **/server/login` → password-expired response
4. Fill credentials (any email / password)
5. Expand Advanced, fill endpoint
6. Click "Login"

**Expected:**
- "Please change your password." title appears (within 10s — allows for the 2s block timer)
- "Update" button is visible

---

### 2. Login modal does not block the password change modal (Core regression test)

**Tag:** `@regression @auth @functional`

**Steps:**
1-6. Same as Scenario 1

**Expected:**
- "Please change your password." text is visible
- `aria-label="Email or Username"` input is **hidden** (login wrapper is display:none)
- `aria-label="Password"` input is **hidden**
- "New password" field is visible and interactive
- "New password (again)" field is visible and interactive

---

### 3. User can cancel the password change modal

**Tag:** `@regression @auth @functional`

**Steps:**
1-6. Same as Scenario 1
7. Click "Close" (×) button on the password change modal

**Expected:**
- "Please change your password." text disappears
- Login form fields (`Email or Username`, `Password`) become visible again

---

### 4. Password change form rejects empty submission

**Tag:** `@regression @auth @functional`

**Steps:**
1-6. Same as Scenario 1
7. Click "Update" without filling any fields

**Expected:**
- Validation error appears (required field)

---

### 5. Password change form rejects a password matching the current one

**Tag:** `@regression @auth @functional`

**Steps:**
1-6. Same as Scenario 1 (with current password = `oldPassword1!`)
7. Fill "New password" with the same value as the current password (`oldPassword1!`)
8. Fill "New password (again)" with the same value
9. Click "Update"

**Expected:**
- "Please enter a password that is different from your current password." error is shown

---

### 6. User can submit a valid new password

**Tag:** `@regression @auth @functional`

**Steps:**
1-6. Same as Scenario 1 (current password = `oldPassword1!`)
7. Mock `POST **/server/update-password-no-auth` → `{ result: 'ok' }`
8. Fill "New password" with a valid, different password (e.g., `NewPassword1!`)
9. Fill "New password (again)" with the same value
10. Click "Update"

**Expected:**
- Password change modal closes (disappears)
- Login is re-attempted (connectUsingSession called again)

---

## Key Implementation Notes

- Tests use `modifyConfigToml` to set `connectionMode: 'SESSION'` with empty endpoint (matching
  the pattern in `e2e/auth/login.spec.ts`).
- Route mock must be registered **before** clicking Login (routes are checked at request time).
- The password change modal appears after up to ~3s due to the 2s block timer + network round trip.
  Use `{ timeout: 10_000 }` on first assertions.
- The login form stays in the DOM (`open` prop stays true, `destroyOnHidden` is not triggered
  because `open` never becomes false). Only the wrapper CSS is toggled.
- The Close (×) button on `ResetPasswordRequiredInline` is the default Ant Design Modal close
  button with `aria-label="Close"`.
