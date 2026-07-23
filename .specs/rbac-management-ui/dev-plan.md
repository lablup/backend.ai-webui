# Dev Plan: RBAC Management UI

> Spec: `.specs/rbac-management-ui/spec.md`
> Epic: FR-1641 | Spec Task: FR-2207
> Created: 2026-03-06

## Overview

Build a complete RBAC (Role-Based Access Control) management UI for superadmins. The UI enables creating/editing/deleting roles, assigning users to roles, and managing fine-grained permissions (scope + entity type + operation). All work is net-new — no existing RBAC UI components exist.

## Schema Gaps (TODO needs-backend)

These items are referenced in the spec but **not present** in the current `data/schema.graphql`:

| Item | Status | Workaround |
|------|--------|------------|
| `UpdateRoleInput.status` field | Missing | Cannot implement activate/deactivate via `adminUpdateRole`. Use `adminDeleteRole` for soft delete only, skip activate/deactivate until backend adds `status` to `UpdateRoleInput`. |
| `rbacScopeEntityCombinations` query | Missing from schema | Hardcode valid combinations from spec's §3 table. Switch to query when backend adds it to schema. |
| `ScopeEntityCombination` type | Missing from schema | N/A — use hardcoded data. |
| `adminUpdatePermission` mutation | Missing | Disable "Edit" button on permissions. Users delete + re-create. |
| `Role.permissions` connection | Missing | Use top-level `adminPermissions(filter: { roleId })` as fallback. |
| `Role.roleAssignments` connection | Missing | Use top-level `adminRoleAssignments(filter: { roleId })` as fallback. |

## Sub-tasks

### ST-1: Foundation — Route, Menu, i18n, and Page Shell [FR-2219](https://lablup.atlassian.net/browse/FR-2219)

**Wave**: 0 (no dependencies)
**Blocked by**: None
**Estimated files**: 5-7

**Scope**:
- Register `/rbac` route in `react/src/routes.tsx` (lazy-loaded)
- Add "RBAC Management" menu item to `superAdminMenu` in `react/src/hooks/useWebUIMenuItems.tsx`
- Add `rbac` feature flag gated to manager version 26.3.0 in `src/lib/backend.ai-client-esm.ts`
- Add i18n keys in `resources/i18n/en.json` and `resources/i18n/ko.json` under `rbac.*` namespace
- Create empty `react/src/pages/RBACManagementPage.tsx` placeholder

**i18n keys** (initial set, expand in later sub-tasks):
```
webui.menu.RBACManagement
rbac.Roles, rbac.RoleName, rbac.RoleDescription, rbac.Source, rbac.Status
rbac.CreateRole, rbac.EditRole, rbac.DeleteRole, rbac.PurgeRole
rbac.Permissions, rbac.Assignments
rbac.ScopeType, rbac.ScopeId, rbac.EntityType, rbac.Operation
rbac.AssignUser, rbac.RevokeUser
rbac.Active, rbac.Inactive, rbac.Deleted
rbac.System, rbac.Custom
rbac.ConfirmDelete, rbac.ConfirmPurge
rbac.DuplicateRoleName, rbac.DuplicatePermission
rbac.RoleNotFound, rbac.PermissionNotFound
rbac.UserAlreadyAssigned, rbac.UserNotAssigned
```

**Acceptance**:
- [ ] `/rbac` route loads an empty page with title
- [ ] Menu item visible only for superadmin
- [ ] Feature gated behind 26.3.0 version check

---

### ST-2: Role List Page — Query, Table, Filters (US-1) [FR-2220](https://lablup.atlassian.net/browse/FR-2220)

**Wave**: 1
**Blocked by**: ST-1 (FR-2219)
**Estimated files**: 3-4

**Scope**:
- Implement `RBACManagementPage.tsx` as query orchestrator:
  - `useLazyLoadQuery` with `adminRoles` query
  - Segmented control for `RoleStatus` filter (ACTIVE / INACTIVE / DELETED)
  - `BAIPropertyFilter` or `BAIGraphQLPropertyFilter` for name search + Source filter
  - Pagination state via `useBAIPaginationOptionStateOnSearchParam`
  - Sort state via `useQueryStates` (nuqs)
  - `BAIFetchKeyButton` for manual refresh
  - "Create Role" button in page header
