# RBAC Management UI Specification

## Overview

Add a Role-Based Access Control (RBAC) management screen to the Backend.AI WebUI. Provide a complete management UI that allows superadmins to create/edit/delete roles, assign users to each role, and grant fine-grained permissions. This corresponds to the backend GraphQL API (v26.3.0) and uses Relay-based pagination with Ant Design 6 components.

## Problem Statement

Currently, the Backend.AI WebUI has no UI for managing RBAC. Although the backend has RBAC GraphQL APIs implemented, administrators must execute GraphQL queries directly to manage roles and permissions. This specification defines a complete RBAC management interface for superadmins.

---

## Key Design Decisions

### 1. Scope Model

A Role is a container that only has a name and description. **Scope exists on Permission, not on Role.**

- Permission structure: `(roleId, scopeType, scopeId, entityType, operation)`
- Assignment structure: `(userId, roleId, grantedBy, grantedAt)`
- Example: When user A has VFolder UPDATE permission on Example Project through "test role":
  - Permission: `scopeType=PROJECT, scopeId=<example_project_id>, entityType=VFOLDER, operation=UPDATE`
  - Assignment: `userId=<user_A_id>, roleId=<test_role_id>`

### 2. Role Sub-Connection Structure

Two Relay connections, `permissions` and `roleAssignments`, will be added to `type Role`. This allows querying permission and assignment data through the Role node's sub-connections without separate top-level queries when viewing role details.

```
Role (Node)
├── permissions: PermissionConnection     ← List of permissions for this role
│   └── edges[].node: Permission
└── roleAssignments: RoleAssignmentConnection  ← List of users assigned to this role
    └── edges[].node: RoleAssignment
```

With this structure:
- The role list page queries roles using the top-level `adminRoles` query.
- The role detail Drawer spreads `permissions` and `roleAssignments` connections within the Role fragment.
- Each connection supports Relay pagination (`first`, `after`), enabling independent pagination within each tab in the Drawer.

### 3. scopeType-entityType Mapping

The `rbacScopeEntityCombinations` query is **implemented** on the backend (BA-4808, BA-4809). This query returns the list of valid entityTypes for each scopeType. The frontend should call this query when adding permissions to display only valid entityTypes based on the selected scopeType.

**Valid scopeType → entityType combinations** (source: `VALID_SCOPE_ENTITY_COMBINATIONS`):

| scopeType | Valid entityTypes |
|-----------|------------------|
| `DOMAIN` | RESOURCE_GROUP, CONTAINER_REGISTRY, USER, PROJECT, NETWORK, STORAGE_HOST |
| `PROJECT` | RESOURCE_GROUP, CONTAINER_REGISTRY, SESSION, VFOLDER, DEPLOYMENT, NETWORK, USER, STORAGE_HOST |
| `USER` | RESOURCE_GROUP, SESSION, VFOLDER, DEPLOYMENT, KEYPAIR |
| `RESOURCE_GROUP` | AGENT |
| `AGENT` | KERNEL |
| `SESSION` | KERNEL |
| `MODEL_DEPLOYMENT` | ROUTING, SESSION |
| `CONTAINER_REGISTRY` | IMAGE |
| `STORAGE_HOST` | VFOLDER |

> **NOTE**: scopeType includes not only DOMAIN/PROJECT/USER but also RESOURCE_GROUP, AGENT, SESSION, MODEL_DEPLOYMENT, CONTAINER_REGISTRY, and STORAGE_HOST. The Scope Type Select in the permission creation Modal must display all of these scopeTypes.

### 4. Layout

| Screen | Type | Description |
|--------|------|-------------|
| Role list | Full page (table) | Queried via `adminRoles` top-level query |
| Role detail | Drawer (right side panel) | Metadata + sub-connection query via Role node fragment |
| Role create/edit | Modal | `adminCreateRole` / `adminUpdateRole` mutation |
| Add user | Modal | `adminAssignRole` mutation |
| Add permission | Modal | `adminCreatePermission` mutation |

### 5. System Roles (SYSTEM source)

- Displayed with a Source column in the role list table (Tag component)
- Name/description are read-only (cannot be edited)
- However, user assignment/removal and permission add/delete are available even for SYSTEM roles
- CUSTOM roles can be fully edited including name/description

### 6. Status Lifecycle

- Segmented control on the role list page for status filter: **ACTIVE** / **INACTIVE** / **DELETED**
- State transition rules:

```
ACTIVE ──deactivate──→ INACTIVE
ACTIVE ──delete──────→ DELETED
INACTIVE ──activate──→ ACTIVE
INACTIVE ──delete────→ DELETED
DELETED ──purge──────→ (permanently removed)
```

- Activate/Deactivate: Uses the `status` field of `adminUpdateRole` mutation (implemented)
- Soft delete: `adminDeleteRole` mutation
- Hard delete: `adminPurgeRole` mutation

> **Planned future change**: Currently both INACTIVE and DELETED states represent soft deletion. In the future, INACTIVE will be deprecated and soft deletion will be unified under the DELETED state only. When this change is applied:
> - Segmented control: simplified to ACTIVE / DELETED (2 states)
> - State transition: ACTIVE ──delete──→ DELETED ──purge──→ (permanently removed)
> - "Deactivate" / "Activate" actions removed
> - Current implementation proceeds with 3 states (ACTIVE/INACTIVE/DELETED), designed to minimize migration cost when INACTIVE is deprecated.

---

## Backend GraphQL API Reference

> Source: `backend.ai` repository, `chore/rbac-gql-summary` branch, `docs/manager/graphql-reference/rbac-schema.graphql`

### Enum Types

```graphql
enum RBACElementType {
  # Scope hierarchy — usable as scopeType; top-level scope hierarchy is
  #   limited to DOMAIN / PROJECT / USER
  #   (Some subsequent values like RESOURCE_GROUP, SESSION, AGENT can also be
  #    used as scopeType but are not part of the hierarchy structure)
  DOMAIN
  PROJECT
  USER

  # Root-queryable entities (scope-based) — usable as entityType
  SESSION
  VFOLDER
  DEPLOYMENT
  MODEL_DEPLOYMENT
  KEYPAIR
  NOTIFICATION_CHANNEL
  NETWORK
  RESOURCE_GROUP
  CONTAINER_REGISTRY
  STORAGE_HOST
  IMAGE
  ARTIFACT
  ARTIFACT_REGISTRY
  SESSION_TEMPLATE
  APP_CONFIG

  # Root-queryable entities (superadmin only) — usable as entityType
  RESOURCE_PRESET
  USER_RESOURCE_POLICY
  KEYPAIR_RESOURCE_POLICY
  PROJECT_RESOURCE_POLICY
  ROLE
  AUDIT_LOG
  EVENT_LOG

  # Automation-only entity — usable as entityType
  NOTIFICATION_RULE

  # Infrastructure entities
  AGENT
  KERNEL
  ROUTING

  # Entity-level scope
  ARTIFACT_REVISION
}

enum OperationType {
  CREATE
  READ
  UPDATE
  SOFT_DELETE
  HARD_DELETE
  GRANT_ALL
  GRANT_READ
  GRANT_UPDATE
  GRANT_SOFT_DELETE
  GRANT_HARD_DELETE
}

enum RoleSource { SYSTEM, CUSTOM }
enum RoleStatus { ACTIVE, INACTIVE, DELETED }
enum RoleOrderField { NAME, CREATED_AT, UPDATED_AT }
enum PermissionOrderField { ID, ENTITY_TYPE }
```

