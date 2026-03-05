# No-Project User Dashboard - Comprehensive E2E Test Plan

## Application Overview

**Target Pages**:
- `/credential` (Settings > Users) - User creation and management
- `/dashboard` (accessible via `/summary` redirect) - Main dashboard page

**Feature Under Test**: `useCurrentProjectValue` graceful null/undefined handling (FR-2028) + `BAIBoardItemErrorBoundary` (FR-2044)

**Core Scenario**: A user with NO project assignment logs in and views the dashboard. This is the real-world trigger for the bug fixed in FR-2028 and FR-2044: the old code would crash the entire page when `useCurrentProjectValue` returned null/undefined. The fix ensures that:
- `useCurrentProjectValue` safely returns `{ name: null, id: null }` instead of throwing
- `BAIBoardItemErrorBoundary` catches errors in board items that require project context (`MyResource`, `MyResourceWithinResourceGroup`)
- The dashboard page does NOT full-page crash

### Dashboard Board Items (Regular User View)

When a regular user logs in, they see a subset of board items (no superadmin-only items):

| Item ID | Title | Requires Project? | Error Boundary? |
|---|---|---|---|
| `mySession` | My Sessions | No (scoped to project but handles null) | No |
| `myResource` | My Total Resources Limit | **Yes** - throws if `currentProject.name` is null | **Yes** (`BAIBoardItemErrorBoundary`) |
| `myResourceWithinResourceGroup` | My Resources in [Resource Group] | **Yes** - throws if no resource group | **Yes** (`BAIBoardItemErrorBoundary`) |
| `recentlyCreatedSession` | Recently Created Sessions | No (scoped to project but handles null) | No |

### Error Boundary Behavior When Project Is Null

When `MyResource` throws (because `currentProject.name` is null):
- `BAIBoardItemErrorBoundary` catches the error
- Renders a fallback `<div>` with `data-bai-board-item-status="error"` attribute
- Shows the board item title ("My Total Resources Limit") with an alert icon tooltip
- The rest of the dashboard continues to render normally (no full-page crash)

### User Creation UI (Settings > Users)

- Admin navigates to `/credential` (Settings > Users page)
- "Create User" button opens a dialog
- Required fields: Email, User Name, Password, Confirm Password
- Optional field: Project (can be left empty to create a user with no project)
- After creation, a "Key pair for new users" dialog may or may not appear depending on configuration

---

## Test Infrastructure Notes

- **Cleanup Required**: Yes - the created test user must be deactivated and permanently deleted after all tests
- **Execution Mode**: Serial (tests share state - user created in first test is used in subsequent tests)
- **Tags**: `@critical`, `@regression`, `@dashboard`, `@functional`
- **Test User Email**: `e2e-no-project-test@lablup.com`
- **Test User Password**: `NoProject@Test123`

### Helper Utilities

```typescript
import {
  loginAsAdmin,
  loginAsCreatedAccount,
  logout,
  navigateTo,
  webServerEndpoint,
} from '../utils/test-util';
import {
  KeyPairModal,
  UserSettingModal,
} from '../utils/classes/user/UserSettingModal';
import { PurgeUsersModal } from '../utils/classes/user/PurgeUsersModal';
```

### Shared Constants

```typescript
const EMAIL = 'e2e-no-project-test@lablup.com';
const USERNAME = 'e2e-no-project-test';
const PASSWORD = 'NoProject@Test123';
```

---

## Test Scenarios

### 1. Admin Can Create a User with No Project Assignment

**Seed**: `e2e/no-project-user-seed.spec.ts`

**Assumptions**:
- Admin is logged in
- No user with email `e2e-no-project-test@lablup.com` already exists

#### 1.1 Admin can navigate to the Users management page

**Steps**:
1. Log in as admin using `loginAsAdmin(page, request)`
2. Navigate to `/credential` using `navigateTo(page, 'credential')`
3. Verify the "Users" tab is visible and selected

**Expected Results**:
- URL is `/credential`
- "Users" tab is visible and selected
- User table is visible with existing users
- "Create User" button is visible

#### 1.2 Admin can clean up any pre-existing test user before test run

**Steps**:
1. Check if a row exists in the Active users table filtered by `e2e-no-project-test@lablup.com`
2. If found, click the "Deactivate" button in that row
3. Confirm deactivation in the popconfirm dialog by clicking "Deactivate"
4. Wait for the user row to disappear from the Active list
5. Click "Inactive" radio button to switch to Inactive filter
6. If the user row exists in Inactive, check its checkbox
7. Click the trash bin button to open the Purge Users modal
8. Confirm permanent deletion in the purge modal
9. Wait for the user row to disappear from the Inactive list
10. Click "Active" radio button to return to Active filter

**Expected Results**:
- No test user leftover from previous test runs
- Active user list does not contain `e2e-no-project-test@lablup.com`

#### 1.3 Admin can create a new user without selecting any project

