# RBAC Admin Role-based Admin Menu Behavior — Dev Plan

## Spec Reference

`.specs/FR-1692-enhanced-admin-menu/spec.md`

## Epic: FR-1692 (Enhanced Admin menu)

## Parent Task: FR-2313 (Improve admin menu behavior based on RBAC admin role)

---

## Phase 1: Add entity list pages to Admin menu (superadmin only)

RBAC role API is not yet available from the backend (`TODO(needs-backend): FR-2313`). Phase 1 focuses on adding Session, Data, Service, and User list pages to the Admin menu for **superadmin only**, without project scoping. Each page reuses existing table/list components but is a separate page component tailored for admin use.

The resolved decisions from the spec (DN-1 through DN-6, dated 2026-03-23) are applied to Phase 1 as follows:

| Decision | Resolution | Phase 1 Impact |
|----------|-----------|----------------|
| DN-1: User page mutations | Read-only in initial version | User page shows list only, no CUD |
| DN-2: Domain admin role setting | `user` only (not `admin`) | Deferred (no mutations in Phase 1) |
| DN-3: Purge user | Deferred | Deferred (no mutations in Phase 1) |
| DN-4: Service management | Full management (modify + delete) | Admin Service page allows modify/delete but NO "Start Service" button |
| DN-5: Folder creation | User menu only | Admin Data page has NO folder creation button |
| DN-6: Domain admin folder mgmt | Deferred | Deferred to Phase 2 |

### Sub-task 1-1: Add Admin Session list page — FR-2316

- **GitHub Issue**: #6118
- **New file**: `react/src/pages/AdminComputeSessionListPage.tsx`
- **Changed files**: `react/src/routes.tsx`, `react/src/hooks/useWebUIMenuItems.tsx`
- **Dependencies**: None
- **Expected PR size**: M (~200 lines)
- **Description**:
  - Create new page component derived from `ComputeSessionListPage.tsx`, keeping only the **lower card** (session table with tabs for running/finished, type filters, pagination, terminate/cancel actions).
  - Remove the upper row (action item card "Create a Session" + `ConfigurableResourceCard`).
  - Remove `useCurrentProjectValue` dependency — query **without project scope** (`scopeId` omitted or set to a global scope) so superadmin sees all sessions across all projects/domains.
  - Reuse `SessionNodes` component and `TerminateSessionModal` as-is.
  - Keep `owner` column visible (already shown for admin+).
  - Keep `agent` column per existing `hideAgents` config (visible only for superadmin).
  - Keep CSV export functionality for admin.
  - Register route at `/admin-session`, replacing the existing `AdminSessionPage` (which only shows pending sessions).
  - The existing `admin-session` menu key in `useWebUIMenuItems.tsx` already points to `/admin-session`; update the route component import.

### Sub-task 1-2: Add Admin Data (VFolder) list page — FR-2317

- **GitHub Issue**: #6119
- **New file**: `react/src/pages/AdminVFolderNodeListPage.tsx`
- **Changed files**: `react/src/routes.tsx`, `react/src/hooks/useWebUIMenuItems.tsx`
- **Dependencies**: None (parallel with 1-1)
- **Expected PR size**: M (~200 lines)
- **Description**:
  - Create new page component derived from `VFolderNodeListPage.tsx`, keeping only the **lower card** (folder table with tabs for active/deleted, filters, pagination, bulk delete/restore).
  - Remove the upper row (action item card "Create Folder" + `StorageStatusPanelCard` + `QuotaPerStorageVolumePanelCard`).
  - **No folder creation** (DN-5 resolved): Remove `FolderCreateModal` and "Create Folder" button entirely. Folder creation is only available from the user menu.
  - Remove `useCurrentProjectValue` dependency — query without `scopeId` so superadmin sees all folders across all projects/domains.
  - Reuse `VFolderNodes`, `DeleteVFolderModal`, `RestoreVFolderModal` as-is.
  - Register route at `/admin-data`.
  - Add `'admin-data'` to `VALID_MENU_KEYS` in `useWebUIMenuItems.tsx`.
  - Add menu item in `adminMenu` array in `useWebUIMenuItems.tsx`.

### Sub-task 1-3: Add Admin Service (Serving) list page — FR-2318

- **GitHub Issue**: #6120
- **New file**: `react/src/pages/AdminServingPage.tsx`
- **Changed files**: `react/src/routes.tsx`, `react/src/hooks/useWebUIMenuItems.tsx`
- **Dependencies**: None (parallel with 1-1, 1-2)
- **Expected PR size**: M (~150 lines)
- **Description**:
  - Create new page component derived from `ServingPage.tsx`, keeping the service list card (endpoint table with lifecycle stage filter, property filters, pagination).
  - Remove `useCurrentProjectValue` dependency — query without `projectID` filter so superadmin sees all services.
  - Reuse `EndpointList` component as-is.
  - **No "Start Service" button** (DN-4 resolved): Service creation is only available from the user menu. The admin page allows modify and delete actions on services in scope, but no creation.
  - Keep modify (settings update) and delete (terminate/destroy) actions enabled for services in scope. The `EndpointList` component already supports these actions.
  - Register route at `/admin-serving`.
  - Add `'admin-serving'` to `VALID_MENU_KEYS` in `useWebUIMenuItems.tsx`.
  - Add menu item in `adminMenu` array in `useWebUIMenuItems.tsx`.

