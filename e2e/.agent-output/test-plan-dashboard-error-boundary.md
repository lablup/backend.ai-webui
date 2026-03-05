# Dashboard Error Boundary - Comprehensive E2E Test Plan

## Application Overview

**Target Page**: Dashboard (`/dashboard`, also reachable via `/summary` which redirects to `/dashboard`)

**Feature Under Test**: `BAIBoardItemErrorBoundary` (FR-2044) + `useCurrentProjectValue` graceful null/undefined handling (FR-2028)

### Dashboard Board Layout (Admin View)

The Dashboard page renders a `BAIBoard` component containing the following board items:

| Item ID | Title | Description | Error Boundary? |
|---|---|---|---|
| `mySession` | Active Sessions / My Sessions | Session count by type (Interactive/Batch/Inference/Upload) | No |
| `myResource` | My Total Resources Limit | Resource usage bars (CPU/RAM/GPU) | **Yes** (`BAIBoardItemErrorBoundary`) |
| `myResourceWithinResourceGroup` | My Resources in [Resource Group] | Per-resource-group resource allocation | **Yes** (`BAIBoardItemErrorBoundary`) |
| `totalResourceWithinResourceGroup` | Total Resources in [Resource Group] | Total resource stats for resource group | No (superadmin) |
| `agentStats` | Agent Statistics | CPU/RAM/GPU statistics for agents | No (superadmin) |
| `activeAgents` | Active Agents | Table of active agents with status | No (superadmin) |
| `recentlyCreatedSession` | Recently Created Sessions | Table of recent sessions with details | No |

### Error Boundary Implementation Details

`BAIBoardItemErrorBoundary` wraps child components with `react-error-boundary`. When the child throws:

- Renders a fallback `<div>` with `data-bai-board-item-status="error"` (or `"warning"`) attribute
- Shows `BAIBoardItemTitle` with the configured `title` prop
- Shows `BAIAlertIconWithTooltip` with tooltip text `"Unexpected error"`
- The CSS rule for `data-bai-board-item-status="error"` applies a red border to the board item card
- The CSS rule for `data-bai-board-item-status="warning"` applies a yellow border

Current wrapping in `DashboardPage.tsx`:
```tsx
<BAIBoardItemErrorBoundary title={t('webui.menu.MyResources')} status="error">
  <MyResource ... />
</BAIBoardItemErrorBoundary>

<BAIBoardItemErrorBoundary title={t('webui.menu.MyResourcesInResourceGroup')} status="error">
  <MyResourceWithinResourceGroup ... />
</BAIBoardItemErrorBoundary>
```

### `useCurrentProjectValue` Behavior (FR-2028)

| Condition | `name` value | `id` value |
|---|---|---|
| Client not ready yet | `undefined` | `undefined` |
| Client ready, no project | `null` | `null` |
| Client ready, project exists | `"default"` | `"<project-id>"` |

---

## Test Infrastructure

- **Login helper**: `loginAsAdmin(page, request)` from `e2e/utils/test-util.ts`
- **Navigation helper**: `navigateTo(page, 'summary')` or `navigateTo(page, 'dashboard')`
- **Base URL**: `http://127.0.0.1:9081`
- **Backend API URL**: `http://127.0.0.1:8090`
- **GraphQL mock helper**: `setupGraphQLMocks(page, mocks)` from `e2e/session/mocking/graphql-interceptor.ts`
- **Route interception**: `page.route('**/admin/gql', ...)` for GraphQL mock injection

### Seed File

```typescript
// e2e/dashboard-seed.spec.ts
import { loginAsAdmin, navigateTo } from './utils/test-util';
import { test } from '@playwright/test';

test.describe('Dashboard seed', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page, request);
    await navigateTo(page, 'summary');
  });
  test('seed', async ({ page: _page }) => {});
});
```

---

## Test Infrastructure Notes

- **Cleanup Required**: No - dashboard tests are read-only; board layout changes use `localStorage` which is cleared per test context automatically
- **Execution Mode**: Parallel (tests are independent)
- **Tags**: `@critical`, `@regression`, `@dashboard`, `@functional`
- **Server Required**: Yes - requires a running Backend.AI cluster at `http://127.0.0.1:8090`

---

## Test Scenarios

### 1. Dashboard Board Items Visibility

**Spec file**: `e2e/dashboard/dashboard-board-items.spec.ts`

#### 1.1 Admin can see all expected board items on the dashboard

**Assumptions**: Admin is logged in; Backend.AI server is running; default project is set

**Steps:**
1. Login as admin using `loginAsAdmin(page, request)`
2. Navigate to `summary` using `navigateTo(page, 'summary')`
3. Verify URL contains `/dashboard` (redirect from `/summary`)
4. Verify breadcrumb shows "Dashboard"
5. Verify the "Active Sessions" heading is visible
6. Verify the "My Total Resources Limit" heading is visible
7. Verify the "My Resources in" heading is visible (contains resource group selector)
8. Verify the "Recently Created Sessions" heading is visible

