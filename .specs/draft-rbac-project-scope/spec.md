# RBAC Project-Scoped Roles

## Overview

Extend the existing RBAC management UI to support project-scoped roles. A role can optionally be associated with a single project scope, which limits its applicability to that project. This involves changes to role creation, role list display, role detail view, permission creation constraints, and user assignment behavior.

## Problem Statement

The backend now supports a `scopes` field on `CreateRoleInput` (type `[ScopeInput!]`) and a `scopes` connection on the `Role` type (type `EntityConnection`). Currently, the WebUI creates roles without any scope, making them global (domain-wide). Administrators need the ability to create project-scoped roles so that permissions and user assignments are confined to a specific project.

## Key Design Decisions

### 1. Single Project Scope Restriction

Although the backend schema supports an array of scopes (`[ScopeInput!]`), the UI restricts selection to **one project at a time**. The selected project is sent as a single-element array: `[{ scopeType: "PROJECT", scopeId: projectId }]`. When no project is selected, the scopes array is omitted (or sent as `null`), creating a global role.

### 2. Immutable Project Scope

Once a role is created with a project scope, the scope **cannot be edited**. The project field is only present in the creation modal. To change the project, the role must be deleted and recreated.

### 3. Project Scope Data Flow via Relay Fragments

The role's project scope data flows through Relay fragments (NOT prop drilling). Child components (RoleAssignmentTab, CreatePermissionModal) read the project scope from their own fragments, not from parent props.

---

## Backend GraphQL API Reference

### Role Type - scopes connection

```graphql
type Role implements Node {
  # ... existing fields ...
  scopes(filter: EntityFilter, orderBy: [EntityOrderBy!], ...): EntityConnection!
}
```

The `EntityConnection` contains `EntityRef` nodes with `scopeType`, `scopeId`, and a resolved `entity` union (which can be `ProjectV2`, `DomainV2`, etc.).

### CreateRoleInput - scopes field

```graphql
input CreateRoleInput {
  name: String!
  description: String = null
  source: RoleSource! = CUSTOM
  scopes: [ScopeInput!] = null
}

input ScopeInput {
  scopeType: RBACElementType!
  scopeId: String!
}
```

### AssignRoleInput / BulkAssignRoleInput - projectId field

```graphql
input AssignRoleInput {
  userId: UUID!
  roleId: UUID!
  projectId: UUID
}

input BulkAssignRoleInput {
  roleId: UUID!
  userIds: [UUID!]!
  projectId: UUID
}
```

---

## Requirements

### Must Have

- [ ] **Role Creation**: Optional "Project" single-select field in creation modal; sends `scopes: [{ scopeType: "PROJECT", scopeId }]`
- [ ] **Role Table**: "Project" column showing project name or "-" for global roles
- [ ] **Role Detail Drawer**: "Project" row in metadata section showing project name or "-"
- [ ] **Permission Creation (project-scoped role)**: When `PROJECT` scopeType is selected, scopeId auto-fills with role's project and selector is disabled
- [ ] **Permission Creation (global role)**: When `PROJECT` scopeType is selected, `USER` entity type is disabled; scopeId is freely selectable
- [ ] **User Assignment**: `projectId` from `scopes[0].scopeId` is passed in assign/bulk-assign mutations; undefined for global roles
- [ ] **Immutability**: Project field is only in creation modal, not in edit modal

### Nice to Have

- [ ] Filtering the role list by project scope
- [ ] Tooltip on the disabled USER entity type explaining why it is disabled

---

## Detailed Behavior

### 1. Role Creation Modal (updated)

```
+-----------------------------------+
|  Create Role                  [X] |
+-----------------------------------+
|  Name *                           |
|  +-----------------------------+  |
|  |                             |  |
|  +-----------------------------+  |
|                                   |
|  Description                      |
|  +-----------------------------+  |
|  |                             |  |
|  +-----------------------------+  |
|                                   |
|  Project                          |
|  +-----------------------------+  |
|  | Select a project...      v  |  |
|  +-----------------------------+  |
|  (Optional. Leave empty for       |
|   global role)                    |
+-----------------------------------+
|              [Cancel]    [Create] |
+-----------------------------------+
```

- Single selection only
- When selected: `input.scopes = [{ scopeType: "PROJECT", scopeId: selectedProjectId }]`
- When empty: `input.scopes` is omitted or `null`
- Form resets (including project) when modal closes

### 2. Role List Table - Project Column

| Column | Data Source | Notes |
|--------|------------|-------|
| Project | `scopes.edges[0].node.entity ... on ProjectV2 { name }` | Project name or "-"; not sortable; UUID fallback if entity unresolved |

### 3. Role Detail Drawer Metadata

```
+------------------------------------------+
| Role Name                    [Edit] [X]  |
+------------------------------------------+
|  | Description  Role description text |   |
|  | Project      My Project            |   |  <-- New
|  | Source       CUSTOM                |   |
|  | Status       ACTIVE                |   |
|  | Created      2026-03-01 10:00      |   |
|  | Updated      2026-03-02 15:30      |   |
+------------------------------------------+
```

### 4. Permission Creation - Project-Scoped Role

When role has a project scope AND user selects `PROJECT` as scopeType:
- **scopeId**: Auto-filled with role's project, selector **disabled**
- **entityType**: All options enabled (including USER)

### 5. Permission Creation - Global Role

When role has NO project scope AND user selects `PROJECT` as scopeType:
- **scopeId**: Freely selectable (any project)
- **entityType**: `USER` option **disabled**; all others enabled

### 6. User Assignment - projectId Pass-through

- Project-scoped role: `projectId = scopes[0].scopeId` passed in `BulkAssignRoleInput`
- Global role: `projectId = undefined`
- No additional UI — derived automatically from role's scope via Relay fragment

---

## Out of Scope

- Multi-scope roles (UI restricts to single project)
- Domain-scoped roles (only PROJECT scopeType)
- Editing a role's scope after creation
- Scope-based filtering in role list

---

## Affected Components

| Component | Change |
|-----------|--------|
| `RoleFormModal` | Add optional project selector (creation only) |
| `RoleNodes` | Add scopes to fragment, add Project column |
| `RoleDetailDrawerContent` | Add scopes to fragment, display project in metadata |
| `RoleAssignmentTab` | Read project scope via fragment, pass projectId in assign mutations |
| `CreatePermissionModal` | Auto-fill scopeId for project-scoped roles; disable USER entity for global roles |