**Steps**:
1. On the Users page (`/credential`), click the "Create User" button
2. Verify the "Create User" dialog opens
3. Fill in the Email field with `e2e-no-project-test@lablup.com`
4. Fill in the User Name field with `e2e-no-project-test`
5. Fill in the Password field with `NoProject@Test123`
6. Fill in the Confirm Password field with `NoProject@Test123`
7. Leave the "Project" field empty (do NOT select any project)
8. Click the "OK" button to submit the form
9. If a "Key pair for new users" dialog appears, close it by clicking "Close"
10. Wait for the Create User dialog to close

**Expected Results**:
- The Create User dialog closes after submission
- A row with email `e2e-no-project-test@lablup.com` appears in the Active users table
- The "Project" column for this user shows no project or an empty value (not "default", "model-store", etc.)

---

### 2. User with No Project Can Log In Successfully

**Assumptions**:
- Test user `e2e-no-project-test@lablup.com` exists in the system (created in Scenario 1)
- The user has no project assignment

#### 2.1 User with no project can log in and reach the application

**Steps**:
1. Log out from the admin session using `logout(page)`
2. Call `loginAsCreatedAccount(page, request, EMAIL, PASSWORD)` to log in as the test user
3. Verify the user dropdown button is visible (indicates successful login)

**Expected Results**:
- Login succeeds without error
- The user dropdown button (`[data-testid="user-dropdown-button"]`) is visible
- The URL is not the login page

#### 2.2 User with no project is redirected to the dashboard

**Steps**:
1. After login, navigate to `/summary` using `navigateTo(page, 'summary')`
2. Wait for the URL to change to `/dashboard`
3. Verify the main content area is visible

**Expected Results**:
- URL changes to `/dashboard` (redirect from `/summary`)
- The `<main>` element is visible
- The page does not crash with a full-page error message

---

### 3. Dashboard Loads Without Full-Page Crash for No-Project User

**Assumptions**:
- User `e2e-no-project-test@lablup.com` is logged in
- User has no project assignment (so `useCurrentProjectValue` returns `{ name: null, id: null }`)

#### 3.1 User with no project sees the dashboard page load without crashing

**Steps**:
1. Navigate to `/summary` using `navigateTo(page, 'summary')`
2. Wait for URL to become `/dashboard` (timeout: 15 seconds)
3. Verify the `<main>` element is present and visible
4. Verify no full-page error text "Something went wrong" is displayed
5. Verify the page header with breadcrumb "Dashboard" is visible

**Expected Results**:
- The dashboard page loads without a full-page crash
- `<main>` element is visible
- No generic error page or "Something went wrong" text is displayed
- The browser does not show an unhandled exception overlay

#### 3.2 User with no project sees the project selector showing no selected project

**Steps**:
1. Navigate to the dashboard (`/dashboard`)
2. Wait for `<main>` element to be visible
3. Look for the project selector in the header area (`[data-testid="selector-project"]` or the Project combobox)

**Expected Results**:
- The project selector is visible in the header
- The selector may show an empty/placeholder state since no project is assigned
- No crash occurs when rendering the project selector with null project context

#### 3.3 User with no project sees board items that do not require project context

**Steps**:
1. Navigate to the dashboard (`/dashboard`)
2. Wait for `<main>` element to be visible
3. Verify the "My Sessions" (or "Active Sessions") heading is visible
4. Verify the "Recently Created Sessions" heading is visible

**Expected Results**:
- "My Sessions" or "Active Sessions" board item heading is visible
- "Recently Created Sessions" board item heading is visible
- Session count items (Interactive, Batch, Inference, Upload Sessions) may be visible or show zero counts
- These board items do not crash even without project context

---

### 4. Error Boundaries Activate for Board Items Requiring Project Context

**Assumptions**:
- User `e2e-no-project-test@lablup.com` is logged in with no project

#### 4.1 The "My Total Resources Limit" board item shows error indicator instead of crashing

**Steps**:
1. Navigate to the dashboard (`/dashboard`)
2. Wait for `<main>` element to be visible (timeout: 15 seconds)
3. Check that the `[data-bai-board-item-status="error"]` element exists in the DOM

**Expected Results**:
- At least one `[data-bai-board-item-status="error"]` element is present, indicating `BAIBoardItemErrorBoundary` caught an error
- The "My Total Resources Limit" title is still rendered within the error boundary fallback
- An alert icon with tooltip is visible next to the board item title
- The page does not crash due to this error boundary catching the throw from `MyResource`

#### 4.2 The error boundary does not prevent other board items from rendering

**Steps**:
1. Navigate to the dashboard (`/dashboard`)
2. Wait for `<main>` element to be visible
3. Verify the "My Sessions" heading is visible
4. Verify the "Recently Created Sessions" heading is visible
5. Verify the `[data-bai-board-item-status="error"]` element count is greater than zero (error boundaries are activated)
6. Verify the overall page `<main>` content is still rendered