### Phase 1 — PR Stack

All 3 sub-tasks are independent and can be developed in parallel:

```
main
 ├── feat/FR-2316-admin-session-list       (Sub-task 1-1, #6118)
 ├── feat/FR-2317-admin-vfolder-list       (Sub-task 1-2, #6119)
 └── feat/FR-2318-admin-serving-list       (Sub-task 1-3, #6120)
```

> **Note**: Admin User page (`/credential`) already exists in `adminMenu` and requires no changes in Phase 1.

### Phase 1 — Key Decisions Applied

| Decision | Answer |
|----------|--------|
| Project scoping | No project scope — superadmin sees everything |
| Target role | Superadmin only (existing role check is sufficient) |
| Upper cards (resource/status) | Removed — only table card remains |
| Reuse existing components | Yes — SessionNodes, VFolderNodes, EndpointList |
| Service CUD (DN-4) | Modify + delete allowed; NO "Start Service" button |
| Data CUD (DN-5) | NO folder creation button; delete/restore allowed |
| User page (DN-1) | Already exists at `/credential`; read-only constraint applies in Phase 2 |

---

## Phase 2: RBAC role-based menu visibility and data scoping (future)

> Blocked on backend RBAC API (`TODO(needs-backend): FR-2313`). Details to be refined after Phase 1 and backend API implementation.

Phase 2 will cover the following, informed by the resolved decisions:

### 2-A: `useAdminRole` hook and role identification
- New hook to identify the user's effective admin role: `superadmin | domainAdmin | projectAdmin | none`
- Consumes backend API that returns admin role information (super_admin, domain_admin, project_admin)
- Applies priority: super admin > domain admin > project admin
- Backend dependency: User admin role query API

### 2-B: 3-tier menu visibility
- Update `useWebUIMenuItems.tsx` to show different admin menu items based on effective admin role
- Project admin + domain admin: Session, User, Service, Data pages only
- Super admin: All admin pages (including Agent, Project, Settings, Maintenance, etc.)
- Update `WebUISider.tsx` `hasAdminCategoryRole` logic to support 3 tiers

### 2-C: Header project selector control per role
- Update `WebUIHeader.tsx` to show/hide project selector based on admin role and menu context
- Project admin in admin mode: Show project selector (navigate between admin projects)
- Domain admin / Super admin in admin mode: Hide project selector
- Normal menu: Always show project selector (unchanged)

### 2-D: Project Admin badge in project selector
- Update `ProjectSelect.tsx` to show "Project Admin" badge on projects where user has admin rights
- Badge hidden if user is domain admin or super admin (to avoid confusion)

### 2-E: Project switch confirmation dialog
- When project admin switches to a project without admin rights while in admin mode:
  - Show confirm dialog: "You don't have admin rights for this project. Switching will exit admin mode."
  - Accept: Switch project + exit admin mode
  - Cancel: Stay in current project + admin mode

### 2-F: Data scope filtering per role
- Update admin pages (Session, User, Service, Data) to apply scope based on role:
  - Project admin: `scope_id: project:{id}`
  - Domain admin: `scope_id: domain:{name}` or domain-level query
  - Super admin: No scope (see all)
- Backend dependency: Scope-based entity queries

### 2-G: CUD permission restrictions per role
- Session page: terminate/cancel within scope (already works, just needs scope filtering)
- User page (DN-1/2/3): Add creation with field restrictions (domain fixed, projects limited, role = "user" only for domain admin). Purge user TBD.
- Service page (DN-4): Modify + delete within scope. No creation in admin mode.
- Data page (DN-5/6): Folder creation deferred. Domain admin full management deferred.

### Backend Dependencies

> `TODO(needs-backend): FR-2313`

- User admin role query API (project admin / domain admin / super admin)
- Scope-based entity queries (Session, User, Service, Data) with project/domain/all scope parameters
- Phase 2 is blocked until backend API is available.

---

## Risks and Notes

1. **Removing `useCurrentProjectValue`**: The existing `ComputeSessionListPage` and `VFolderNodeListPage` use `currentProject.id` for `scopeId`. The admin versions must query without project scope. Verify that the GraphQL API supports querying without `scope_id` (or with a broader scope like `domain:*` or omitting it entirely).

2. **Route naming**: New routes (`/admin-session`, `/admin-data`, `/admin-serving`) must not conflict with existing routes. The existing `/admin-session` route points to `AdminSessionPage` which shows only pending sessions — this will be replaced.

3. **Component reuse**: `SessionNodes`, `VFolderNodes`, `EndpointList` are fragment-based Relay components. The admin pages will use the same fragments but with different query variables (no project scope). Verify that fragment data shapes remain compatible.

4. **Existing admin pages unchanged**: Other admin pages (credential, environment, scheduler, resource-policy, reservoir, agent, project, settings, maintenance, diagnostics, branding, information) remain unchanged in Phase 1.

5. **DN-4 Service modify/delete**: The `EndpointList` component currently enables modify/delete only for the service owner. For admin pages, this restriction needs to be relaxed so that admins can modify/delete services within their scope. This may require passing an `isAdminMode` prop or similar to `EndpointList`.

6. **Admin Data page without creation**: With DN-5 resolved, the admin Data page is simpler than originally planned — no `FolderCreateModal` needed. This reduces the PR size for sub-task 1-2.