- Implement `RoleNodes.tsx` fragment component:
  - `@relay(plural: true)` fragment on `Role`
  - `BAITable` with columns: Name (link), Actions (edit/delete buttons), Description, Source (Tag), Created At, Updated At
  - Name column: `Typography.Link`, clicks open detail drawer
  - Actions column: positioned next to Name, always visible buttons
  - Source column: Tag with color coding (SYSTEM=default, CUSTOM=green)
  - SYSTEM roles: edit button disabled
  - DELETED segment: show purge button instead of delete
  - Sorting on Name, Created At, Updated At columns
  - Empty state component
  - Loading skeleton/spin

**GraphQL**:
```graphql
query RBACManagementPageQuery($filter: RoleFilter, $orderBy: [RoleOrderBy!], $first: Int, $after: String) {
  adminRoles(filter: $filter, orderBy: $orderBy, first: $first, after: $after)
    @connection(key: "RBACManagementPage_adminRoles") {
    count
    edges { node { id ...RoleNodesFragment } }
    pageInfo { hasNextPage endCursor }
  }
}
```

**Reference patterns**:
- `ComputeSessionListPage.tsx` — page orchestrator pattern
- `SessionNodes.tsx` — plural fragment + BAITable pattern

**Acceptance**:
- [ ] ACTIVE roles displayed by default
- [ ] Segmented control switches between ACTIVE/INACTIVE/DELETED
- [ ] Name search filters server-side with debounce
- [ ] Source filter (SYSTEM/CUSTOM/All) works
- [ ] Column sorting works (name, createdAt, updatedAt)
- [ ] Relay cursor-based pagination works
- [ ] Role name click triggers drawer open (wired in ST-4)
- [ ] SYSTEM role rows have disabled edit button
- [ ] DELETED segment shows purge button
- [ ] Empty state shown when no roles
- [ ] Loading state shown during fetch

---

### ST-3: Role Creation Modal (US-2) [FR-2221](https://lablup.atlassian.net/browse/FR-2221)

**Wave**: 1
**Blocked by**: ST-1 (FR-2219)
**Estimated files**: 1-2

**Scope**:
- Implement `RoleFormModal.tsx` (shared for create + edit):
  - Ant Design `Modal` + `Form`
  - Fields: Name (required, `Input`), Description (optional, `Input.TextArea`)
  - `BAIButton` with `action` prop for submit
  - Create mode: `adminCreateRole` mutation
  - Auto-focus name field on open
  - Form reset on close
  - Success: `message.success` + close modal + refetch role list
  - Duplicate name (409): inline validation error on name field, keep modal open
  - Other errors: `message.error`
- Wire "Create Role" button in `RBACManagementPage` to open modal

**GraphQL**:
```graphql
mutation AdminCreateRoleMutation($input: CreateRoleInput!) {
  adminCreateRole(input: $input) {
    id name description source status createdAt updatedAt
  }
}
```

**Acceptance**:
- [ ] "Create Role" button opens modal
- [ ] Name field is required with inline validation
- [ ] `adminCreateRole` mutation called on submit
- [ ] Success: toast + modal closes + list refreshes
- [ ] Duplicate name: inline error, modal stays open
- [ ] Loading state on submit button
- [ ] Form resets on close

---

### ST-4: Role Detail Drawer (US-3) [FR-2222](https://lablup.atlassian.net/browse/FR-2222)

**Wave**: 2
**Blocked by**: ST-2 (FR-2220)
**Estimated files**: 2-3

**Scope**:
- Implement `RoleDetailDrawer.tsx`:
  - Ant Design `Drawer` (width 800+)
  - Receives `roleId` prop, opens/closes via state
  - `useLazyLoadQuery` for `adminRole(id: $id)` query
  - Refresh button via `BAIFetchKeyButton`
  - Edit button in header (CUSTOM roles only)
  - Suspense boundary with Skeleton fallback
- Implement `RoleDetailDrawerContent.tsx`:
  - `useFragment` on `RoleDetailDrawerContentFragment`
  - Metadata section: `Descriptions` component with Description, Source (Tag), Status (Tag), Created At, Updated At
  - `Tabs` component with two tabs:
    - "Assignments" tab (with Badge count) — placeholder, implemented in ST-7
    - "Permissions" tab (with Badge count) — placeholder, implemented in ST-8
  - Default tab: Assignments
  - Tab resets to Assignments on drawer close
