# Backend.AI WebUI - Start Page & Dashboard Test Plan

## Application Overview

This test plan covers two core pages in the Backend.AI WebUI:

### Start Page (`/start`)
The Start Page is a board layout page that serves as a quick-action launcher. It presents a set of draggable cards, each representing a common workflow entry point: creating a storage folder, starting an interactive or batch session, deploying a model service, and importing from a URL. Card layout is persisted per-user in localStorage via `useBAISettingUserState`. Cards filtered from the `blockList`/`inactiveList` config are not shown. The `modelService` card is conditional on `enableModelFolders`.

### Dashboard Page (`/dashboard`)
The Dashboard (URL path `/summary` internally mapped to `DashboardPage`) is a resizable and movable board showing operational metrics:

- **My Sessions / Active Sessions** - counts of Interactive, Batch, Inference, System sessions; title differs by role (superadmin: "Active Sessions", others: "My Sessions")
- **My Resources** - quota usage for CPU, Memory, and accelerators across the project
- **My Resources in Resource Group** - same as above but scoped to the current resource group, with a resource group selector
- **Total Resources in Resource Group** - aggregate cluster capacity (superadmin / non-hideAgents environments only)
- **Agent Stats** - cluster-level free/used resource statistics (superadmin + server >= 25.15.0 only)
- **Active Agents** - live agent list with pagination (superadmin only; covered by PR #5793, excluded here)
- **Recently Created Sessions** - last 5 running sessions table; clicking a row opens a Session Detail Drawer

Data auto-refreshes every 15 seconds. Each widget has a manual refresh button.

---

## Test Infrastructure Notes

- **Authentication helper**: `loginAsAdmin(page, request)` / `loginAsUser(page, request)` from `e2e/utils/test-util.ts`
- **Navigation helper**: `navigateTo(page, 'start')` / `navigateTo(page, 'summary')`
- **Post-login wait**: `[data-testid="user-dropdown-button"]` must be visible before proceeding
- **Cleanup Required**: Yes for tests that create folders or sessions; use `afterEach` to tear down
- **Execution Mode**: Parallel by default; serial only for tests that share board layout state across steps
- **Tags**: `@functional`, `@smoke`, `@regression`

---

## Test Scenarios

### 1. Start Page - Card Rendering

#### 1.1 Admin can see all expected quick-action cards on the Start page
**Assumptions:** Admin user logged in; `enableModelFolders` is true; no `blockList`/`inactiveList` entries.

**Steps:**
1. Login as admin (`admin@lablup.com`).
2. Navigate to `/start`.
3. Verify the "Create New Storage Folder" card is visible.
4. Verify the "Start Interactive Session" card is visible.
5. Verify the "Start Batch Session" card is visible.
6. Verify the "Start Model Service" card is visible.
7. Verify the "Start From URL" card is visible.

**Expected Results:**
- All five action cards are rendered within the board.
- Each card displays a title, description text, and a call-to-action button.
- The board is not empty (no "No available Start items." alert shown).

---

#### 1.2 User can see all expected quick-action cards on the Start page
**Assumptions:** Regular user logged in; same feature flags as above.

**Steps:**
1. Login as regular user (`user@lablup.com`).
2. Navigate to `/start`.
3. Verify the "Create New Storage Folder" card is visible.
4. Verify the "Start Interactive Session" card is visible.
5. Verify the "Start Batch Session" card is visible.
6. Verify the "Start From URL" card is visible.

**Expected Results:**
- Cards display correctly for a regular user.
- The `modelService` card visibility depends on the `enableModelFolders` config value.

---

### 2. Start Page - Create Folder Action

#### 2.1 User can open the Create Folder modal from the Start page
**Assumptions:** Logged in as admin or user; Start page loaded.

**Steps:**
1. Login as admin and navigate to `/start`.
2. Locate the "Create New Storage Folder" card.
3. Click the "Create Folder" button within that card.
4. Verify the "Create Folder" modal opens.
5. Verify the folder name input field is visible.
6. Verify the modal has a "Create" (or equivalent submit) button.

**Expected Results:**
- The `FolderCreateModal` opens immediately after button click.
- All required form fields (folder name, usage mode, type, permission) are present.

**Cleanup:** Close the modal without submitting.

---

#### 2.2 User can create a folder from the Start page and be redirected to the Data page
**Assumptions:** Logged in as admin; Start page loaded.

**Steps:**
1. Login as admin and navigate to `/start`.
2. Click the "Create Folder" button on the "Create New Storage Folder" card.
3. Fill in the folder name field with a unique test name (e.g., `e2e-start-folder-<timestamp>`).
4. Click the "Create" button in the modal.
5. Verify the modal closes.
6. Verify the browser URL changes to `/data`.
7. Verify the newly created folder appears in the Data page list.

**Expected Results:**
- Folder is created successfully.
- User is automatically navigated to the Data page after creation.
- The folder is listed in the active folders table.

**Cleanup:** Move the created folder to trash and delete it forever via the Data page.

---

#### 2.3 User sees validation error when submitting Create Folder modal with empty name
**Assumptions:** Logged in; Create Folder modal is open.

**Steps:**
1. Login as admin and navigate to `/start`.
2. Click the "Create Folder" button on the "Create New Storage Folder" card.
3. Leave the folder name field empty.
4. Click the "Create" button.
5. Verify a validation error message appears near the folder name field.

**Expected Results:**
- Submission is prevented.
- An inline validation error is shown ("Please enter folder name" or equivalent).
- Modal remains open.

**Cleanup:** Close the modal.

---

### 3. Start Page - Start Session Navigation

#### 3.1 User can navigate to the Session Launcher from the "Start Interactive Session" card
**Assumptions:** Logged in as admin; Start page loaded.

**Steps:**
1. Login as admin and navigate to `/start`.
2. Locate the "Start Interactive Session" card.
3. Click the "Start Session" button within that card.
4. Verify the URL changes to `/session/start`.
5. Verify the Session Launcher page header or form is visible.

**Expected Results:**
- Navigation to `/session/start` succeeds.
- The session launcher opens in default interactive mode.

---

#### 3.2 User can navigate to the Session Launcher in batch mode from the "Start Batch Session" card
**Assumptions:** Logged in as admin; Start page loaded.

**Steps:**
1. Login as admin and navigate to `/start`.
2. Locate the "Start Batch Session" card.
3. Click the "Start Session" button within that card.
4. Verify the URL changes to `/session/start` with query parameters `step=0` and `formValues` containing `sessionType: "batch"`.
5. Verify the Session Launcher page is visible.

**Expected Results:**
- Navigation targets `/session/start` with batch session type pre-selected.

---

#### 3.3 Admin can navigate to the Model Service creation page from the "Start Model Service" card
**Assumptions:** Logged in as admin; `enableModelFolders` is true; Start page loaded.

**Steps:**
1. Login as admin and navigate to `/start`.
2. Locate the "Start Model Service" card.
3. Click the "Start Service" button within that card.
4. Verify the URL changes to `/service/start`.
5. Verify the model service creation form or header is visible.

**Expected Results:**
- Navigation to `/service/start` succeeds.

---

### 4. Start Page - Start From URL Modal

#### 4.1 User can open the "Start From URL" modal from the Start page
**Assumptions:** Logged in; Start page loaded.

**Steps:**
1. Login as admin and navigate to `/start`.
2. Locate the "Start From URL" card.
3. Click the "Start Now" button.
4. Verify the "Start From URL" modal opens.
5. Verify the modal displays three tabs: "Import Notebook", "Import Github Repo", "Import Gitlab Repo".
6. Verify the "Import Notebook" tab is active by default.

**Expected Results:**
- Modal opens with three tabs visible.
- Default tab is "Import Notebook" (with Jupyter icon).
- URL input field is present in the Import Notebook tab.

**Cleanup:** Close the modal.

---

#### 4.2 User can switch between tabs in the Start From URL modal
**Assumptions:** Start From URL modal is open.

**Steps:**
1. Login as admin, navigate to `/start`, and click "Start Now" on the "Start From URL" card.
2. Click the "Import Github Repo" tab.
3. Verify the GitHub import form is visible (URL and branch fields).
4. Click the "Import Gitlab Repo" tab.
5. Verify the GitLab import form is visible.
6. Click the "Import Notebook" tab to return to the default.
7. Verify the notebook import form is visible.

**Expected Results:**
- Each tab switch reveals the corresponding form without page reload.

**Cleanup:** Close the modal.

---

#### 4.3 User can open the Start From URL modal pre-filled via query parameters
**Assumptions:** Logged in; application is accessible.

**Steps:**
1. Login as admin.
2. Navigate directly to `/start?type=url&data={"url":"https://github.com/example/repo/blob/main/notebook.ipynb"}`.
3. Verify the "Start From URL" modal opens automatically.
4. Verify the "Import Notebook" tab is active.
5. Verify the URL input field is pre-filled with the URL from the query parameter.
6. Verify the URL query parameters (`type`, `data`) are cleared from the address bar after the modal opens.

**Expected Results:**
- Modal auto-opens with the notebook URL pre-populated.
- Address bar shows `/start` without `type` or `data` params after loading.

**Cleanup:** Close the modal.

---

### 5. Start Page - Board Item Drag-and-Drop

#### 5.1 User can reorder Start page cards by dragging
**Assumptions:** Logged in as admin; at least two cards are visible on the Start page.

**Steps:**
1. Login as admin and navigate to `/start`.
2. Verify at least two cards are visible (e.g., "Create New Storage Folder" and "Start Interactive Session").
3. Locate the drag handle (`.bai_board_handle` button) on the "Create New Storage Folder" card.
4. Drag the "Create New Storage Folder" card to the position of the "Start Interactive Session" card.
5. Release the drag.
6. Verify the card positions have changed (the dragged card is now in the target position).
7. Reload the page.
8. Verify the new card order is preserved after reload (persisted in localStorage).

**Expected Results:**
- Card reorder is visually reflected immediately after drag completion.
- Order persists across page reloads.

**Cleanup:** Drag the card back to its original position (or clear the `start_page_board_items` localStorage key if possible via test setup).

---

### 6. Dashboard - Widget Rendering (Admin)

#### 6.1 Admin can see all expected dashboard widgets
**Assumptions:** Logged in as superadmin; server version >= 25.15.0; `isAvailableTotalResourceWithinResourceGroup` is true.

**Steps:**
1. Login as admin (`admin@lablup.com`).
2. Navigate to `/summary` (or `/dashboard`).
3. Wait for `[data-testid="user-dropdown-button"]` to be visible.
4. Verify the "Active Sessions" widget (session count card) is visible, showing Interactive, Batch, Inference, System counts.
5. Verify the "My Resources" widget is visible with CPU and Memory statistics.
6. Verify the "My Resources in Resource Group" widget is visible.
7. Verify the "Total Resources in Resource Group" widget is visible.
8. Verify the "Agent Stats" widget is visible (admin + server >= 25.15.0).
9. Verify the "Recently Created Sessions" widget is visible with a table.

**Expected Results:**
- All widgets render without error states.
- Session count statistics display numeric values (0 or greater).
- Resource widgets show at least CPU and Memory bars.

---

#### 6.2 Regular user sees "My Sessions" title instead of "Active Sessions" on the session count widget
**Assumptions:** Logged in as regular user.

**Steps:**
1. Login as regular user (`user@lablup.com`).
2. Navigate to `/summary`.
3. Locate the session count dashboard widget.
4. Verify the widget title reads "My Sessions" (not "Active Sessions").

**Expected Results:**
- Non-superadmin users see "My Sessions" as the session count title.
- Agent Stats widget is NOT visible for regular users.
- Active Agents widget is NOT visible for regular users.

---

#### 6.3 Regular user sees dashboard without admin-only widgets
**Assumptions:** Logged in as regular user.

**Steps:**
1. Login as regular user and navigate to `/summary`.
2. Verify the "My Sessions" widget is visible.
3. Verify the "My Resources" widget is visible.
4. Verify the "My Resources in Resource Group" widget is visible.
5. Verify the "Agent Stats" widget is NOT present on the page.
6. Verify the "Active Agents" widget is NOT present on the page.
7. Verify the "Recently Created Sessions" table is visible.

**Expected Results:**
- Dashboard renders correctly with user-appropriate widgets.
- No admin-only widgets (Agent Stats, Active Agents) are displayed.

---

### 7. Dashboard - Session Count Widget

#### 7.1 Admin can see session type breakdown in the session count widget
**Assumptions:** Logged in as admin; Dashboard loaded.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Locate the "Active Sessions" (or "My Sessions") widget.
3. Verify four statistics are displayed: "Interactive", "Batch", "Inference", "System".
4. Verify each statistic shows a numeric value (0 or greater).

**Expected Results:**
- All four session type statistics are visible.
- Values are non-negative integers.

---

#### 7.2 Admin can manually refresh the session count widget
**Assumptions:** Logged in as admin; Dashboard loaded.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Locate the "Active Sessions" widget.
3. Click the refresh (fetch key) button in the widget's header area.
4. Verify a loading state appears briefly.
5. Verify the session counts update (or remain the same if no change).
6. Verify the loading state disappears after refresh completes.

**Expected Results:**
- Refresh button triggers a network-only refetch.
- Widget displays updated data without full page reload.

---

### 8. Dashboard - My Resources Widget

#### 8.1 User can view CPU and Memory usage in the My Resources widget
**Assumptions:** Logged in as admin or user; Dashboard loaded.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Locate the "My Resources" widget.
3. Verify the CPU usage statistic is displayed (used and total values).
4. Verify the Memory usage statistic is displayed.
5. Verify usage bars or progress indicators are rendered.

**Expected Results:**
- CPU and Memory resource statistics are visible.
- Values include units (e.g., "2 Cores", "4 GiB").

---

#### 8.2 User can manually refresh the My Resources widget
**Assumptions:** Logged in; Dashboard loaded.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Locate the "My Resources" widget.
3. Click the refresh button in the widget header.
4. Verify the widget enters a loading or pending state.
5. Verify updated resource data is displayed after the refresh completes.

**Expected Results:**
- Refresh triggers a data reload.
- Widget content updates without errors.

---

### 9. Dashboard - My Resources in Resource Group Widget

#### 9.1 User can view resource usage scoped to the current resource group
**Assumptions:** Logged in; at least one resource group is configured.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Locate the "My Resources in Resource Group" widget.
3. Verify a resource group selector (dropdown) is visible within the widget.
4. Verify CPU and Memory statistics are displayed for the current resource group.
5. Verify a "Used" / "Free" toggle (Segmented control) is present.

**Expected Results:**
- Widget shows resource usage for the current resource group.
- Segmented control allows switching between "Used" and "Free" views.

---

#### 9.2 User can switch between resource groups in the My Resources in Resource Group widget
**Assumptions:** Logged in; multiple resource groups are available.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Locate the "My Resources in Resource Group" widget.
3. Note the currently selected resource group.
4. Click the resource group selector dropdown.
5. Select a different resource group from the dropdown.
6. Verify the resource statistics update to reflect the newly selected resource group.

**Expected Results:**
- Selecting a different resource group updates the statistics.
- The widget does not navigate away or reload the page.

---

#### 9.3 User can toggle between "Used" and "Free" resource views
**Assumptions:** Logged in; Dashboard loaded.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Locate the "My Resources in Resource Group" widget.
3. Note the default view ("Free" by default per source code).
4. Click the "Used" segment in the toggle.
5. Verify the displayed statistics switch to "Used" values.
6. Click the "Free" segment.
7. Verify the statistics return to the "Free" view.

**Expected Results:**
- Toggle switches the displayed resource metric between used and free values.
- The change is immediate without a full data refetch.

---

### 10. Dashboard - Agent Stats Widget (Admin Only)

#### 10.1 Admin can view cluster-level resource statistics in the Agent Stats widget
**Assumptions:** Logged in as superadmin; server version >= 25.15.0.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Locate the "Agent Stats" widget.
3. Verify the widget is visible and shows resource statistics (CPU, Memory, accelerators if present).
4. Verify a "Used" / "Free" segmented toggle is present.
5. Click the "Free" segment.
6. Verify the statistics update to reflect free (available) resources.
7. Click the "Used" segment.
8. Verify the statistics return to the used view.

**Expected Results:**
- Agent Stats widget displays accurate cluster-level data.
- Toggle functions correctly between "Used" and "Free" views.
- Data includes at minimum CPU and Memory; accelerators appear if configured.

---

#### 10.2 Admin can manually refresh the Agent Stats widget
**Assumptions:** Logged in as admin; Dashboard loaded with Agent Stats widget visible.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Locate the "Agent Stats" widget.
3. Click the refresh button in the widget header.
4. Verify a loading/pending state appears briefly.
5. Verify the widget renders updated data after completion.

**Expected Results:**
- Refresh triggers a `network-only` refetch of agent statistics.
- No error state appears after refresh.

---

### 11. Dashboard - Recently Created Sessions Widget

#### 11.1 User can view the recently created sessions list on the Dashboard
**Assumptions:** Logged in; at least one running session exists.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Locate the "Recently Created Sessions" widget.
3. Verify the sessions table is displayed.
4. Verify each session row shows session name and relevant metadata (status, type, etc.).
5. Verify the table shows at most 5 sessions.

**Expected Results:**
- "Recently Created Sessions" shows up to 5 running sessions ordered by most recent creation time.
- Table columns render properly.

---

#### 11.2 User can open the Session Detail Drawer by clicking a session in the Recently Created Sessions widget
**Assumptions:** Logged in; at least one running session is visible in the Recently Created Sessions widget.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Locate a session row in the "Recently Created Sessions" table.
3. Click on the session row.
4. Verify the Session Detail Drawer opens on the right side of the screen.
5. Verify the drawer displays session details (session name, status, resource allocation, etc.).
6. Close the drawer by clicking the close button or pressing Escape.
7. Verify the URL parameter `sessionDetail` is removed from the address bar after closing.

**Expected Results:**
- Session Detail Drawer opens with the correct session's information.
- Closing the drawer removes the `sessionDetail` query parameter.

---

#### 11.3 User can manually refresh the Recently Created Sessions widget
**Assumptions:** Logged in; Dashboard loaded.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Locate the "Recently Created Sessions" widget.
3. Click the refresh button in the widget header.
4. Verify a loading state appears briefly.
5. Verify the session list updates (may remain the same if no new sessions).

**Expected Results:**
- Refresh triggers a `network-only` refetch.
- Widget renders without errors after refresh.

---

### 12. Dashboard - Board Layout (Resize and Move)

#### 12.1 Admin can resize a dashboard widget
**Assumptions:** Logged in as admin; Dashboard loaded; `resizable` is true for the board.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Locate the resize handle (`.bai_board_resizer` button) on the "My Resources" widget.
3. Drag the resize handle to increase the widget's column span.
4. Verify the widget visually expands.
5. Verify other widgets reflow accordingly.
6. Reload the page.
7. Verify the new widget size is preserved (persisted in localStorage via `dashboard_board_items`).

**Expected Results:**
- Widget resizes beyond its minimum dimensions (minRowSpan: 2, minColumnSpan: 2).
- Layout is preserved on page reload.

**Cleanup:** Resize the widget back to its default size, or clear `dashboard_board_items` from localStorage in test teardown.

---

#### 12.2 Admin can move a dashboard widget by dragging
**Assumptions:** Logged in as admin; Dashboard loaded with multiple widgets.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Locate the drag handle (`.bai_board_handle` button) on the "My Sessions" widget.
3. Drag the widget to a different position in the board grid.
4. Release the drag.
5. Verify the widget has moved to the new position.
6. Reload the page.
7. Verify the new widget position is preserved.

**Expected Results:**
- Widget drag-and-drop repositioning works within the grid.
- Positions persist across page reloads.

**Cleanup:** Drag the widget back to its original position, or clear `dashboard_board_items` from localStorage.

---

### 13. Dashboard - Auto-Refresh Behavior

#### 13.1 Dashboard data auto-refreshes every 15 seconds
**Assumptions:** Logged in as admin; Dashboard loaded; network requests are observable.

**Steps:**
1. Login as admin and navigate to `/summary`.
2. Wait for initial data load (session counts and resource stats visible).
3. Observe network requests over 15-20 seconds.
4. Verify new GraphQL requests for session counts and resource data are made after approximately 15 seconds.
5. Verify the displayed data updates without user interaction.

**Expected Results:**
- GraphQL queries for sessions and resources are re-issued every ~15 seconds.
- The UI reflects updated data without requiring a manual page refresh.
- No error states appear during auto-refresh.

---

### 14. Dashboard - Accessibility and Error States

#### 14.1 Dashboard widget shows error boundary UI when data load fails
**Assumptions:** Logged in; able to intercept/mock GraphQL responses.

**Steps:**
1. Login as admin.
2. Intercept the `MyResource` GraphQL query and respond with a server error.
3. Navigate to `/summary`.
4. Verify the "My Resources" widget displays an error boundary UI with an error title and status.
5. Verify other widgets that do not depend on the failed query are still functional.

**Expected Results:**
- `BAIBoardItemErrorBoundary` renders a non-crashing error state within the widget card.
- The error is isolated to the failed widget; other widgets continue to load normally.

---

## Appendix: Page Object Model (POM) Suggestions

### StartPage POM (existing: `e2e/utils/classes/common/StartPage.ts`)

Existing methods to leverage:
- `getStorageFolderCard()` - returns `.bai_grid_item` containing "Create New Storage Folder"
- `getInteractiveSessionCard()` - returns the interactive session card
- `getBatchSessionCard()` - returns the batch session card
- `getModelServiceCard()` - returns the model service card
- `getStartButtonFromCard(card)` - returns the "Start" button within a card

Additional methods to implement:
- `getStartFromURLCard()` - returns `.bai_grid_item` containing "Start From URL"
- `getStartNowButtonFromCard(card)` - returns the "Start Now" button for the URL card
- `getDragHandleFromCard(card)` - returns `.bai_board_handle button` within a card

### DashboardPage POM (to be created: `e2e/utils/classes/dashboard/DashboardPage.ts`)

Suggested methods:
- `waitForLoad()` - waits for session count widget to be visible
- `getSessionCountWidget()` - locates the session count board item
- `getMyResourcesWidget()` - locates the My Resources board item
- `getMyResourcesInResourceGroupWidget()` - locates the RG-scoped resource board item
- `getAgentStatsWidget()` - locates Agent Stats (admin only)
- `getRecentlyCreatedSessionsWidget()` - locates the recent sessions table
- `clickRefreshOnWidget(widget: Locator)` - clicks the `BAIFetchKeyButton` inside a widget
- `getResizeHandleFromWidget(widget: Locator)` - returns `.bai_board_resizer button`
- `getDragHandleFromWidget(widget: Locator)` - returns `.bai_board_handle button`
- `openSessionDetailDrawer(sessionName: string)` - clicks a session row to open the drawer
