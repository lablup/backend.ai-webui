# RBAC Admin Role-based Admin Menu Behavior — Dev Plan

## Spec Reference

`.specs/FR-1692-enhanced-admin-menu/spec.md`

## Epic: FR-1692 (Enhanced Admin menu)

## Parent Task: FR-2313 (Improve admin menu behavior based on RBAC admin role)

---

## Phase 1: Add entity list pages to Admin menu (superadmin only)

RBAC role API is not yet available from the backend. Phase 1 focuses on adding Session, Data, and Service list pages to the Admin menu for **superadmin only**, without project scoping. Each page reuses existing table/list components but is a separate page component tailored for admin use.

### Sub-task 1-1: Add Admin Session list page — FR-2316

- **New file**: `react/src/pages/AdminComputeSessionListPage.tsx`
- **Changed files**: `react/src/routes.tsx`, `react/src/hooks/useWebUIMenuItems.tsx`
- **Dependencies**: None
- **Expected PR size**: M (~200 lines)
- **Description**:
  - Copy from `ComputeSessionListPage.tsx`, keeping only the **lower card** (session table with tabs, filters, pagination, terminate action).
  - Remove the upper row (action item card "Create a Session" + `ConfigurableResourceCard`).
  - Remove `useCurrentProjectValue` dependency — query **without project scope** (`scopeId` omitted or set to a global scope) so superadmin sees all sessions across all projects/domains.
  - Reuse `SessionNodes` component and `TerminateSessionModal` as-is.
  - Keep `owner` column visible (already shown for admin+), keep `agent` column per existing `hideAgents` config.
  - Keep CSV export functionality for admin.
  - Register route at `/admin-session` (replace existing `AdminSessionPage` or add alongside).
  - Update `useWebUIMenuItems.tsx` to point to the new page.

### Sub-task 1-2: Add Admin Data (VFolder) list page — FR-2317

- **New file**: `react/src/pages/AdminVFolderNodeListPage.tsx`
- **Changed files**: `react/src/routes.tsx`, `react/src/hooks/useWebUIMenuItems.tsx`
- **Dependencies**: None (parallel with 1-1)
- **Expected PR size**: M (~200 lines)
- **Description**:
  - Copy from `VFolderNodeListPage.tsx`, keeping only the **lower card** (folder table with tabs, filters, pagination, bulk actions).
  - Remove the upper row (action item card "Create Folder" + `StorageStatusPanelCard` + `QuotaPerStorageVolumePanelCard`).
  - Remove `useCurrentProjectValue` dependency — query without project scope so superadmin sees all folders across all projects/domains.
  - Reuse `VFolderNodes`, `DeleteVFolderModal`, `RestoreVFolderModal` as-is.
  - Keep `FolderCreateModal` — admin may still need to create folders (decide in Phase 2 DN-5/6).
  - Register route (e.g., `/admin-data` or add as a tab/menu item in admin section).
  - Add menu item in `useWebUIMenuItems.tsx` admin menu.

### Sub-task 1-3: Add Admin Service (Serving) list page — FR-2318

- **New file**: `react/src/pages/AdminServingPage.tsx`
- **Changed files**: `react/src/routes.tsx`, `react/src/hooks/useWebUIMenuItems.tsx`
- **Dependencies**: None (parallel with 1-1, 1-2)
- **Expected PR size**: M (~150 lines)
- **Description**:
  - Copy from `ServingPage.tsx`, keeping the **service list card** (endpoint table with filters, pagination).
  - Remove `useCurrentProjectValue` dependency — query without `projectID` filter so superadmin sees all services across all projects.
  - Reuse `EndpointList` component as-is.
  - Keep "Start Service" button — admin can still create services (decide CUD scope in Phase 2 DN-4).
  - Register route (e.g., `/admin-serving` or add as menu item).
  - Add menu item in `useWebUIMenuItems.tsx` admin menu.

### Phase 1 — PR Stack

All 3 sub-tasks are independent and can be developed in parallel:

```
main
 ├── feat/FR-2316-admin-session-list    (Sub-task 1-1)
 ├── feat/FR-2317-admin-vfolder-list    (Sub-task 1-2)
 └── feat/FR-2318-admin-serving-list    (Sub-task 1-3)
```

### Phase 1 — Key Decisions

| Decision | Answer |
|----------|--------|
| Project scoping | No project scope — superadmin sees everything |
| Target role | Superadmin only (existing role check is sufficient) |
| Upper cards (resource/status) | Removed — only table card remains |
| Reuse existing components | Yes — SessionNodes, VFolderNodes, EndpointList |
| CUD actions | Keep existing actions as-is for now; refine in Phase 2 |

---

## Phase 2: RBAC role-based menu visibility and data scoping (future)

> Details to be determined after Phase 1 and backend RBAC API implementation.

Phase 2 will cover:
- `useAdminRole` hook (superadmin / domainAdmin / projectAdmin)
- 3-tier menu visibility
- Header project selector control per role
- Project Admin badge
- Project switch confirmation dialog
- Data scope filtering per role (project / domain / all)
- CUD permission restrictions per role (see spec "미결정 사항" DN-1 through DN-6)

### Backend Dependencies

> `TODO(needs-backend): FR-2313`

- User admin role query API (project admin / domain admin / super admin)
- Scope-based entity queries (Session, User, Service, Data)
- Per above, Phase 2 is blocked until backend API is available.

---

## Risks and Notes

1. **Removing `useCurrentProjectValue`**: The existing `ComputeSessionListPage` and `VFolderNodeListPage` use `currentProject.id` for `scopeId`. The admin versions must query without project scope. Verify that the GraphQL API supports querying without `scope_id` (or with a broader scope like `domain:*` or omitting it entirely).

2. **Route naming**: New routes (`/admin-session`, `/admin-data`, `/admin-serving`) must not conflict with existing routes. The existing `/admin-session` route points to `AdminSessionPage` which shows only pending sessions — this will be replaced or renamed.

3. **Component reuse**: `SessionNodes`, `VFolderNodes`, `EndpointList` are fragment-based Relay components. The admin pages will use the same fragments but with different query variables (no project scope). Verify that fragment data shapes remain compatible.

4. **Existing admin pages unchanged**: Other admin pages (credential, environment, scheduler, resource-policy, reservoir, agent, project, settings, maintenance, diagnostics, branding, information) remain unchanged in Phase 1.