- Wire role name click in `RoleNodes` to open drawer

**GraphQL**:
```graphql
query RoleDetailDrawerQuery($id: UUID!) {
  adminRole(id: $id) {
    ...RoleDetailDrawerContentFragment
  }
}

fragment RoleDetailDrawerContentFragment on Role {
  id name description source status createdAt updatedAt deletedAt
}
```

**Acceptance**:
- [ ] Clicking role name opens drawer
- [ ] Metadata displayed with Descriptions component
- [ ] Source and Status shown as Tags
- [ ] Edit button visible for CUSTOM, hidden for SYSTEM
- [ ] Two tabs with correct labels
- [ ] Drawer resets to Assignments tab on close
- [ ] Loading skeleton during fetch
- [ ] Switching roles updates drawer content

---

### ST-5: Role Edit Modal (US-4) [FR-2223](https://lablup.atlassian.net/browse/FR-2223)

**Wave**: 2
**Blocked by**: ST-3 (FR-2221), ST-4 (FR-2222)
**Estimated files**: 0-1 (extends RoleFormModal from ST-3)

**Scope**:
- Extend `RoleFormModal.tsx` to support edit mode:
  - Pre-fill form with existing name + description
  - Edit mode: `adminUpdateRole` mutation
  - Only send changed fields (null for unchanged)
  - Save button disabled when no changes
  - Success: `message.success` + close modal + refetch drawer + refetch list
  - Duplicate name (409): inline error, modal stays open
  - Role not found (404): `message.error` + close modal + refetch list
- Wire edit button in drawer header and list action column to open modal

**GraphQL**:
```graphql
mutation AdminUpdateRoleMutation($input: UpdateRoleInput!) {
  adminUpdateRole(input: $input) {
    id name description updatedAt
  }
}
```

**Note**: `UpdateRoleInput` currently lacks `status` field. Status changes handled separately in ST-6.

**Acceptance**:
- [ ] Edit button (drawer/list) opens modal with pre-filled data
- [ ] Only changed fields sent in mutation
- [ ] Save button disabled when no changes
- [ ] Duplicate name: inline error, modal stays open
- [ ] Role not found: error toast + close + refetch
- [ ] Success updates both drawer and list

---

### ST-6: Role Status Management (US-5) [FR-2224](https://lablup.atlassian.net/browse/FR-2224)

**Wave**: 3
**Blocked by**: ST-2 (FR-2220), ST-4 (FR-2222)
**Estimated files**: 1-2

**Scope**:
- Implement role status action handlers (can be in a hook or inline):
  - **Soft Delete** (ACTIVE/INACTIVE → DELETED): `adminDeleteRole` mutation
    - Confirmation dialog with warning message
    - If drawer open, close drawer after delete
  - **Purge** (DELETED → permanent removal): `adminPurgeRole` mutation
    - Strong confirmation dialog (irreversible warning)
    - Handle FK constraint violation (409): guide user to remove assignments/permissions first
  - **Activate/Deactivate**: `TODO(needs-backend)` — `UpdateRoleInput` lacks `status` field
    - Add disabled UI elements with tooltip explaining backend dependency
    - Or skip entirely and add when backend supports it
- Add action buttons to:
  - Role list table action column (contextual by current segment)
  - Role detail drawer header
- Refetch list after status changes

**GraphQL**:
```graphql
mutation AdminDeleteRoleMutation($input: DeleteRoleInput!) {
  adminDeleteRole(input: $input) { id }
}

mutation AdminPurgeRoleMutation($input: PurgeRoleInput!) {
  adminPurgeRole(input: $input) { id }
}
```

**Acceptance**:
- [ ] Delete action available for ACTIVE/INACTIVE roles
- [ ] Delete shows confirmation dialog with role name
- [ ] Purge action available for DELETED roles only
- [ ] Purge shows strong warning dialog
- [ ] Purge FK violation (409) shows guidance message
- [ ] Drawer closes after delete/purge
- [ ] List refreshes after status change
- [ ] `TODO(needs-backend)` markers for activate/deactivate

---