**Expected Results:**
- URL is `/dashboard`
- All four board item headings are visible
- No full-page error state or crash page is displayed

**Success Criteria**: All board items render without triggering the full-page `BAIErrorBoundary`

---

#### 1.2 Admin can see superadmin-only board items on the dashboard

**Assumptions**: Admin account has `superadmin` role; Backend.AI server is running

**Steps:**
1. Login as admin using `loginAsAdmin(page, request)`
2. Navigate to `summary`
3. Verify "Agent Statistics" heading is visible
4. Verify "Active Agents" heading is visible
5. Verify "Total Resources in" heading is visible (resource group panel)

**Expected Results:**
- All superadmin-specific board items are present
- Active Agents table contains at least one agent row

---

#### 1.3 Admin can see session count data in the Active Sessions board item

**Assumptions**: At least one active session exists on the server

**Steps:**
1. Login as admin and navigate to dashboard
2. Verify "Active Sessions" heading is visible
3. Verify "Interactive" label is visible within the session count board item
4. Verify "Batch" label is visible
5. Verify "Inference" label is visible
6. Verify "Upload Sessions" label is visible
7. Verify each count is a numeric value (not loading spinner)

**Expected Results:**
- Session count board item shows numeric values for all session types
- Reload button (`reload` icon) is present next to the heading

---

### 2. Board Item Error Boundary - Visual Indicator

**Spec file**: `e2e/dashboard/dashboard-error-boundary.spec.ts`

#### 2.1 Admin sees error indicator instead of page crash when a board item throws an error

**Assumptions**: GraphQL mocking is available; `setupGraphQLMocks` can intercept `DashboardPageQuery`

**Steps:**
1. Set up GraphQL mock to return an error response for the `MyResource` query before navigating
2. Login as admin
3. Intercept GraphQL requests to the `/admin/gql` endpoint and inject a malformed/error response for the resource query
4. Navigate to dashboard (`navigateTo(page, 'summary')`)
5. Wait for "Active Sessions" heading to be visible (confirms page loaded)
6. Verify that no full-page error `Result` component (from `BAIErrorBoundary`) is shown
7. Verify that `data-bai-board-item-status="error"` attribute exists on a board item element
8. Verify the title "My Resources" is still visible within the errored board item fallback

**Expected Results:**
- The dashboard page does NOT crash to a full-page error state
- Other board items (Active Sessions, Recently Created Sessions) remain functional and visible
- The errored board item shows its title text with an alert icon
- `[data-bai-board-item-status="error"]` element exists in the DOM

**Success Criteria**: `page.locator('[data-bai-board-item-status="error"]').isVisible()` returns true

---

#### 2.2 Admin sees the error icon with tooltip in the errored board item header

**Assumptions**: A board item has entered error state (via GraphQL mock or `page.evaluate` injection)

**Steps:**
1. Setup: Navigate to dashboard with a mocked error in a board item (same setup as 2.1)
2. Locate the board item element with `data-bai-board-item-status="error"`
3. Verify an alert/warning icon is visible inside the errored board item header area
4. Hover over the alert icon
5. Verify a tooltip appears with text "Unexpected error"

**Expected Results:**
- Alert icon (warning or error type) is visible in the board item header
- Tooltip text matches the i18n key `comp:BAIBoardItemErrorBoundary.UnexpectedError` value ("Unexpected error")
- The board item title text (e.g., "My Resources") is still visible

---

#### 2.3 Admin sees red border styling on a board item in error state

**Assumptions**: `BAIBoardItemErrorBoundary` fallback is rendered with `data-bai-board-item-status="error"`

**Steps:**
1. Navigate to dashboard with a mocked board item error
2. Locate the parent board item card that wraps the element with `data-bai-board-item-status="error"`
3. Evaluate the computed CSS border-color of the board item card container

**Expected Results:**
- The board item card container has a border color corresponding to the error/red CSS token
- Other board item cards without errors do NOT have red border styling

**Implementation Note**: Use `page.evaluate()` to read `getComputedStyle(element).borderColor` on the errored board item card element.

---

### 3. Dashboard Resilience After Board Item Error

**Spec file**: `e2e/dashboard/dashboard-error-boundary.spec.ts`

#### 3.1 Admin can still use other board items when one board item has an error

**Assumptions**: `myResource` or `myResourceWithinResourceGroup` is forced into error state

**Steps:**
1. Login as admin
2. Set up GraphQL mock so `MyResource` component throws an error during render
3. Navigate to dashboard
4. Verify "Active Sessions" board item is visible and shows session counts (confirms non-errored items work)
5. Verify "Recently Created Sessions" table is visible and rendered
6. Verify the errored board item shows `data-bai-board-item-status="error"`
7. Click the reload button on "Active Sessions" board item
8. Verify session counts are still visible after reload