### Core Types

```graphql
type Role implements Node {
  id: ID!
  name: String!
  description: String
  source: RoleSource!
  status: RoleStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime

  # ── Planned connections (direct access under Role) ──
  permissions(
    filter: PermissionFilter
    orderBy: [PermissionOrderBy!]
    first: Int, after: String
    last: Int, before: String
  ): PermissionConnection!

  roleAssignments(
    filter: RoleAssignmentFilter
    first: Int, after: String
    last: Int, before: String
  ): RoleAssignmentConnection!
}
```

> **NOTE**: The `permissions` and `roleAssignments` connections are planned for backend addition.
> The `Role` type in the `chore/rbac-gql-summary` branch does not yet have these connections,
> but they are expected to be available by the time of frontend implementation.
> If the connections are not yet provided, use top-level queries as a fallback
> (`adminPermissions(filter: { roleId })`, `adminRoleAssignments(filter: { roleId })`),
> and switch to connections once they are added.

```graphql
type Permission implements Node {
  id: ID!
  roleId: UUID!
  scopeType: RBACElementType!
  scopeId: String!
  entityType: RBACElementType!
  operation: OperationType!
  role: Role              # The role this permission belongs to
  scope: EntityNode       # Scope entity (resolvable)
}

type RoleAssignment implements Node {
  id: ID!
  userId: UUID!
  roleId: UUID!
  grantedBy: UUID
  grantedAt: DateTime!
  role: Role              # The assigned role
  user: UserV2            # The assigned user
}

type EntityRef implements Node {
  id: ID!
  scopeType: RBACElementType!
  scopeId: String!
  entityType: RBACElementType!
  entityId: String!
  registeredAt: DateTime!
  entity: EntityNode      # Resolved entity object
}

# EntityNode union — used in scope field, etc.
union EntityNode =
    UserV2 | ProjectV2 | DomainV2
  | VirtualFolderNode | ImageV2 | ComputeSessionNode
  | Artifact | ArtifactRegistry | AppConfig
  | NotificationChannel | NotificationRule
  | ModelDeployment | ResourceGroup | ArtifactRevision | Role
```

### Connection Types

```graphql
type RoleConnection {
  pageInfo: PageInfo!
  edges: [RoleEdge!]!
  count: Int!             # Total count (used for Badge display, etc.)
}

type RoleEdge {
  cursor: String!
  node: Role!
}

type PermissionConnection {
  pageInfo: PageInfo!
  edges: [PermissionEdge!]!
  count: Int!
}

type PermissionEdge {
  cursor: String!
  node: Permission!
}

type RoleAssignmentConnection {
  pageInfo: PageInfo!
  edges: [RoleAssignmentEdge!]!
  count: Int!
}

type RoleAssignmentEdge {
  cursor: String!
  node: RoleAssignment!
}
```

### Filter & OrderBy Input Types

```graphql
input RoleFilter {
  name: StringFilter = null
  source: [RoleSource!] = null
  status: [RoleStatus!] = null
  AND: [RoleFilter!] = null
  OR: [RoleFilter!] = null
  NOT: RoleFilter = null
}

input RoleOrderBy {
  field: RoleOrderField!
  direction: OrderDirection! = DESC
}

input PermissionFilter {
  roleId: UUID = null
  scopeType: RBACElementType = null
  entityType: RBACElementType = null
}

input PermissionOrderBy {
  field: PermissionOrderField!
  direction: OrderDirection! = DESC
}

input RoleAssignmentFilter {
  roleId: UUID = null
}
```

### Additional Type — scopeType-entityType Combinations

```graphql
type ScopeEntityCombination {
  scopeType: RBACElementType!
  validEntityTypes: [RBACElementType!]!
}
```

### Top-Level Queries

| Query | Description | Usage |
|-------|-------------|-------|
| `adminRole(id: UUID!)` | Single role query | Drawer refetch |
| `adminRoles(filter, orderBy, first, after, ...)` | Role list (paginated) | Role list page |
| `adminPermissions(filter, orderBy, first, after, ...)` | Permission list (paginated) | Fallback: when Role connection is not provided |
| `adminRoleAssignments(filter, first, after, ...)` | Role assignment list (paginated) | Fallback: when Role connection is not provided |
| `adminEntities(filter, orderBy, first, after, ...)` | Entity association search | Entity search when selecting scope ID |
| `rbacScopeEntityCombinations` | Valid scopeType-entityType combination list | entityType filtering in permission creation Modal |

### Mutations

| Mutation | Input | Return | Usage |
|----------|-------|--------|-------|
| `adminCreateRole` | `CreateRoleInput(name!, description?, source?)` | `Role` | Create role |
| `adminUpdateRole` | `UpdateRoleInput(id!, name?, description?, status?)` | `Role` | Edit role (including status change) |
| `adminDeleteRole` | `DeleteRoleInput(id!)` | `DeleteRolePayload(id)` | Soft delete |
| `adminPurgeRole` | `PurgeRoleInput(id!)` | `PurgeRolePayload(id)` | Hard delete |
| `adminCreatePermission` | `CreatePermissionInput(roleId!, scopeType!, scopeId!, entityType!, operation!)` | `Permission` | Add permission |
| `adminUpdatePermission` | `UpdatePermissionInput(id!, scopeType?, scopeId?, entityType?, operation?)` | `Permission` | Edit permission (planned) |
| `adminDeletePermission` | `DeletePermissionInput(id!)` | `DeletePermissionPayload(id)` | Delete permission |
| `adminAssignRole` | `AssignRoleInput(userId!, roleId!)` | `RoleAssignment` | Assign user |
| `adminRevokeRole` | `RevokeRoleInput(userId!, roleId!)` | `RoleAssignment` | Remove user |

### Backend Implementation Status

**Implemented:**
- **`rbacScopeEntityCombinations` query** (BA-4808, BA-4809): Returns valid scopeType-entityType combinations as `ScopeEntityCombination[]`. The permission creation Modal calls this query to dynamically filter entityTypes.
- **`myRoles` query** (BA-4812): Queries the current user's assigned roles. Outside the scope of this spec but implemented on the backend for future use.
- **`assignments_by_role_loader` DataLoader** (BA-4792): Batch loads assignment data by role ID. Will be used inside the Role connection.