### ST-7: Role Assignment Management (US-6) [FR-2225](https://lablup.atlassian.net/browse/FR-2225)

**Wave**: 4
**Blocked by**: ST-4 (FR-2222)
**Estimated files**: 2-3

**Scope**:
- Implement `RoleAssignmentTab.tsx`:
  - Uses `useLazyLoadQuery` on `adminRoleAssignments(filter: { roleId })` (top-level fallback)
  - Table columns: Email, Actions (remove button), Username, Granted By, Granted At
  - Actions column next to Email, always visible
  - Remove button: confirmation dialog → `adminRevokeRole` mutation
  - "Add User" button + "Refresh" button in tab header
  - Relay cursor-based pagination
  - Empty state when no assignments
  - Badge count on tab label (from connection `count`)
- Implement `AssignRoleModal.tsx`:
  - User search via existing user query (email/name search)
  - Checkbox multi-select in table
  - Already-assigned users excluded or disabled
  - Selected count display
  - Submit: sequential `adminAssignRole` calls per selected user
  - Success: toast + close modal + refetch assignment table
  - Duplicate assignment (409): error toast, modal stays open
  - User not found (404): error toast

**GraphQL**:
```graphql
query RoleAssignmentTabQuery($filter: RoleAssignmentFilter, $first: Int, $after: String) {
  adminRoleAssignments(filter: $filter, first: $first, after: $after) {
    count
    edges {
      node {
        id userId grantedBy grantedAt
        user { email username }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}

mutation AdminAssignRoleMutation($input: AssignRoleInput!) {
  adminAssignRole(input: $input) {
    id userId roleId grantedBy grantedAt
    user { email username }
  }
}

mutation AdminRevokeRoleMutation($input: RevokeRoleInput!) {
  adminRevokeRole(input: $input) { id userId roleId }
}
```

**Acceptance**:
- [ ] Assignment tab shows user list from `adminRoleAssignments`
- [ ] Pagination works
- [ ] "Add User" opens modal with user search
- [ ] Multi-select users via checkboxes
- [ ] Already-assigned users excluded/disabled in modal
- [ ] Sequential `adminAssignRole` calls for multiple users
- [ ] Remove button with confirmation → `adminRevokeRole`
- [ ] Badge count updates after add/remove
- [ ] Error handling for duplicate assignment and not-found
- [ ] Empty state shown when no assignments

---

### ST-8: Permission Management (US-7) [FR-2226](https://lablup.atlassian.net/browse/FR-2226)

**Wave**: 4
**Blocked by**: ST-4 (FR-2222)
**Estimated files**: 2-3

**Scope**:
- Implement `RolePermissionTab.tsx`:
  - Uses `useLazyLoadQuery` on `adminPermissions(filter: { roleId })` (top-level fallback)
  - Flat table columns: Scope Type (Tag), Scope ID (resolved name or UUID), Entity Type (Tag), Operation (Tag), Actions (edit disabled + delete)
  - Tag color coding:
    - Scope Type: DOMAIN=blue, PROJECT=green, USER=orange, etc.
    - Operation: READ=green, CREATE=blue, UPDATE=orange, DELETE/SOFT_DELETE/HARD_DELETE=red, GRANT_*=purple
  - Scope ID: resolve `scope` union (ProjectV2.name, DomainV2.name, UserV2.email) or fallback to UUID
  - Delete button: confirmation → `adminDeletePermission` mutation
  - Edit button: disabled (TODO — `adminUpdatePermission` not available)
  - "Add Permission" button + "Refresh" button in tab header
  - Relay cursor-based pagination
  - Empty state when no permissions
  - Badge count on tab label
- Implement `CreatePermissionModal.tsx`:
  - Cascading form:
    1. Scope Type Select — options from hardcoded `VALID_SCOPE_ENTITY_COMBINATIONS`
    2. Scope ID — dynamic UI based on scope type:
       - DOMAIN: domain list select
       - PROJECT: domain select → project select (cascading)
       - USER: user search select
       - Others: entity list select or UUID input
    3. Entity Type Select — filtered by selected scope type
    4. Operation Select — all `OperationType` values
  - Scope type change resets scope ID + entity type
  - Entity type select disabled until scope type selected
  - Submit: `adminCreatePermission` mutation
  - Success: toast + close modal + refetch permission table
  - Duplicate permission (409): error toast, modal stays open
  - Role not found (404): error toast + close drawer + refetch list