**Expected Results:**
- Dashboard remains interactive after a board item error
- Non-errored board items continue to function normally
- Reload button on Active Sessions works and refreshes data
- No error propagation from the errored board item to other items

---

#### 3.2 Admin can navigate away and back to the dashboard after a board item error

**Assumptions**: A board item is in error state on the dashboard

**Steps:**
1. Login as admin, navigate to dashboard with a mocked board item error
2. Confirm error boundary fallback is visible (`data-bai-board-item-status="error"`)
3. Click "Sessions" in the left sidebar menu to navigate away
4. Verify Sessions page loads (breadcrumb shows "Sessions" or URL contains `/session`)
5. Click "Dashboard" in the left sidebar menu
6. Verify dashboard loads again
7. Verify the board item error boundary is still shown (mock still active)
8. Verify other board items still render correctly

**Expected Results:**
- Navigation away from dashboard works normally
- Re-navigating to dashboard re-renders the board items
- Error boundary state persists while the mock error is active
- Full page does not crash at any point

---

### 4. `useCurrentProjectValue` Graceful Handling

**Spec file**: `e2e/dashboard/dashboard-project-hook.spec.ts`

#### 4.1 Admin sees dashboard load without crash when no project is selected

**Assumptions**: The `useCurrentProjectValue` hook returns `{name: null, id: null}` in some edge states

**Steps:**
1. Login as admin
2. Navigate to dashboard
3. Observe the Project selector in the top header showing the current project (e.g., "default")
4. Verify the dashboard loads without a full-page crash
5. Verify the `[data-testid="selector-project"]` element is visible and shows a project name

**Expected Results:**
- Dashboard renders without entering the full-page `BAIErrorBoundary`
- Project selector displays correctly in the header
- Board items are rendered (not stuck in loading state)

---

#### 4.2 Admin can switch projects and dashboard board items refresh

**Assumptions**: Multiple projects exist; at minimum a "default" project is available

**Steps:**
1. Login as admin and navigate to dashboard
2. Verify current project is shown in `[data-testid="selector-project"]`
3. Click the project selector dropdown (`[data-testid="selector-project"]`)
4. Select a different project from the dropdown (if multiple exist) or verify the current project is selected
5. Verify URL remains on `/dashboard` after project switch
6. Verify the "My Resources in" board item header updates to show the new project's resource group
7. Verify "Active Sessions" board item reloads (no crash)

**Expected Results:**
- Switching projects does not crash the dashboard
- Board items that depend on project context (myResource, myResourceWithinResourceGroup) refresh their data
- No board item enters error state due to the project switch

---

### 5. Dashboard Auto-Refresh Behavior

**Spec file**: `e2e/dashboard/dashboard-auto-refresh.spec.ts`

#### 5.1 Admin sees dashboard data refresh automatically every 15 seconds

**Assumptions**: Dashboard uses `useInterval` with 15-second interval

**Steps:**
1. Login as admin and navigate to dashboard
2. Note the current elapsed time shown in the Recently Created Sessions table
3. Wait 16 seconds
4. Verify the elapsed time in the Recently Created Sessions table has updated

**Expected Results:**
- Session elapsed time value changes after the 15-second auto-refresh interval
- No board items enter error state during or after auto-refresh
- Dashboard remains interactive during the refresh

**Note**: This test should be tagged `@regression` only (slow due to 16-second wait).

---

#### 5.2 Admin can manually reload a board item using the reload button

**Steps:**
1. Login as admin and navigate to dashboard
2. Locate the reload button (`reload` icon button) on the "Active Sessions" board item header
3. Click the reload button
4. Verify the Active Sessions data is visible after reload (no crash, no empty state)

**Expected Results:**
- Clicking the reload button does not crash the board item
- Data is visible after the reload completes
- The reload button remains clickable after the reload

---

### 6. Dashboard Board Layout Persistence

**Spec file**: `e2e/dashboard/dashboard-board-layout.spec.ts`

#### 6.1 Admin can drag and reorder dashboard board items

**Steps:**
1. Login as admin and navigate to dashboard
2. Verify "Active Sessions" board item is visible
3. Identify the drag handle (the `⠿` icon / move handle button) on "Active Sessions" board item
4. Drag "Active Sessions" board item to a different position on the board
5. Verify "Active Sessions" board item appears in the new position
6. Reload the page
7. Verify the board item arrangement is preserved after reload

**Expected Results:**
- Drag-and-drop reordering is possible
- Board layout is persisted to `localStorage` under the `dashboard_board_items` key
- Reloading the page restores the saved layout