**Not yet supported (TODO):**
- **Role sub-connections (permissions, roleAssignments)**: Under development in `feature/rbac-role-permissions-field` branch (BA-4785: permissions field, BA-4787: roleAssignments field). Not merged to main. Use top-level queries (`adminPermissions`, `adminRoleAssignments`) as fallback until added.
- **Permission update mutation**: `adminUpdatePermission` mutation is planned. Until added, use delete-and-recreate as a workaround.
- **Batch assign/revoke mutations**: Currently `adminAssignRole`/`adminRevokeRole` only handle a single user. The backend plans to support batch input or parallel processing. Until added, call sequentially from the client.

---

## Requirements

### Must Have

- [ ] Superadmin can view the role list in a table format
- [ ] Roles can be filtered by status using a Segmented control (ACTIVE/INACTIVE/DELETED)
- [ ] Roles can be searched by name
- [ ] Source (SYSTEM/CUSTOM) filter can be applied
- [ ] Roles can be sorted by name, creation date, and modification date
- [ ] New roles (name, description) can be created via a Modal
- [ ] Role details (metadata + assignment tab + permission tab) can be viewed in a Drawer
- [ ] The assignment/permission tabs in the Drawer query data through the Role node's sub-connections
- [ ] CUSTOM role name and description can be edited via a Modal
- [ ] SYSTEM roles cannot have their name/description edited (assignment/permission changes are allowed)
- [ ] Roles can be soft-deleted (transition to DELETED status)
- [ ] DELETED roles can be permanently deleted (purge)
- [ ] Role status can be toggled via activate/deactivate
- [ ] The assignment tab shows the list of users assigned to the role
- [ ] Users can be added to a role from the assignment tab
- [ ] Users can be removed from a role from the assignment tab
- [ ] The permission tab shows the permission list in a flat table
- [ ] New permissions (scopeType, scopeId, entityType, operation) can be added from the permission tab
- [ ] Individual permissions can be edited from the permission tab (use delete-and-recreate until backend API is added)
- [ ] Individual permissions can be deleted from the permission tab
- [ ] Multiple users can be batch added/removed from the assignment tab

### Nice to Have

- [ ] "Create another" checkbox in the role creation Modal (keep Modal open after creation, reset form)
- [ ] Select multiple operations at once when adding permissions for batch creation
- [ ] scopeType, entityType column filtering in the permission table
- [ ] Select rows in the role list table for batch deletion

---

## User Stories

### US-1: Role List View and Filtering

**User Story**: As a superadmin, I can view all roles defined in the system in a table and filter by status/source/name to quickly find desired roles.

**Screen Layout**:

```
┌─────────────────────────────────────────────────────────────┐
│  Role Management                    [+ Create Role] [Refresh]│
├─────────────────────────────────────────────────────────────┤
│  [ ACTIVE | INACTIVE | DELETED ]                             │
│  [Search by name...]  [Source: All ▼]                        │
├──────┬─────────┬──────────┬──────────┬──────────┬──────────┤
│ Name │ Actions │ Desc.    │ Source   │ Created  │ Updated  │
├──────┼─────────┼──────────┼──────────┼──────────┼──────────┤
│ role1│[Edit][Del]│ Desc...│ CUSTOM   │ 2026-... │ 2026-... │
│ role2│[Edit][Del]│ Desc...│ SYSTEM   │ 2026-... │ 2026-... │
│ role3│[Edit][Del]│ Desc...│ CUSTOM   │ 2026-... │ 2026-... │
└──────┴─────────┴──────────┴──────────┴──────────┴──────────┘
                     [< 1 2 3 ... >]
```

- Full page layout
- Header: Page title + Create Role button + Refresh button
- Segmented control: ACTIVE (default) / INACTIVE / DELETED
- Search/filter area: Name search + Source filter (SYSTEM/CUSTOM/All) integrated via BAIPropertyFilter
- Table columns:

| Column | Data Source | Sortable | Notes |
|--------|------------|----------|-------|
| Name | `name` | Yes (`RoleOrderField.NAME`) | Opens role detail Drawer on click. `<Typography.Link>` style. |
| Actions | - | No | Positioned next to Name. Edit/delete buttons **always visible**; SYSTEM roles have the edit button disabled. |
| Description | `description` | No | Text with ellipsis (`ellipsis`). Shows `-` when empty. |
| Source | `source` | No | `Tag` component. SYSTEM=default color (gray), CUSTOM=green for visual distinction. |
| Created | `createdAt` | Yes (`RoleOrderField.CREATED_AT`) | `dayjs(createdAt).format('lll')` |
| Updated | `updatedAt` | Yes (`RoleOrderField.UPDATED_AT`) | `dayjs(updatedAt).format('lll')` |

**Data Query — GraphQL Query Structure**:

```graphql
query AdminRolesPageQuery(
  $filter: RoleFilter
  $orderBy: [RoleOrderBy!]
  $first: Int
  $after: String
) {
  adminRoles(
    filter: $filter
    orderBy: $orderBy
    first: $first
    after: $after
  ) @connection(key: "AdminRolesPage_adminRoles") {
    count
    edges {
      node {
        id
        ...RoleNodesFragment
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}

fragment RoleNodesFragment on Role @relay(plural: true) {
  id
  name
  description
  source
  status
  createdAt
  updatedAt
  # NOTE: Detail data for the Drawer (permissions, roleAssignments connections)
  # is not included in the list query. Query via adminRole(id: ...) separate query
  # or refetchable fragment when Drawer opens to prevent over-fetching.
}
```

- `filter` variable: Combines Segmented status value + name search term + Source filter
  - Example: `{ status: [ACTIVE], name: { contains: "search term" }, source: [CUSTOM] }`
- `orderBy` variable: Toggles sort field/direction on column header click
  - Example: `[{ field: NAME, direction: ASC }]`
- On Segmented control change → update `filter.status` value → refetch query
- On name search → update `filter.name` value → refetch query (with debounce)

**Role Name Click → Drawer Open Flow**:

1. User clicks a role name in the table
2. Pass the selected role's ID to the Drawer component
3. Drawer opens and queries the Role's detail information via `adminRole(id: ...)`
4. Role metadata along with sub-connections (permissions, roleAssignments) are displayed in tabs

**Acceptance Criteria**:
- [ ] ACTIVE roles are displayed by default when entering the page
- [ ] Clicking the Segmented control filters to show only roles of that status
- [ ] Name search uses `StringFilter` for server-side filtering
- [ ] Source filter (SYSTEM/CUSTOM) applies server-side filtering
- [ ] Column header clicks enable ascending/descending sort by name/created/updated
- [ ] Relay cursor-based pagination works
- [ ] Clicking a role name opens the role detail Drawer
- [ ] SYSTEM role rows show edit/delete buttons in the actions column, but the edit button is disabled
- [ ] Skeleton or Spin is displayed during table loading
- [ ] In the DELETED segment, a purge (permanent delete) button is shown in actions
- [ ] An appropriate Empty component is displayed when there are no roles
- [ ] Pagination resets to the first page when switching segments, searching, or applying filters