**Expected Results**:
- "My Sessions" board item is visible and functional
- "Recently Created Sessions" board item is visible
- Error boundaries are triggered for project-dependent items (`data-bai-board-item-status="error"`)
- The dashboard is still usable; navigation and other features remain accessible

#### 4.3 No JavaScript uncaught exception crashes the full page

**Steps**:
1. Navigate to the dashboard (`/dashboard`)
2. Wait for `<main>` element to be visible
3. Check browser console for any unhandled React error that breaks rendering
4. Verify the sidebar navigation is still visible
5. Verify the page header is still visible

**Expected Results**:
- No full-page white screen or React uncaught error overlay
- Sidebar navigation (e.g., "Sessions", "Data" links) remains visible
- The `<main>` element remains in the DOM
- The `<complementary>` (sidebar) element remains in the DOM

---

### 5. Cleanup - Admin Deletes the Test User

**Assumptions**:
- Test user `e2e-no-project-test@lablup.com` was created during the test run
- Admin is logged in (or can be logged in)

#### 5.1 Admin can deactivate and permanently delete the test user

**Steps**:
1. Log out from the test user session using `logout(page)`
2. Log in as admin using `loginAsAdmin(page, request)`
3. Navigate to `/credential` using `navigateTo(page, 'credential')`
4. Verify the Users table is visible
5. Find the row with email `e2e-no-project-test@lablup.com` in the Active users table
6. Click the "Deactivate" button in that row
7. In the popconfirm, verify the title "Deactivate User" is shown
8. Click the "Deactivate" button in the popconfirm to confirm
9. Wait for the user row to disappear from the Active list (timeout: 10 seconds)
10. Click "Inactive" radio button to switch to the Inactive filter
11. Verify the user row appears in the Inactive list
12. Check the user's checkbox
13. Click the trash bin ("trash bin") button to open the Purge Users modal
14. In the `PurgeUsersModal`, verify the user email is displayed
15. Call `purgeModal.confirmDeletion()` to confirm permanent deletion
16. Wait for the success message "Permanently deleted X out of X users" to appear
17. Verify the user row disappears from the Inactive list

**Expected Results**:
- User is successfully deactivated (moved to Inactive)
- User is successfully purged (permanently deleted)
- Success notification "Permanently deleted 1 out of 1 users" is visible
- User row is no longer visible in either Active or Inactive lists

---

## Implementation Notes

### Serial Test Execution

These tests must run in **serial mode** because:
- Test 1 creates the user that Tests 2-4 depend on
- Test 5 deletes the user created in Test 1
- Tests 2-4 require the user from Test 1 to exist

```typescript
test.describe.serial(
  'No-project user dashboard behavior',
  { tag: ['@critical', '@regression', '@dashboard', '@functional'] },
  () => {
    // ... tests here
  }
);
```

### Cleanup Strategy

Use `afterAll` to ensure cleanup runs even if tests fail mid-way:

```typescript
test.afterAll(async ({ browser, request }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await loginAsAdmin(page, request);
  await navigateTo(page, 'credential');
  // cleanup logic using cleanupTestUser(page)
  await context.close();
});
```

### Handling KeyPairModal

Based on the existing `user-crud.spec.ts` pattern, after user creation, a "Key pair for new users" dialog may appear. Handle it conditionally:

```typescript
const keyPairModal = new KeyPairModal(page);
const isVisible = await keyPairModal.getModal().isVisible({ timeout: 3000 }).catch(() => false);
if (isVisible) {
  await keyPairModal.close();
}
```

### Verifying Error Boundary Activation

The `BAIBoardItemErrorBoundary` renders a `<div data-bai-board-item-status="error">` when it catches an error. Use this selector:

```typescript
await expect(page.locator('[data-bai-board-item-status="error"]')).toHaveCount(
  { min: 1 },
  { timeout: 15_000 }
);
```

### Project Column in User Table

After creating a user without a project, verify the "Project" column shows no project. Based on the UI, users with projects show tags like "default, model-store". A user with no project would show an empty cell or a dash.

```typescript
const userRow = page.getByRole('row').filter({ hasText: EMAIL });
const projectCell = userRow.getByRole('cell').nth(6); // Project column (0-indexed)
// Verify it's empty or shows no project tags
```

---

## Key Assertions Summary

| Scenario | Key Assertion | Selector |
|---|---|---|
| Dashboard loads | Page does not crash | `expect(page.locator('main')).toBeVisible()` |
| No full-page error | Error text absent | `expect(page.getByText('Something went wrong')).not.toBeVisible()` |
| Error boundaries fire | Error indicator present | `expect(page.locator('[data-bai-board-item-status="error"]')).toHaveCount({ min: 1 })` |
| Other items render | Sessions visible | `expect(page.getByRole('heading', { name: 'My Sessions' })).toBeVisible()` |
| Login works | User dropdown | `expect(page.getByTestId('user-dropdown-button')).toBeVisible()` |