**GraphQL**:
```graphql
query RolePermissionTabQuery($filter: PermissionFilter, $orderBy: [PermissionOrderBy!], $first: Int, $after: String) {
  adminPermissions(filter: $filter, orderBy: $orderBy, first: $first, after: $after) {
    count
    edges {
      node {
        id scopeType scopeId entityType operation
        scope {
          ... on ProjectV2 { name }
          ... on DomainV2 { name }
          ... on UserV2 { email username }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}

mutation AdminCreatePermissionMutation($input: CreatePermissionInput!) {
  adminCreatePermission(input: $input) {
    id roleId scopeType scopeId entityType operation
    scope {
      ... on ProjectV2 { name }
      ... on DomainV2 { name }
      ... on UserV2 { email username }
    }
  }
}

mutation AdminDeletePermissionMutation($input: DeletePermissionInput!) {
  adminDeletePermission(input: $input) { id }
}
```

**Acceptance**:
- [ ] Permission tab shows flat table from `adminPermissions`
- [ ] Tags with color coding for scope type, entity type, operation
- [ ] Scope ID resolved to entity name when possible
- [ ] "Add Permission" opens modal with cascading selects
- [ ] Scope type change resets dependent fields
- [ ] Entity type filtered by selected scope type
- [ ] Entity type disabled until scope type selected
- [ ] Scope ID UI dynamic per scope type
- [ ] Delete with confirmation dialog
- [ ] Edit button present but disabled (TODO needs-backend)
- [ ] Badge count updates after add/delete
- [ ] Pagination works
- [ ] Error handling for duplicate permission and not-found
- [ ] Empty state shown when no permissions

---

## Dependency Graph

```
ST-1 (Foundation)
 ├── ST-2 (Role List) ──┬── ST-4 (Detail Drawer) ──┬── ST-7 (Assignments)
 │                      │                           └── ST-8 (Permissions)
 │                      └── ST-6 (Status Mgmt) ◄─── ST-4
 └── ST-3 (Create Modal) ── ST-5 (Edit Modal) ◄──── ST-4
```

## Execution Waves

| Wave | Sub-tasks | Jira | Description |
|------|-----------|------|-------------|
| 0 | ST-1 | FR-2219 | Foundation: route, menu, i18n, page shell |
| 1 | ST-2, ST-3 | FR-2220, FR-2221 | Role list page + create modal (parallel) |
| 2 | ST-4, ST-5 | FR-2222, FR-2223 | Detail drawer + edit modal |
| 3 | ST-6 | FR-2224 | Status management actions |
| 4 | ST-7, ST-8 | FR-2225, FR-2226 | Assignment + Permission tabs (parallel) |

## PR Stack Strategy

Each sub-task maps to one PR in a Graphite stack:

```
main
 └── feat/rbac-foundation (ST-1)
      └── feat/rbac-role-list (ST-2)
           └── feat/rbac-create-role (ST-3)
                └── feat/rbac-detail-drawer (ST-4)
                     └── feat/rbac-edit-role (ST-5)
                          └── feat/rbac-status-mgmt (ST-6)
                               └── feat/rbac-assignments (ST-7)
                                    └── feat/rbac-permissions (ST-8)
```

## Files to Create/Modify

### New files:
- `react/src/pages/RBACManagementPage.tsx`
- `react/src/components/RoleNodes.tsx`
- `react/src/components/RoleFormModal.tsx`
- `react/src/components/RoleDetailDrawer.tsx`
- `react/src/components/RoleDetailDrawerContent.tsx`
- `react/src/components/RoleAssignmentTab.tsx`
- `react/src/components/AssignRoleModal.tsx`
- `react/src/components/RolePermissionTab.tsx`
- `react/src/components/CreatePermissionModal.tsx`

### Modified files:
- `react/src/routes.tsx` — add `/rbac` route
- `react/src/hooks/useWebUIMenuItems.tsx` — add menu item
- `src/lib/backend.ai-client-esm.ts` — add version feature flag
- `resources/i18n/en.json` — add `rbac.*` keys
- `resources/i18n/ko.json` — add `rbac.*` keys