---

### US-2: Role Creation

**User Story**: As a superadmin, I can create a new custom role and add it to the RBAC system.

**Screen Layout**:

```
┌─────────────────────────────────┐
│  Create Role                 [X] │
├─────────────────────────────────┤
│                                 │
│  Name *                         │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  Description                    │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│              [Cancel]  [Create]  │
└─────────────────────────────────┘
```

- Modal dialog
- Input fields:
  - **Name** (required): `Input` component.
  - **Description** (optional): `Input.TextArea` component. Empty value allowed.
  - **Status** (optional): `Select` component. ACTIVE (default) / INACTIVE selectable.
- Footer: Cancel / Create buttons (`BAIButton` action prop used)
- Create/Add button is enabled by default; validation is performed on click

**Mutation**:

```graphql
mutation AdminCreateRoleMutation($input: CreateRoleInput!) {
  adminCreateRole(input: $input) {
    id
    name
    description
    source
    status
    createdAt
    updatedAt
  }
}
```

- `input`: `{ name: "Role name", description: "Description" }`
- `source` is not passed (backend applies default value CUSTOM)

**Error Handling**:

| Error Condition | HTTP | Frontend Response |
|----------------|------|-------------------|
| Name not entered | - | Show inline validation error below name field ("Please enter a role name") |
| Duplicate role name | 409 (unique constraint) | Show inline error below name field ("A role with this name already exists"). Keep Modal open so user can modify the name |
| Other server errors | 4xx/5xx | Display error message via `message.error` |

**User Scenario — Duplicate Name Creation Attempt**:

1. Superadmin clicks the "Create Role" button
2. Enters an already existing role name "Admin" in the Modal
3. Clicks the "Create" button
4. Backend returns a 409 error
5. Modal does not close; inline error "A role with this name already exists" is displayed below the name field
6. User changes the name to "Project Admin" and clicks "Create" again
7. Creation succeeds → success notification displayed, Modal closes

**Acceptance Criteria**:
- [ ] Clicking the "Create Role" button on the role list page opens the Modal
- [ ] The name field is required; clicking the create button with an empty value shows a validation error
- [ ] `adminCreateRole` mutation is called to create the role
- [ ] On successful creation, a success notification (`message.success`) is displayed and the Modal closes
- [ ] After successful creation, the role list is automatically refreshed (refetch)
- [ ] On duplicate role name, the Modal stays open and an inline error is displayed on the name field
- [ ] On other mutation errors, an error message is displayed via `message.error`
- [ ] A loading state is shown on the button during creation (`BAIButton` action prop)
- [ ] The form is reset when the Modal closes
- [ ] Focus is automatically set to the name field (when Modal opens)

---

### US-3: Role Detail View

**User Story**: As a superadmin, I can view detailed information about a specific role in a Drawer, and view users assigned to that role and permissions in separate tabs.

**Screen Layout**:

```
┌──────────────────────────────────────────┐
│  Role Name                    [Edit] [X]  │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │
│  │ Description  Role description text │  │
│  │ Source       CUSTOM                │  │
│  │ Status       ACTIVE                │  │
│  │ Created      2026-03-01 10:00      │  │
│  │ Updated      2026-03-02 15:30      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌─ Assignments (3) ─┬─ Permissions (5) ┐│
│  │                                      ││
│  │  [+ Add User]                        ││
│  │  ┌──────┬──────┬──────────┬──────┬──┐││
│  │  │Email │Name  │Granted By│Date  │  │││
│  │  ├──────┼──────┼──────────┼──────┼──┤││
│  │  │a@..  │Kim   │admin     │03-01 │🗑│││
│  │  │b@..  │Lee   │admin     │03-02 │🗑│││
│  │  └──────┴──────┴──────────┴──────┴──┘││
│  └──────────────────────────────────────┘│
└──────────────────────────────────────────┘
```

- Drawer (right side panel, width 800px or more)
- Header: Role name (`Typography.Title`) + Edit button (CUSTOM only) + Close button
- Metadata area (Ant Design `Descriptions` component):
  - Description, Source (Tag), Status (Tag), Created, Updated