**Cleanup**: Clear `localStorage` key `dashboard_board_items` via `page.evaluate(() => localStorage.removeItem('bai-setting-user-dashboard_board_items'))` in `afterEach`

---

#### 6.2 Admin sees newly added board items even after layout is saved in localStorage

**Steps:**
1. Login as admin and navigate to dashboard
2. Verify all expected board items are visible (including any newly added items that may not be in localStorage yet)
3. Verify that the "Recently Created Sessions" table is visible
4. Verify that "Agent Statistics" (superadmin-only) is visible

**Expected Results:**
- Items not yet saved in `localStorage` (new items from code updates) are appended to the board
- No board item is silently missing from the dashboard

---

### 7. Error Boundary - GraphQL Mock Injection Technique

The following approach is recommended for triggering the `BAIBoardItemErrorBoundary` fallback in tests:

```typescript
// Approach A: Inject a JavaScript error via page.evaluate() to simulate a component throw
// This forces React's error boundary to catch the thrown error
await page.evaluate(() => {
  // Override the MyResource component's render to throw
  // NOTE: This requires access to React internals; prefer approach B
});

// Approach B: Mock the GraphQL endpoint to return an error response
// The component will receive null/undefined data and may throw during render
await page.route('**/admin/gql', async (route) => {
  const request = route.request();
  const postData = request.postData();
  if (postData?.includes('MyResourceQuery')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        errors: [{ message: 'Simulated error for testing' }],
        data: null,
      }),
    });
  } else {
    await route.continue();
  }
});

// Approach C: Use page.route to return HTTP 500 for specific queries
// Relay will throw an error when receiving a non-200 response
await page.route('**/admin/gql', async (route) => {
  const postData = route.request().postData();
  if (postData?.includes('MyResourceQuery')) {
    await route.fulfill({ status: 500 });
  } else {
    await route.continue();
  }
});
```

**Recommended approach for error boundary tests**: Use Approach B (GraphQL mock with error response) as it most accurately simulates a real-world scenario where the backend returns an error. The `BAIBoardItemErrorBoundary` catches errors thrown by child components during React render.

---

## Test File Organization

```
e2e/
└── dashboard/
    ├── dashboard-board-items.spec.ts       # Scenarios 1.1 - 1.3
    ├── dashboard-error-boundary.spec.ts    # Scenarios 2.1 - 3.2
    ├── dashboard-project-hook.spec.ts      # Scenarios 4.1 - 4.2
    ├── dashboard-auto-refresh.spec.ts      # Scenarios 5.1 - 5.2
    └── dashboard-board-layout.spec.ts      # Scenarios 6.1 - 6.2
```

---

## Tag Strategy

| Tag | Scenarios |
|---|---|
| `@smoke` | 1.1, 2.1 |
| `@critical` | 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 4.1, 4.2 |
| `@regression` | All scenarios including 5.1, 6.1, 6.2 |
| `@dashboard` | All scenarios |
| `@functional` | All scenarios |

---

## Key Locators Reference

| Element | Locator |
|---|---|
| Page wrapper | `page.getByTestId('page-dashboard')` |
| Breadcrumb | `page.getByTestId('webui-breadcrumb')` |
| Project selector | `page.getByTestId('selector-project')` |
| User dropdown | `page.getByTestId('user-dropdown-button')` |
| Active Sessions heading | `page.getByRole('heading', { name: 'Active Sessions', level: 5 })` |
| My Total Resources Limit heading | `page.getByRole('heading', { name: 'My Total Resources Limit', level: 5 })` |
| Active Agents heading | `page.getByRole('heading', { name: 'Active Agents', level: 5 })` |
| Recently Created Sessions heading | `page.getByRole('heading', { name: 'Recently Created Sessions', level: 5 })` |
| Error boundary fallback element | `page.locator('[data-bai-board-item-status="error"]')` |
| Warning boundary fallback element | `page.locator('[data-bai-board-item-status="warning"]')` |
| Reload buttons | `page.getByRole('button', { name: 'reload' })` |
| My Resources in panel | `page.getByText('My Resources in', { exact: false })` |
| Total Resources in panel | `page.getByText('Total Resources in', { exact: false })` |
| Agent Statistics panel | `page.getByText('Agent Statistics', { exact: false })` |

---

## Out of Scope

- Visual regression (screenshot comparison) testing — covered by `e2e/visual_regression/dashboard/`
- Unit testing of `BAIBoardItemErrorBoundary` component — covered by Storybook / Jest
- Testing the `BAIErrorBoundary` (full-page error boundary) — separate from board item error boundaries
- Electron app behavior — separate build and test path
- Error boundary for `agentStats` / `activeAgents` items (not wrapped in `BAIBoardItemErrorBoundary` as of current implementation)
- Board item drag-and-drop pixel-exact positioning — tested conceptually in 6.1