- 2 tabs (Ant Design `Tabs` component):
  - **Assignments** tab: User assignment table (→ US-6)
  - **Permissions** tab: Permission table (→ US-7)
  - Each tab label displays `count` with `Badge` (using the connection's `count` field)

**Data Query — Drawer Separate Query Structure**:

When a name is clicked in the role list, the Role's ID is passed to the Drawer. Inside the Drawer, `useLazyLoadQuery` calls the `adminRole(id: ...)` query to fetch Role metadata and sub-connections. Separating from the list query prevents over-fetching.

```graphql
# Separate query used in the Drawer
query RoleDetailDrawerQuery($id: UUID!) {
  adminRole(id: $id) {
    ...RoleDetailDrawerContentFragment
  }
}

# Fragment for the Drawer content component
fragment RoleDetailDrawerContentFragment on Role {
  id
  name
  description
  source
  status
  createdAt
  updatedAt
  deletedAt

  # Connection fragment spread for assignment tab
  ...RoleAssignmentTabFragment

  # Connection fragment spread for permission tab
  ...RolePermissionTabFragment
}

# Assignment tab component fragment — Role's roleAssignments connection
fragment RoleAssignmentTabFragment on Role {
  roleAssignments(first: 20)
    @connection(key: "RoleAssignmentTab_roleAssignments") {
    count
    edges {
      node {
        id
        userId
        grantedBy
        grantedAt
        user {
          email
          username
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}

# Permission tab component fragment — Role's permissions connection
fragment RolePermissionTabFragment on Role {
  permissions(first: 20)
    @connection(key: "RolePermissionTab_permissions") {
    count
    edges {
      node {
        id
        scopeType
        scopeId
        entityType
        operation
        scope {
          ... on ProjectV2 { name }
          ... on DomainV2 { name }
          ... on UserV2 { email }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

**Detailed Data Flow**:

1. Click name in role list table → change Drawer open state + pass selected Role's ID to Drawer
2. Inside Drawer, call separate query via `useLazyLoadQuery(RoleDetailDrawerQuery, { id: roleId })`
3. Pass the query result's fragment ref to the `RoleDetailDrawerContent` component, which reads data via `useFragment`
4. Metadata area renders with Role's direct fields
5. Tab components each read `RoleAssignmentTabFragment` and `RolePermissionTabFragment` via separate `useFragment` calls to render sub-connection data
6. After mutations, refresh table data via refetch

> **Fallback Strategy**: If Role sub-connections are not yet available on the backend, tab components call separate top-level queries via `useLazyLoadQuery`:
> - Assignment tab: `adminRoleAssignments(filter: { roleId: $roleId })`
> - Permission tab: `adminPermissions(filter: { roleId: $roleId })`
> Switch to fragment-based approach once connections are added.

**Acceptance Criteria**:
- [ ] Clicking a role name in the list opens the Drawer from the right
- [ ] The role name is displayed as `Typography.Title` at the top of the Drawer
- [ ] The metadata area displays description, Source (Tag), Status (Tag), Created, and Updated via `Descriptions` component
- [ ] An "Edit" button is displayed at the top for CUSTOM roles
- [ ] The "Edit" button is not displayed for SYSTEM roles
- [ ] "Assignments" and "Permissions" tabs exist, with "Assignments" selected by default
- [ ] Each tab label displays the corresponding connection's `count` value as a `Badge`
- [ ] Already-fetched data is preserved when switching tabs (Relay cache)
- [ ] Tab state resets to the "Assignments" tab when the Drawer closes
- [ ] `Skeleton` or `Spin` is displayed while Drawer content is loading
- [ ] Clicking a different role updates the Drawer content to that role

---

### US-4: Role Edit

**User Story**: As a superadmin, I can edit the name and description of an existing custom role.

**Screen Layout**:
- Modal dialog (same form as the creation Modal)
- Existing values are pre-filled in the input fields
- Status field included: ACTIVE / INACTIVE selectable
- Footer: Cancel / Save buttons (enabled by default, validation on click)

**Mutation**:

```graphql
mutation AdminUpdateRoleMutation($input: UpdateRoleInput!) {
  adminUpdateRole(input: $input) {
    id
    name
    description
    updatedAt
  }
}
```

- `input`: `{ id: "<role_uuid>", name: "New name", description: "New description", status: ACTIVE }`
- Unchanged fields are passed as `null` to preserve existing values

**Error Handling**:

| Error Condition | HTTP | Frontend Response |
|----------------|------|-------------------|
| Duplicate role name | 409 (unique constraint) | Show inline error below name field ("A role with this name already exists"). Keep Modal open |
| Role not found | 404 | `message.error` ("The role could not be found"). Close Modal + refetch list |
| Other server errors | 4xx/5xx | Display error message via `message.error` |

**Acceptance Criteria**:
- [ ] Clicking the "Edit" button in the role detail Drawer or list action opens the edit Modal
- [ ] The Modal has the existing name and description pre-filled
- [ ] The edit Modal does not open for SYSTEM roles (the button itself is absent)
- [ ] `adminUpdateRole` mutation is called to edit the role
- [ ] On successful edit, a success notification is displayed and the Modal closes
- [ ] After successful edit, the Drawer metadata and list table are automatically refreshed (refetch)
- [ ] On duplicate role name edit, the Modal stays open and an inline error is displayed on the name field
- [ ] The save button is disabled when there are no changes
- [ ] A loading state is shown on the button during edit

---

### US-5: Role Status Management (Activate/Deactivate/Delete/Purge)

**User Story**: As a superadmin, I can deactivate a role to temporarily suspend its use, soft delete it to transition to deleted status, or permanently delete (purge) it to remove it from the system.

**Action Definitions**:

| Current Status | Available Action | Result Status | API | Confirmation Dialog |
|---------------|-----------------|---------------|-----|-------------------|
| ACTIVE | Deactivate | INACTIVE | `adminUpdateRole(input: { id, status: INACTIVE })` | Simple confirmation |
| ACTIVE | Delete | DELETED | `adminDeleteRole` | Warning confirmation |
| INACTIVE | Activate | ACTIVE | `adminUpdateRole(input: { id, status: ACTIVE })` | None |
| INACTIVE | Delete | DELETED | `adminDeleteRole` | Warning confirmation |
| DELETED | Purge | (permanently removed) | `adminPurgeRole` | Strong warning confirmation |

**Action Locations**:
- Actions column in the role list table (displayed as buttons)
- Top of the role detail Drawer (displayed as buttons)

**Confirmation Dialog Content**:
- **Delete**: "Are you sure you want to delete role '{name}'? The users and permissions assigned to this role will be retained, but the role will transition to DELETED status, no longer granting access permissions, and can only be restored if needed."
- **Purge**: "Are you sure you want to permanently delete role '{name}'? This action cannot be undone."

**Error Handling**:

| Error Condition | HTTP | Frontend Response |
|----------------|------|-------------------|
| Role not found | 404 | `message.error` ("The role could not be found"). Refetch list |
| FK constraint violation on purge (remaining assignments/permissions) | 409 | `message.error` ("Cannot permanently delete the role because it still has assigned users or permissions. Please remove assignments and permissions first.") |
| Other server errors | 4xx/5xx | Display error message via `message.error` |

**User Scenario — Purge Failure**:

1. Superadmin clicks the "Purge" button for a role in the DELETED segment
2. A strong warning confirmation dialog is displayed: "Are you sure you want to permanently delete role '{name}'? This action cannot be undone."
3. User clicks "Confirm"
4. If the backend returns a FK constraint violation error (409):
   - `message.error` displays "Cannot permanently delete the role because it still has assigned users or permissions. Please remove assignments and permissions first."
   - User opens the role's Drawer to remove assignments/permissions first, then retries purge

**Mutations**:

```graphql
# Soft delete
mutation AdminDeleteRoleMutation($input: DeleteRoleInput!) {
  adminDeleteRole(input: $input) { id }
}

# Hard delete
mutation AdminPurgeRoleMutation($input: PurgeRoleInput!) {
  adminPurgeRole(input: $input) { id }
}
```

**Acceptance Criteria**:
- [ ] "Deactivate" action is available for ACTIVE roles (uses `status` field of `adminUpdateRole`)
- [ ] "Activate" action is available for INACTIVE roles (uses `status` field of `adminUpdateRole`)
- [ ] "Delete" action is available for ACTIVE/INACTIVE roles (soft delete)
- [ ] "Purge" action is available for DELETED roles
- [ ] A confirmation dialog is displayed before delete/purge execution
- [ ] The purge confirmation dialog includes a strong warning message that it cannot be undone
- [ ] On purge failure (FK constraint violation 409), an error message guiding the user to remove assignments/permissions first is displayed
- [ ] For SYSTEM roles, only the name/description edit action is disabled (status change, assignment, and permission changes are available)
- [ ] The list is automatically refreshed after status changes (if the role no longer belongs to the current Segmented status, it disappears from the list)
- [ ] If the Drawer is open when deleting, the Drawer closes

> **Planned future change**: When INACTIVE status is deprecated, "Deactivate"/"Activate" actions will be removed, simplifying to soft delete (DELETED) and hard delete (purge) in 2 stages. (See Key Design Decisions section 6)

---

### US-6: Role Assignment Management (Users)

**User Story**: As a superadmin, I can assign or remove users from a specific role to grant or revoke that role's permissions for users.

**Screen Layout — Assignment Tab (inside Drawer)**:

```
┌────────────────────────────────────────┐
│                       [Refresh] [+ Add User] │
├──────────┬───────┬──────┬──────┬──────┤
│ Email    │Actions│ Name │ By   │ Date │
├──────────┼───────┼──────┼──────┼──────┤
│ a@ex.com │[Remove]│ Kim │admin │03-01 │
│ b@ex.com │[Remove]│ Lee │admin │03-02 │
└──────────┴───────┴──────┴──────┴──────┘
          [< 1 2 ... >]
```

- "Assignments" tab in the role detail Drawer
- Top right: "Refresh" button + "Add User" button (primary action "Add User" is rightmost)
- Assigned users table columns:

| Column | Data Source | Notes |
|--------|------------|-------|
| Email | `node.user.email` | `UserV2`'s `email` field. Primary column identifying the row. |
| Actions | - | Positioned next to Email. "Remove" button **always visible**. |
| Name | `node.user.username` | `UserV2`'s `username` field |
| Granted By | `node.grantedBy` | UUID. Resolve to username when possible |
| Granted At | `node.grantedAt` | `dayjs(grantedAt).format('lll')` |

**Data Query**:

Query via the Role's `roleAssignments` connection (see US-3's `RoleAssignmentTabFragment`).

```graphql
# Assignment tab — Role sub-connection
fragment RoleAssignmentTabFragment on Role {
  id                    # Used as roleId for adminRevokeRole
  source                # Determine if SYSTEM
  roleAssignments(first: 20)
    @connection(key: "RoleAssignmentTab_roleAssignments") {
    count
    edges {
      node {
        id
        userId
        grantedBy
        grantedAt
        user {
          email
          username
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

**Screen Layout — Add User Modal**:

```
┌──────────────────────────────────┐
│  Add User                     [X] │
├──────────────────────────────────┤
│  [Search by email or name...]     │
│  ┌──────────┬──────┬──────────┐  │
│  │ ☐ Email  │ Name │ Status   │  │
│  ├──────────┼──────┼──────────┤  │
│  │ ☑ c@..   │ Park │ ACTIVE   │  │
│  │ ☐ d@..   │ Choi │ ACTIVE   │  │
│  │ ☐ e@..   │ Jung │ INACTIVE │  │
│  └──────────┴──────┴──────────┘  │
│                                  │
│  Selected: 1 user(s)             │
├──────────────────────────────────┤
│              [Cancel]  [Add]      │
└──────────────────────────────────┘
```

- User search: Server-side search by email/name using BAIPropertyFilter (same UX as the credential page)
- User selection: Multiple selection via checkboxes
- Already assigned users are excluded or shown as disabled in the list
- Selected user count display
- "Add" button: Enabled by default; validates selection on click

**Mutations**:

```graphql
# User assignment
mutation AdminAssignRoleMutation($input: AssignRoleInput!) {
  adminAssignRole(input: $input) {
    id
    userId
    roleId
    grantedBy
    grantedAt
    user { email username }
  }
}

# User removal
mutation AdminRevokeRoleMutation($input: RevokeRoleInput!) {
  adminRevokeRole(input: $input) {
    id
    userId
    roleId
  }
}
```

- Multiple user selection: Once the backend adds batch input support, process in a single call. Until then, call `adminAssignRole` sequentially for each user
- Refetch table data after successful assignment
- Refetch table data after successful removal

**Error Handling**:

| Error Condition | HTTP | Error Code | Frontend Response |
|----------------|------|------------|-------------------|
| Re-assigning already assigned user | 409 | `role_create_already-exists` | `message.error` ("This user is already assigned to this role"). Keep Modal open |
| Attempting to remove unassigned user | 400 | `role_purge_not-found` | `message.error` ("This user is not assigned to this role"). Refetch table |
| Assigning non-existent user | 404 | `not-found` | `message.error` ("User not found"). Keep Modal open |
| Non-existent role | 404 | `not-found` | `message.error` ("Role not found"). Close Drawer + refetch list |
| Other server errors | 4xx/5xx | - | Display error message via `message.error` |

**User Scenario — Duplicate Assignment Attempt**:

1. Superadmin clicks the "Add User" button in the role Drawer's assignment tab
2. Selects user "Kim (a@example.com)" in the Modal and clicks "Add"
3. If this user is already assigned to the role (e.g., another admin assigned them concurrently), the backend returns a 409 error
4. `message.error` displays "This user is already assigned to this role"
5. Modal stays open so other users can be selected

**User Scenario — Removing Already Removed User**:

1. Superadmin clicks the "Remove" button for user "Lee" in the assignment tab
2. Clicks "Confirm" in the confirmation dialog
3. If another admin has already removed this user, the backend returns a 400 error
4. `message.error` displays "This user is not assigned to this role"
5. Assignment table is refetched to show the latest state

**Acceptance Criteria**:
- [ ] Selecting the "Assignments" tab shows the role's `roleAssignments` connection data
- [ ] User list is displayed with Relay cursor-based pagination
- [ ] Clicking the "Add User" button opens the user selection Modal
- [ ] Users can be searched by email/name in the Modal
- [ ] Already assigned users are excluded or shown as disabled in the Modal list
- [ ] Selecting one or more users and clicking "Add" assigns them via `adminAssignRole` mutation
- [ ] On successful assignment, a success message is displayed and the assignment table is refreshed
- [ ] Attempting to assign an already-assigned user shows an error message
- [ ] Clicking the "Remove" button shows a confirmation dialog, then removes the user via `adminRevokeRole` mutation
- [ ] On successful removal, a success message is displayed and the assignment table is refreshed
- [ ] Badge count on the Drawer tab label is updated after assignment/removal
- [ ] "Add User" and "Remove" functions work identically for SYSTEM roles
- [ ] An appropriate Empty component is displayed when there are no assigned users

---

### US-7: Permission Management

**User Story**: As a superadmin, I can add or delete fine-grained permissions (scope + entity type + operation) for a specific role to precisely control that role's access.

**Screen Layout — Permission Tab (inside Drawer)**:

```
┌────────────────────────────────────────────────────────────────┐
│  [Filter...]                        [Refresh] [+ Add Permission]│
├───────────┬──────────────┬───────────┬───────────┬──────────────┤
│ Scope Type│ Scope ID     │ Entity    │ Operation │ Actions      │
├───────────┼──────────────┼───────────┼───────────┼──────────────┤
│ PROJECT   │ My Project   │ VFOLDER   │ CREATE    │ [Edit][Delete]│
│ PROJECT   │ My Project   │ VFOLDER   │ READ      │ [Edit][Delete]│
│ PROJECT   │ My Project   │ VFOLDER   │ UPDATE    │ [Edit][Delete]│
│ DOMAIN    │ Default      │ IMAGE     │ READ      │ [Edit][Delete]│
└───────────┴──────────────┴───────────┴───────────┴──────────────┘
                          [< 1 2 ... >]
```

- "Permissions" tab in the role detail Drawer
- Header: Filter UI on the left (optional), "Refresh" + "Add Permission" buttons on the right (primary action "Add Permission" is rightmost)
- Flat table (one row = one Permission record) columns:

| Column | Data Source | Notes |
|--------|------------|-------|
| Scope Type | `node.scopeType` | Displayed as `Tag` component (DOMAIN=blue, PROJECT=green, USER=orange, etc.) |
| Scope ID | `node.scopeId` + `node.scope` | Shows `scopeId` by default. Displays name if `scope` union can be resolved (e.g., ProjectV2.name, DomainV2.name). Shows UUID as-is if resolution fails. |
| Entity Type | `node.entityType` | Displayed as `Tag` component |
| Operation | `node.operation` | Displayed as `Tag` component (color-coded for read/write/delete distinction) |
| Actions | - | "Edit"/"Delete" buttons **always visible**. Edit button disabled when `adminUpdatePermission` is not supported. |

**Data Query**:

Query via the Role's `permissions` connection (see US-3's `RolePermissionTabFragment`).

```graphql
fragment RolePermissionTabFragment on Role {
  id                    # Used as roleId for adminCreatePermission
  source                # Determine if SYSTEM
  permissions(first: 20)
    @connection(key: "RolePermissionTab_permissions") {
    count
    edges {
      node {
        id
        scopeType
        scopeId
        entityType
        operation
        scope {
          # Resolve scope entity name
          ... on ProjectV2 { name }
          ... on DomainV2 { name }
          ... on UserV2 { email username }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

**Screen Layout — Add Permission Modal**:

```
┌──────────────────────────────────────┐
│  Add Permission                  [X] │
├──────────────────────────────────────┤
│                                      │
│  Scope Type *                        │
│  ┌──────────────────────────────┐    │
│  │ PROJECT                   ▼  │    │  ← Load scopeType list from
│  └──────────────────────────────┘    │    rbacScopeEntityCombinations
│                                      │
│  Scope ID *                          │
│  ┌──────────────────────────────┐    │
│  │ [Domain ▼] [Project ▼]      │    │  ← Dynamic UI based on scopeType
│  └──────────────────────────────┘    │
│                                      │
│  Entity Type *                       │
│  ┌──────────────────────────────┐    │
│  │ VFOLDER                   ▼  │    │
│  └──────────────────────────────┘    │
│                                      │
│  Operation *                         │
│  ┌──────────────────────────────┐    │
│  │ CREATE                    ▼  │    │
│  └──────────────────────────────┘    │
│                                      │
├──────────────────────────────────────┤
│                  [Cancel]  [Add]      │
└──────────────────────────────────────┘
```

- **Scope Type Select** (`Select`): Display `scopeType` values from the `rbacScopeEntityCombinations` query results
  - Valid scopeTypes: DOMAIN, PROJECT, USER, RESOURCE_GROUP, AGENT, SESSION, MODEL_DEPLOYMENT, CONTAINER_REGISTRY, STORAGE_HOST

- **Scope ID input/select** (dynamic UI based on scope type):
  - `DOMAIN`: Domain list `Select` (using existing domain list query)
  - `PROJECT`: Domain `Select` → Project `Select` for that domain (cascading selection)
  - `USER`: User search `Select` (email/name search)
  - `RESOURCE_GROUP`: Resource group list `Select`
  - `SESSION`, `AGENT`, `MODEL_DEPLOYMENT`, `CONTAINER_REGISTRY`, `STORAGE_HOST`: Entity list `Select` or direct ID input
  - Reset Scope ID field when scope type changes

- **Entity Type Select** (`Select`): Use `rbacScopeEntityCombinations` query to display only `validEntityTypes` for the selected scopeType
  - Example: When scopeType=PROJECT is selected → only RESOURCE_GROUP, CONTAINER_REGISTRY, SESSION, VFOLDER, DEPLOYMENT, NETWORK, USER, STORAGE_HOST are selectable
  - Reset entityType field when scopeType changes

- **Operation Select** (`Select`): Single selection from `OperationType` values
  - Nice to Have: Multiple selection for batch creation

- "Add" button is enabled by default; validates that required fields are filled on click

**Mutations**:

```graphql
mutation AdminCreatePermissionMutation($input: CreatePermissionInput!) {
  adminCreatePermission(input: $input) {
    id
    roleId
    scopeType
    scopeId
    entityType
    operation
    scope {
      ... on ProjectV2 { name }
      ... on DomainV2 { name }
      ... on UserV2 { email username }
    }
  }
}

mutation AdminUpdatePermissionMutation($input: UpdatePermissionInput!) {
  adminUpdatePermission(input: $input) {
    id
    scopeType
    scopeId
    entityType
    operation
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

- Permission edit: Clicking the "Edit" button shows an edit Modal with the same form as the add Modal, pre-filled with existing values. Calls `adminUpdatePermission` mutation. (Edit button disabled until API is added)
- Refetch table data after successful permission addition
- Refetch table data after successful permission edit
- Refetch table data after successful permission deletion

**Error Handling**:

| Error Condition | HTTP | Error Code | Frontend Response |
|----------------|------|------------|-------------------|
| Duplicate permission (same roleId+scopeType+scopeId+entityType+operation) | 409 | unique constraint | `message.error` ("An identical permission already exists"). Keep Modal open |
| Invalid operation type | 400 | `api_parsing_invalid-parameters` | Display error message via `message.error` |
| Adding permission to non-existent role | 404 | `not-found` | `message.error` ("Role not found"). Close Modal + close Drawer + refetch list |
| Deleting non-existent permission | 404 | `not-found` | `message.error` ("Permission not found"). Refetch table |
| Other server errors | 4xx/5xx | - | Display error message via `message.error` |

**User Scenario — Duplicate Permission Addition Attempt**:

1. Superadmin clicks the "Add Permission" button in the permission tab
2. Selects scopeType=PROJECT, scopeId=My Project, entityType=VFOLDER, operation=CREATE in the Modal
3. Clicks "Add"
4. If an identical permission already exists, the backend returns a 409 error
5. `message.error` displays "An identical permission already exists"
6. Modal stays open so different values can be selected

**User Scenario — Deleting Already Deleted Permission**:

1. Superadmin clicks the "Delete" button for a specific permission in the permission tab
2. Clicks "Confirm" in the confirmation dialog
3. If another admin has already deleted this permission, the backend returns a 404 error
4. `message.error` displays "Permission not found"
5. Permission table is refetched to show the latest state

**scopeType-entityType Combination Query (Permission Add Modal initial loading)**:

```graphql
query RbacScopeEntityCombinationsQuery {
  rbacScopeEntityCombinations {
    scopeType
    validEntityTypes
  }
}
```

- Call this query when the Modal opens (or during app initialization) to cache combination data
- The scopeType Select lists the `scopeType` values from the combination data
- When the user selects a scopeType, only the corresponding `validEntityTypes` are displayed in the entityType Select

**Acceptance Criteria**:
- [ ] Selecting the "Permissions" tab shows the role's `permissions` connection data in a flat table
- [ ] Each permission is displayed as one row (one row = scopeType + scopeId + entityType + operation)
- [ ] scopeType, entityType, and operation are displayed as `Tag` components with color distinction
- [ ] scopeId is displayed as the entity name when the `scope` union type can be resolved (e.g., ProjectV2.name → "My Project")
- [ ] scopeId is displayed as the UUID value as-is when resolution fails
- [ ] Clicking the "Add Permission" button opens the permission creation Modal
- [ ] The Scope ID input UI changes dynamically when selecting a scope type in the Modal
  - [ ] `DOMAIN` selected: Domain list Select is displayed
  - [ ] `PROJECT` selected: Domain Select + Project Select are displayed in cascade
  - [ ] `USER` selected: User search Select is displayed
  - [ ] `RESOURCE_GROUP` selected: Resource group list Select is displayed
  - [ ] Other scopeTypes: Entity list Select or direct ID input is displayed
- [ ] Scope ID field and Entity Type field are both reset when scope type changes
- [ ] Entity Type Select uses the `rbacScopeEntityCombinations` query to display only valid entityTypes for the selected scopeType
- [ ] Entity Type Select is disabled before scopeType is selected
- [ ] "Add" button is enabled by default; validates that required fields are filled on click
- [ ] `adminCreatePermission` mutation is used to add permissions
- [ ] On successful addition, a success message is displayed and the permission table is refreshed
- [ ] An error message is displayed when adding a duplicate permission
- [ ] Clicking the "Edit" button opens an edit Modal pre-filled with existing values (`adminUpdatePermission` button is disabled when not supported)
- [ ] entityType filter applies identically when changing scopeType during permission edit
- [ ] On successful edit, a success message is displayed and the permission table is refreshed
- [ ] Clicking the "Delete" button shows a confirmation dialog, then deletes the permission via `adminDeletePermission` mutation
- [ ] On successful deletion, a success message is displayed and the permission table is refreshed
- [ ] Badge count on the Drawer tab label is updated after add/edit/delete
- [ ] "Add Permission", "Edit", and "Delete" functions work identically for SYSTEM roles
- [ ] An appropriate Empty component is displayed when there are no permissions
- [ ] Permission table supports Relay cursor-based pagination

---

## Out of Scope

- **my-role query / Self-service role view**: UI for regular users to check their own roles is not included in this spec
- **Entity screen integration (Phase 2)**: Adding RBAC permission columns/buttons to each entity list screen is separated to Phase 2
- **Role-based UI visibility control**: Dynamically showing/hiding menus/buttons based on roles is not included
- **Batch permission templates**: Applying pre-defined permission sets at once is not included
- **Permission inheritance/hierarchy**: Permission inheritance structure between roles is not included
- **RBAC change audit logs**: UI for role/permission/assignment change history is not included
- **Non-admin access**: This UI is for superadmins only. Access control for other roles is not considered

---

## Changes from Mockup

> Original mockup reference: `backend.ai-control-panel` repository, `feat/FR-1642-rbac-management-ui-mockup` branch

| # | Change | Reason |
|---|--------|--------|
| 1 | Removed Scope from Role | Scope exists on Permission. Role is just a name/description container |
| 2 | Changed Permission table to flat | All permissions have the same `(scopeType, scopeId, entityType, operation)` structure |
| 3 | 3 tabs → 2 tabs | Unified "Scope Permissions" and "Entity Permissions" into a single "Permissions" tab |
| 4 | Added status Segmented control | ACTIVE/INACTIVE/DELETED lifecycle management |
| 5 | System role distinction (Source column) | SYSTEM roles are protected as read-only |
| 6 | Expanded Entity types | Extended from mockup's 4 types (VFolder, Session, Image, Endpoint) to the full RBACElementType enum |

---

## Related Issues

- FR-1642: RBAC Management UI mockup implementation (control-panel repository)
- BA-4808: RBAC scope-entity combination constants definition (**implemented**, merged to main)
- BA-4809: RBAC scope-entity combinations GraphQL query (**implemented**, merged to main)
- BA-4792: assignments_by_role_loader DataLoader implementation (**implemented**, merged to main)
- BA-4812: my_roles GraphQL query addition (**implemented**, merged to main, outside this spec's scope)
- BA-4785: Add permissions connection to Role type (in development, `feature/rbac-role-permissions-field` branch)
- BA-4787: Add roleAssignments connection to Role type (in development, `feature/rbac-role-permissions-field` branch)

---

## Technical Notes (for implementors)

> This section provides reference information for implementors and does not mandate implementation approach.

### Relay Patterns

- Use Query orchestrator + Fragment component architecture
- Role list page: `useLazyLoadQuery` (query orchestrator) + `useFragment` (RoleNodes fragment component)
- Role detail Drawer: Query via separate `adminRole(id: ...)` query (separated from list query to prevent over-fetching)
- Sub-connections (permissions, roleAssignments): Use `useFragment` + `@connection` directive in each tab component
- Refresh table data via refetch after mutations (directly manipulating Relay store in table UI causes table size mismatch issues; direct store updates are suitable for infinite scroll UX)

### Component Pattern References

Reference similar table+Drawer patterns in the existing project:

- `react/src/pages/ComputeSessionListPage.tsx` — Table + Drawer open pattern
- `react/src/components/AgentDetailDrawerContent.tsx` — Drawer with Descriptions + Tabs pattern
- `react/src/components/MountedVFolderLinks.tsx` — Parent node sub-connection (`vfolder_nodes.edges`) access pattern
- `react/src/components/SessionNodes.tsx` — `@relay(plural: true)` fragment pattern
- `react/src/pages/ReservoirArtifactDetailPage.tsx` — `@connection` directive usage pattern

### BAI Components

Prefer project custom components over base Ant Design components:

- `BAIButton` — async `action` prop (auto loading state)
- `BAIPropertyFilter` — Search/filter UI
- `BAITable` — Project standard table
- `BAIFlex` — Layout flex container
- `BAIErrorBoundary` / `ErrorBoundaryWithNullFallback` — Error boundaries

### React Compiler

- Use `'use memo'` directive at the top of component bodies

### i18n

- Use `useTranslation()` for all user-facing strings
- Support Korean/English at minimum
- Translation key naming: `rbac.RoleName`, `rbac.CreateRole`, `rbac.Permission`, etc.
