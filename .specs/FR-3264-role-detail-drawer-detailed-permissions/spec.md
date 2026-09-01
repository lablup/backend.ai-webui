# Role Detail Drawer — "Detailed Permissions" Tab Redesign Spec

> **Task**: [FR-3264](https://lablup.atlassian.net/browse/FR-3264) · GitHub clone [#8165](https://github.com/lablup/backend.ai-webui/issues/8165)
> **Status**: Finalized draft (spec only — no Epic / Jira sub-issues created yet; all open questions resolved on 2026-07-07)
> **Created**: 2026-07-07
> **Author**: sungchul@lablup.com

## Overview

Redesign the **tab content of `RoleDetailDrawer`** so that an admin can understand,
at a glance, **which scopes a role covers and which permissions it carries on each
scope**. Today those two facets live in two separate tabs (Scopes, Permissions), so
the admin has to mentally join "this role has project `default` as a scope" (Scopes
tab) with "this role has a `PROJECT / READ` permission" (Permissions tab). This spec
merges those two tabs into a single **"Detailed Permissions"** (Korean: **'세부 권한'**)
tab built from **per-scope-type tables**. Each row is a concrete scope instance, and
the selectable entity types render as display-only tags whose color encodes the grant
state (fully / partially / not allowed). The row's name action cell (or row selection)
opens a **scope-level permission edit modal** that edits the scope's entire
entity × action combination set at once as a checkbox grid. The configurable
combination data comes from the existing `rbacPermissionMatrix` query.

This is a **WebUI-only** change. No backend or GraphQL schema change is expected; all
data comes from queries and mutations that already exist in `data/schema.graphql`
(verified — see [Data / GraphQL Notes](#data--graphql-notes)).

## Background — Current State

`RBACManagementPage` → role row title click → `RoleDetailDrawer` →
`RoleDetailDrawerInner` (loads the role via `useLazyLoadQuery`) →
`RoleDetailDrawerContent`.

`RoleDetailDrawerContent` currently renders:

```
┌ Drawer (title "RBAC Role Info", extra: BAIFetchKeyButton refresh) ─────────────┐
│  <Typography.Title> {role.name}            [Edit ✎ if source == CUSTOM]        │
│  <Descriptions column={2} bordered>                                            │
│     Source | Status | CreatedAt | UpdatedAt | (AutoAssign) | Description       │
│  <Tabs>                                                                        │
│     ├ "Scopes"       → <RoleScopeTab>        (adminRole.scopes connection)     │
│     ├ "Permissions"  → <RolePermissionTab>   (adminPermissions connection)     │
│     └ "Assignments"  → <RoleAssignmentTab>   (adminRoleAssignments connection) │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **Scopes tab** (`RoleScopeTab.tsx`): a `BAITable` over `adminRole.scopes`
  (`scopeType`, `scopeId`, scope name resolved via `ProjectV2`/`DomainV2`/`UserV2`
  `basicInfo`). Own `BAIGraphQLPropertyFilter` + `BAIFetchKeyButton`, offset
  pagination.
- **Permissions tab** (`RolePermissionTab.tsx`): a flat `BAITable` over
  `adminPermissions` (`scopeType`, `scopeId`, `entityType`, `operation`), one row per
  granted permission. Create/edit via `CreatePermissionModal`, delete via
  `BAIDeleteConfirmModal`. Own filter + refresh + "Add Permission" button.
- **Assignments tab** (`RoleAssignmentTab.tsx`): user assignments; bulk assign/revoke.
- URL state uses **nuqs** with prefixed keys per tab (`sCurrent/sPageSize/sOrder/sFilter`
  for Scopes, `p*` for Permissions, `a*` for Assignments). `RoleDetailDrawerContent`
  holds `activeTab` in local state and **resets all prefixed params on tab change**.

The scopes-vs-permissions split is the core usability problem this spec addresses.

## Goals

1. Merge the **Scopes** and **Permissions** tabs into a single **"Detailed
   Permissions"** tab that shows, per assigned scope type, the concrete scopes and the
   permission state of each selectable entity type in one view.
2. Render **only the scope-type tables that the role actually has assigned** (e.g. a
   role with a project scope and a user scope shows a Project table and a User table,
   with no Domain table).
3. Make per-(scope, entity) permission state legible at a glance via color-coded tags
   (fully / partially / not allowed).
4. Provide a **scope-level permission edit modal** opened from a row. The scope's
   entire configurable entity × action combination set renders as a checkbox grid;
   saving creates/removes the underlying permission rows. Combination data comes from
   `rbacPermissionMatrix`.
5. Keep the drawer header, the role name, and the existing `Descriptions` metadata
   block exactly as they are today (changes are confined to the tab content). Keep the
   **Assignments** tab as-is.
6. Preserve or simplify the nuqs URL-state; add i18n for all new labels.

## Non-goals

- No backend or `data/schema.graphql` change. If a genuine gap surfaces during
  implementation it is a **risk to escalate**, not part of this scope (see
  [Risks](#risks--schema-verification-findings)).
- No change to `AssignRoleModal`, `RoleNodes`, or the `RBACManagementPage` role-list
  surface. (`RoleAssignmentTab` and `RoleFormModal` were originally listed here too,
  but both were touched by the 2026-07-08 refactors — see
  [Implementation Updates](#implementation-updates-2026-07-08).)
- No change to how the drawer is opened/closed or to the role-detail top-level query
  wiring beyond what the new tab content requires.

## Scope of Change

**In scope — the tab content region of `RoleDetailDrawerContent` only:**

- Merge `RoleScopeTab` + `RolePermissionTab` into a new **"Detailed Permissions"** tab
  (new component: `RolePermissionDetailTab.tsx` — renamed from the initially planned
  `RolePermissionAssignmentTab.tsx` on 2026-07-08), keeping the tab independently
  refetchable.
- **Remove** the existing `CreatePermissionModal` and replace it with the scope-level
  permission edit modal (FR-6).

**Untouched:**

- Drawer header (title `rbac.RoleDetailInfo` + `BAIFetchKeyButton` refresh in `extra`).
- Role name `Typography.Title` and the CUSTOM-role Edit button.
- The metadata `Descriptions` block above the tabs (source / status / createdAt /
  updatedAt / autoAssign / description) — **kept exactly as today** (decided
  2026-07-07).
- The third tab (**Assignments** / `RoleAssignmentTab`).

## Target UX

```
┌ Drawer (unchanged header) ─────────────────────────────────────────────────────┐
│  {role.name}                                   [Edit ✎ if source == CUSTOM]     │
│  <Descriptions> Source | Status | CreatedAt | UpdatedAt | (AutoAssign) | Desc.  │
│  (metadata/description block — kept as-is)                                       │
│                                                                                  │
│  <Tabs>                                                                          │
│    ├ "Detailed Permissions" (NEW, merged)                                        │
│    │    For EACH scope type the role has assigned, one BAICard section:          │
│    │    ┌ BAICard  title="Project"                   extra:[filter][refresh] ─┐  │
│    │    │ [] | name [✎]      | scope id        | <entity-type tags…>          │  │
│    │    │ [] | default       | 3f1c…-uuid      | [Session●][Folder●][Model○]  │  │
│    │    └──────────────────────────────────────────────────────────────────┘  │
│    │    ┌ BAICard  title="User"                      extra:[filter][refresh] ─┐  │
│    │    │ [] | test@lablup   | a92e…-uuid      | [Keypair●][Folder◐] …        │  │
│    │    └──────────────────────────────────────────────────────────────────┘  │
│    │    (no Domain card — this role has no domain scope assigned)              │  │
│    │                                                                            │  │
│    └ "Assignments" (UNCHANGED)                                                  │  │
└──────────────────────────────────────────────────────────────────────────────┘

  ● green  = fully allowed   ◐ gold = partially allowed   ○ gray = not allowed
  (tags are display-only)

  Edit action on the name action cell (✎) → single-scope edit /
  row selection ([]) → multi-scope bulk edit
  (the modal header shows which scope is being edited; the body is an
   entity × action checkbox grid; bulk edit defaults to 'Keep as is' —
   only modified cells are applied to every selected scope)
```

Layout reference for the per-section BAICard stack: `ProjectFolderPermissionPanel.tsx`
(one `BAICard` per section, stacked in a `BAIFlex direction="column"`, card-scoped
actions in `extra`, content-scoped filter in the body — per
`.claude/rules/use-bai-card.md`).

## Functional Requirements

### FR-1 — Merge Scopes + Permissions into a "Detailed Permissions" tab

**User story:** _As an admin viewing a role, I want scopes and their permissions in one
tab so that I can see what the role covers and what it can do without switching tabs._

- [ ] The drawer's tab list becomes **two** tabs: **Detailed Permissions** (new,
      default active) and **Assignments** (unchanged). The standalone Scopes and
      Permissions tabs are removed.
- [ ] The merged tab is wrapped in `<Suspense fallback={<Skeleton active/>}>` like the
      existing tabs, and is independently refetchable (its content refetches without
      forcing the whole drawer query to refetch, matching the current per-tab refresh
      behavior).
- [ ] Tab label finalized (2026-07-07): Korean **'세부 권한'**, English **"Detailed
      Permissions"** (i18n key example: `rbac.DetailedPermissions`).

**Acceptance criteria**

- [ ] Opening a role detail drawer shows exactly two tabs; "Detailed Permissions" is
      active by default.
- [ ] The Assignments tab renders identically to today (same table, filters, bulk
      assign/revoke).

### FR-2 — Render only assigned scope types, one table per type

**User story:** _As an admin, I want to see a table only for the scope types this role
is actually scoped to, so that irrelevant scope types don't clutter the view._

- [ ] The tab determines the **distinct scope types actually assigned to the role**
      (from `adminRole.scopes`) and renders **one `BAICard` section per distinct
      assigned scope type**, stacked vertically.
- [ ] A scope type with zero assigned scopes for this role renders **no** section
      (e.g. a role with only `PROJECT` and `USER` scopes shows Project and User cards,
      no Domain card).
- [ ] If the role has **no scopes at all**, the tab shows an empty state
      (`rbac.NoScopesToDisplay` or equivalent), not an empty set of cards.
- [ ] Each section title is the human-readable scope-type label (`rbac.types.{TYPE}`).

**Acceptance criteria**

- [ ] Given a role with a `PROJECT` scope and a `USER` scope, the tab shows a Project
      card and a User card, and no card for any other scope type.
- [ ] Adding the role's first scope of a new type (via the existing scope flow, if
      reachable) and refetching causes a new card for that type to appear.

> **Design note (data flow):** "which scope types are assigned" must be derived from
> the role's scopes. Deriving the _distinct set_ from a paginated `adminRole.scopes`
> query is only exact if all scopes are fetched; `CreatePermissionModal` already
> fetches `scopes(first: 100)` to enumerate role scopes, which is a reasonable
> precedent. The completeness of the distinct-type derivation vs. pagination is a
> [risk](#risks--schema-verification-findings) to confirm during implementation.

### FR-3 — Per-table filter, refresh, and independent query

**User story:** _As an admin, I want each scope-type table to be independently
filterable and refreshable, so that I can drill into one scope type without disturbing
the others._

- [ ] Each per-scope-type `BAICard` section has:
  - its own **client-side search input** over the resolved scope name and raw scope
    id (a plain `Input` with a search-icon prefix; the content-scoped search lives in
    the body per `.claude/rules/use-bai-card.md`; the card-scoped refresh lives in
    `extra`). Server-side filtering of the scopes connection is **not possible** (see
    the [Data / GraphQL correction](#queries-used)), so the search runs client-side
    over the fetched rows, and
  - its own `BAIFetchKeyButton` refresh.
- [ ] Each section **issues its own separate GraphQL query** and fetches the role's
      scopes bounded (`limit: 100`, offset 0), then **partitions the rows client-side**
      by `scopeType` to keep only that section's type, so a refresh on one section does
      not refetch the others. (The connection cannot be filtered by scope type
      server-side — see the correction above.)
- [ ] Pagination is **client-side** over the partitioned + searched subset. The GraphQL
      query uses only a single `limit` arg (offset 0), a valid offset-mode bound per
      `.claude/rules/graphql-pagination.md` (no mixed cursor/offset args); the
      page-number pagination itself is done locally by the table.
- [ ] Each table has its own pagination, but pagination/search state is **not stored
      in the URL** — it is kept in local React state (decided 2026-07-07).

**Acceptance criteria**

- [ ] Searching or refreshing the Project card does not reload the User card.
- [ ] Each section reliably shows its scope-type rows on a real backend (the old
      server-side `entityType` filter returned zero rows — this is the bug this
      correction fixes). Scope-type partitioning, search, and page-number pagination
      are all client-side.

### FR-4 — Row columns and grant-state color-coded entity-type tags

**User story:** _As an admin, I want each row to show a scope instance and the grant
state of each entity type on it, so that I can read coverage at a glance._

- [ ] Each row represents one **scope instance** of that scope type. Columns:
  1. **Scope node name** (resolved name — project name / user email / domain name /
     etc., matching the existing `resolveScopeName` logic in `RolePermissionTab.tsx`).
     Rendered with `BAINameActionCell` carrying an **edit action** (the trigger for the
     FR-6 permission edit modal),
  2. **Scope node id** (`scopeId`, rendered via `BAIId`),
  3. The **selectable entity types** for that scope type, each rendered as a
     **display-only `Tag`** (clicking a tag does not trigger editing — edit entry is
     FR-6), color-coded by the permission state the role grants on that scope for that
     entity type.
- [ ] The set of selectable entity types for a scope type comes from
      `rbacPermissionMatrix` (the `entities[]` list whose `actions.length > 0` for that
      `scopeType`, matching how `CreatePermissionModal` derives valid entity types).
- [ ] Tag color encodes grant state, computed by comparing the role's **granted**
      operations for `(scopeId, entityType)` against the **full** operation set the
      matrix defines for `(scopeType, entityType)`:

  | State             | Meaning                                                              | Suggested color |
  | ----------------- | -------------------------------------------------------------------- | --------------- |
  | Fully allowed     | role grants every operation the matrix lists for that (scope, entity) | success / green |
  | Partially allowed | role grants some but not all                                          | warning / gold  |
  | Not allowed       | role grants none                                                      | default / gray  |

  (Decided 2026-07-07) "Fully" means **every operation the matrix lists for that
  (scope, entity) — including `GRANT_*` delegate operations**. The tag is green only
  when all selectable permissions are granted.

- [ ] Entity types with zero granted permissions are still **shown as gray tags** —
      never hidden (decided 2026-07-07).
- [ ] Whether the entity-type tags render as a single composite column of tags or one
      column per entity type is a presentation detail left to implementation; the
      wireframe shows tags grouped per row.

**Acceptance criteria**

- [ ] For a scope where the role grants all operations on an entity type, that entity's
      tag is green; where it grants some, gold; where it grants none, gray.
- [ ] Entity types not present in the matrix for that scope type do not render a tag.
- [ ] Grant-state colors update after a save via the edit modal (FR-6) + refetch.

### FR-5 — (Excluded) "?" explanation modal per scope type

> **Excluded from scope by the 2026-07-07 decision.** The "?" button and a separate
> explanation modal will not be implemented. The configurable combinations and their
> descriptions from `rbacPermissionMatrix` (`operation` / `description`) surface inside
> the FR-6 permission edit modal instead.

### FR-6 — Scope-level permission edit modal (entity × action checkbox grid)

**User story:** _As an admin, I want to open an edit view from a scope row and toggle
actions for all of that scope's entities at once, so that I can assign permissions
without opening a modal per entity._

- [ ] The edit unit is the **whole scope instance**: a single modal edits **all
      entity × action combinations** the matrix defines for that `scopeType` at once
      (one checkbox cell per entity × action pair).
- [ ] **The trigger is NOT an entity-tag click** (tags are display-only — FR-4). The
      edit modal opens via:
  - the **edit action** on the row's name column (`BAINameActionCell`) — single-scope
    edit, and
  - **row selection (rowSelection)**-based entry — multi-scope bulk edit. **When
    exactly one row is selected** (`scopes.length === 1`), selection-based entry opens
    the **single-scope pre-checked mode** — identical to the row edit action: the
    scope's definite current grant state is shown and pre-checked, which is better UX
    than 'Keep as is' for a single scope. The **'Keep as is' bulk mode applies only
    when 2+ scopes are selected** (`isBulk = scopes.length > 1`), matching the
    implementation.
- [ ] The modal **header** shows **which scope is being edited** — scope type +
      resolved name (e.g. when editing folder permissions of the 'default' project,
      the modal shows the 'default' project's information).
- [ ] The modal **body** renders the scope's configurable **entity × action grid** as
      checkboxes (ProjectFolderPermissionPanel-style check UX), using the matrix's
      `operation` / `description` for labels/descriptions. In **single-scope edit**,
      the operations the role currently grants on that `scopeId` are pre-checked.
- [ ] **Multi-scope bulk edit follows the `BAIBulkEditFormItem` pattern**
      (`packages/backend.ai-ui/src/components/BAIBulkEditFormItem.tsx`): every cell
      initially displays as **'Keep as is'** (the possibly-different current values per
      scope are not merged for display). Only cells the user explicitly modifies become
      part of the submission; on save, each modified cell's final value (checked /
      unchecked) is **applied to every selected scope**. Untouched cells are excluded
      from the submission (value `undefined`) and keep each scope's existing value.
- [ ] **Saving** reconciles, for modified cells only and per target scope, the checkbox
      state against the role's existing permissions:
  - a cell modified to checked → `adminCreatePermission`
    (`{ roleId, scopeType, scopeId, entityType, operation }`) if that scope lacks the
    permission,
  - a cell modified to unchecked → `adminDeletePermission` (`{ id }`) for the matching
    existing permission row on that scope.
- [ ] **Because there is no bulk permission mutation and each permission (checkbox) has
      only a single mutation**, the modal performs **dirty tracking against the initial
      state** and issues mutations **only for changed cells** (one per changed cell;
      applies to both single- and multi-scope edits). No request is sent for unchanged
      cells. Since this is a whole-scope edit, N can grow large, which raises the
      weight of the [risk](#risks--schema-verification-findings) (non-atomic; partial
      failure handling required). Use `BAIButton`'s `action` for the loading state,
      surface per-operation failures via `message`/notification, and refetch on
      completion.
- [ ] On success the modal closes, the section refetches, and the row's tag colors
      recompute (FR-4).
- [ ] Saving permissions is **reversible** (editable again), so this is **not** a
      typed-confirmation destructive action — a normal modal is correct per
      `.claude/rules/destructive-confirmation.md`. Removing a permission by unchecking
      does not require `BAIConfirmModalWithInput`.
- [ ] The existing `CreatePermissionModal` (the flat Permissions tab's create/edit
      modal) is **removed** and replaced by this modal (decided 2026-07-07). Its
      `rbacPermissionMatrix` usage and Direct/Delegate operation grouping logic are
      ported into the new modal.

**Acceptance criteria**

- [ ] Opening the edit modal from the 'default' project row shows 'default' project in
      the header, renders the project scope's full entity × action grid in the body,
      and pre-checks exactly the operations the role already grants.
- [ ] Checking an unchecked cell and saving creates a new permission row (verified by
      reopening the modal or by the entity tag turning greener); unchecking and saving
      removes it.
- [ ] Only the entity × operation combinations the matrix lists for that `scopeType`
      are offered as cells (no invalid operation can be granted).
- [ ] Selecting project1 (`SESSION: CREATE/READ` granted) and project2 (`SESSION: READ`
      granted) together and opening the edit modal shows every cell as 'Keep as is'.
      Modifying only the `SESSION × CREATE` cell to checked and saving adds CREATE to
      project2 (project1 already has it, so no change), while all other permissions
      keep their existing values on both projects.

### FR-7 — Metadata / description region (finalized: keep as-is)

- [ ] The region above the tabs is **kept exactly as today**: the role name
      `Typography.Title` + the existing `Descriptions` block (source / status /
      createdAt / updatedAt / autoAssign / description). The 'prominent description
      box' explored in the wireframe is **not** implemented — this spec's changes are
      **confined to the tab content** (decided 2026-07-07).
- [ ] `autoAssign` continues to render only when
      `baiClient.supports('role-auto-assign')` (manager ≥ 26.4.4), as today.

## Data / GraphQL Notes

**No schema change expected.** All fields/mutations below are verified present in
`data/schema.graphql`.

### Queries used

| Purpose                                          | Field                                                                                         | Notes                                                                                                                                                                                    |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Role scopes (rows + distinct scope types)        | `adminRole(id).scopes(limit, …)` → `EntityConnection` of `EntityRef`                          | **Cannot be filtered by scope type server-side** — see the correction note below. Fetched bounded (`limit: 100`, offset 0) per section and **partitioned client-side** by `scopeType`. `scope` resolves to `ProjectV2`/`DomainV2`/`UserV2`/… `basicInfo` for the display name.                   |
| Role's granted permissions                       | `adminPermissions(filter: PermissionFilter, orderBy, limit, offset)` → `PermissionConnection` | `PermissionFilter` supports `roleId`, `scopeType`, `scopeId`, `entityType` — enough to fetch the role's grants per scope type (and per scope instance/entity) to compute tag state.        |
| Manageable matrix (tag state + permission modal) | `rbacPermissionMatrix: [ScopeEntityOperationCombination!]`                                    | **Verified at `data/schema.graphql:14695`.** Already consumed by `CreatePermissionModal`.                                                                                                 |

> **Correction (2026-07-07, verified live on manager 26.7.0).** The "Role scopes"
> row above originally assumed `adminRole.scopes` could be filtered by scope type via
> `EntityFilter.entityType`. That assumption is **wrong**. `adminRole.scopes` returns
> `EntityRef` rows from the `association_scopes_entities` table
> (`data/schema.graphql:7051`), and in that connection **the role itself is the
> entity**: every row has `entityType = ROLE` and `entityId = <roleId>`; the scope's
> type lives in the separate `scopeType` field. `EntityFilter`
> (`data/schema.graphql:6991`) exposes only `entityType` / `entityId` — there is **no
> `scopeType` / `scopeId` filter field**. So `filter: { entityType: { equals:
> <PROJECT|USER|DOMAIN> } }` matches **zero** rows (verified live: unfiltered count 5,
> filtered count 0 for every scope type), and the `entityId contains` search is equally
> meaningless (`entityId` is always the role id). The old `RoleScopeTab`'s "Scope Type"
> filter was therefore **already non-functional**. **Server-side scope-type filtering /
> pagination of a role's scopes is impossible with the current schema.**
>
> The implemented approach is **WebUI-only**: each per-scope-type section fetches the
> role's scopes bounded by `limit: 100` (offset 0 — a single `limit` arg, a valid
> offset-mode bound per `.claude/rules/graphql-pagination.md`) and **partitions the
> rows client-side by `scopeType`**, then searches (over the resolved scope name + raw
> scope id) and paginates the filtered subset **client-side**. Per-section queries stay
> independent so per-section refresh remains isolated (FR-3). The `adminPermissions`
> query is **unaffected** — `PermissionFilter` **does** expose `scopeType`, so its
> `roleId + scopeType` server filter is valid and kept unchanged. The backend gap is
> escalated separately (see [Risks](#risks--schema-verification-findings)).

**Exact `rbacPermissionMatrix` shape (verified):**

```graphql
rbacPermissionMatrix {                     # [ScopeEntityOperationCombination!]
  scopeType                                # RBACElementType!
  entities {                               # [EntityActionInfo!]!
    entityType                             # RBACElementType!
    actions {                              # [OperationInfo!]!
      operation                            # String!  (name)
      description                          # String!  (human-readable)
      requiredPermission                   # OperationType!
    }
  }
}
```

- `ScopeEntityOperationCombination` — `data/schema.graphql:17826`
- `EntityActionInfo` — `entityType` + `actions`
- `OperationInfo` — `operation`, `description`, `requiredPermission`

> The shape assumed in the issue (`{ scopeType, entities:[{ entityType, actions:[{ requiredPermission }] }] }`)
> is **confirmed**, with the bonus that each action **also** carries `operation`
> (name) and `description` (human-readable) — directly usable for the permission edit
> modal's action labels/descriptions, so no additional lookup is needed.

`OperationType` enum (the checkbox universe): `CREATE`, `READ`, `UPDATE`,
`SOFT_DELETE`, `HARD_DELETE`, `GRANT_ALL`, `GRANT_READ`, `GRANT_UPDATE`,
`GRANT_SOFT_DELETE`, `GRANT_HARD_DELETE`. `CreatePermissionModal` already groups these
into **Direct** vs **Delegate (`GRANT_*`)** — reuse that grouping in the checkbox
editor.

### Mutations used

| Purpose               | Mutation                | Input                                                                          |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------ |
| Grant an action       | `adminCreatePermission` | `CreatePermissionInput { roleId, scopeType, scopeId, entityType, operation }`  |
| Revoke an action      | `adminDeletePermission` | `DeletePermissionInput { id }`                                                 |
| (Edit, if reused)     | `adminUpdatePermission` | `UpdatePermissionInput { id, scopeType, scopeId, entityType, operation }`      |

**No bulk permission mutation exists** → the checkbox editor's save is N single
mutations (see FR-6 and [Risks](#risks--schema-verification-findings)).

### `baiClient.supports(...)` guards to preserve

- `rbac-filter-wrapper` — controls whether filter values are wrapped
  (`{ equals: x }`) vs. scalar. Kept for the **`adminPermissions` (`roleId` +
  `scopeType`)** server filter — the only remaining server-side filter after the
  correction above (the `adminRole.scopes` connection is no longer server-filtered; its
  rows are partitioned client-side).
- `role-auto-assign` — gates the `autoAssign` metadata field (FR-7).

## i18n Requirements

- All new visible strings get keys under the existing **`rbac.*`** namespace in
  `resources/i18n/en.json` (and `ko.json`), following the existing PascalCase leaf-key
  convention (e.g. `rbac.DetailedPermissions`, `rbac.EditScopePermissions`,
  `rbac.FullyAllowed`, `rbac.PartiallyAllowed`, `rbac.NotAllowed`,
  `rbac.NoScopesToDisplay`, `rbac.SearchScopes` — the client-side scope search
  placeholder). Final keys TBD.
- Reuse existing keys where possible: `rbac.types.*` (scope/entity labels),
  `rbac.operations.*`, `rbac.operationGroups.*`, `rbac.ScopeType`, `rbac.EntityType`,
  `rbac.ScopeId`, `rbac.ScopeRawId`, `rbac.RoleDescription`.
- Merged-tab label finalized: Korean **'세부 권한'**, English **"Detailed Permissions"**.
- **Implemented note (2026-07-07):** the plan below (English fallback for non-en/ko
  until a follow-up) was **exceeded** — all **21 locale files were fully translated
  in-stack** for the new `rbac.*` keys (including `rbac.SearchScopes` for the client-side
  scope search, and the FR-6 / bulk-edit keys), not just en/ko. Korean is authored in the
  formal polite style consistent with the rest of `ko.json`.
- Jira issue titles/descriptions remain in English regardless of the doc language.

## URL-state Requirements

- (Decided 2026-07-07) **Storing the active tab in the URL is allowed** — `activeTab`
  is currently local state, but promoting it to a nuqs parameter is permitted (allowed,
  not required). Implemented as local state.
- (Decided 2026-07-07) **Per-table state (pagination/filter) of the "Detailed
  Permissions" tab is NOT stored in the URL** — it is kept in local React state. The
  existing Scopes/Permissions `s*` / `p*` nuqs keys and their tab-change reset logic
  are removed.
- (Updated 2026-07-08) **The Assignments tab's `a*` nuqs keys were also removed** —
  its pagination / order / filter now live in local React state, so **nothing inside
  the drawer writes to the URL anymore**. Re-introducing per-tab query-string state is
  deferred to a separate issue.
- The existing `roleDetail` push-state param on `RBACManagementPage` is preserved
  (out of scope, unchanged) — it remains the only drawer-related URL state.

## Out of Scope

- **`AssignRoleModal`** — unchanged. (`RoleAssignmentTab` itself was refactored on
  2026-07-08 — data source, URL state, prop naming — see
  [Implementation Updates](#implementation-updates-2026-07-08).)
- **`RoleFormModal`** (role create/edit) — behavior unchanged; only its
  `RBACElementType` import source and fragment prop name were touched (2026-07-08).
- **`RBACManagementPage` role-list surface** (`RoleNodes`, status filter, create /
  deactivate / activate / purge flows) — unchanged.
- **Drawer open/close wiring** and the top-level `RoleDetailDrawerQuery` structure,
  except as required to feed the new tab.
- **Backend / `data/schema.graphql` changes** — none; a real gap is a risk to
  escalate, not in-scope work.
- **A bulk permission mutation** — not introduced here (would be a backend change).
- **Localizing the 20 non-en/non-ko locales** — originally deferred to a follow-up, but
  **completed in-stack**: all 21 locales were fully translated for the new `rbac.*` keys
  (see the i18n "Implemented note" above), so no follow-up localization pass is needed.

## Decisions (Resolved Open Questions, 2026-07-07)

All open questions are resolved. Each decision is reflected in the referenced
requirement section.

1. **Merged-tab label** → Korean **'세부 권한'**, English **"Detailed Permissions"**
   (FR-1).
2. **Metadata/description region** → **kept exactly as today** — the existing
   `Descriptions` block (description included) is unchanged. This spec's changes are
   confined to the tab content (FR-7).
3. **Entity types with zero granted permissions** → **shown as gray tags**, never
   hidden (FR-4).
4. **Definition of "fully allowed"** → fully allowed when **every operation the matrix
   lists — including `GRANT_*` delegate operations — is granted** (FR-4).
5. **URL-state for the merged tab** → **storing the active tab in the URL is allowed**;
   per-table pagination/filter state is **not stored in the URL and stays in local
   state** (same intent as decision 7; see URL-state Requirements).
6. **Fate of `CreatePermissionModal`** → **removed** — replaced by the scope-level
   permission edit modal (FR-6).
7. **Per-table pagination** → each table has its own pagination (query
   `limit`/`offset`), but it is not stored in the URL (FR-3).
8. **Semantics of multi-scope editing** → follows the `BAIBulkEditFormItem` pattern:
   default 'Keep as is'; only user-modified cells are bulk-applied to every selected
   scope (FR-6).

## Risks / Schema-verification Findings

- **`rbacPermissionMatrix` exists and matches the assumed shape** (verified at
  `data/schema.graphql:14695`; `ScopeEntityOperationCombination` at `:17826`). Bonus:
  each action exposes `operation` and `description` in addition to
  `requiredPermission`. **No schema gap.**
- **No bulk permission mutation.** The checkbox editor (FR-6) must issue **N separate**
  `adminCreatePermission` / `adminDeletePermission` calls. This is **non-atomic**: a
  mid-batch failure leaves partial state. Implementation must handle partial failure
  (report which operations failed, refetch to reflect the true state). Escalate if
  atomicity is required — that would need a new backend mutation (out of scope).
- **`EntityFilter` lacks a scope-type / scope-id filter → server-side scope filtering &
  pagination impossible (ESCALATED).** Confirmed live on manager 26.7.0: `adminRole.scopes`
  returns `EntityRef` association rows where `entityType = ROLE` / `entityId = <roleId>`
  (the role is the entity; the scope's type is in the separate `scopeType` field), and
  `EntityFilter` (`data/schema.graphql:6991`) offers only `entityType` / `entityId`.
  There is **no way to filter or paginate a role's scopes by `scopeType` / `scopeId`
  server-side** — a `filter: { entityType: <scopeType> }` returns zero rows. The WebUI
  works around this by fetching the role's scopes bounded (`limit: 100`) and
  partitioning / searching / paginating **client-side** (see the
  [Data / GraphQL correction](#queries-used)). This is a **backend gap to escalate**: a
  follow-up backend issue should add a `scopeType` (and ideally `scopeId`) filter to the
  `adminRole.scopes` connection (e.g. via an extended `EntityFilter` or a dedicated
  scope filter) so the tab can filter and page server-side. Until then, roles with more
  than 100 scopes of a single type will not show the overflow in that section.
- **Distinct-scope-type derivation vs. pagination.** Deciding which per-type tables to
  render requires knowing the role's distinct scope types; deriving them from a
  paginated `adminRole.scopes` is only exact if all scopes are fetched. The tab-level
  fragment fetches `scopes(first: 100)` (precedent: `CreatePermissionModal`); the same
  100-scope bound now also applies to the **per-section row set** (each section fetches
  `scopes(limit: 100)` and partitions client-side), so both the distinct-type derivation
  and the visible rows share that upper bound.
- **Tag-state computation cost.** Computing fully/partial/none per row × per entity
  type requires the role's granted permissions for the scope type. Fetching
  `adminPermissions` filtered by `roleId` + `scopeType` (and reconciling client-side by
  `scopeId`/`entityType`) is the likely approach; verify pagination doesn't truncate
  the permission set used for the computation.

## Implementation Updates (2026-07-08)

Post-review refactors applied on top of the initial implementation (all in PR 1 /
FR-3271 unless noted):

1. **Component rename** — the merged tab component is
   `RolePermissionDetailTab.tsx` (was `RolePermissionAssignmentTab.tsx`), including
   its Relay fragment/query names (`RolePermissionDetailTab_roleScopeFragment`,
   `RolePermissionDetailTabMatrixQuery`, `RolePermissionDetailTabSectionQuery`).
2. **Legacy tabs/modal removed in PR 1** — the standalone Permissions tab,
   `RolePermissionTab.tsx`, `RoleScopeTab.tsx`, and `CreatePermissionModal.tsx` are
   deleted in FR-3271 (originally planned for PR 2). Permission **editing** returns
   with the FR-6 modal in PR 2 (FR-3272) of the same stack.
3. **`RoleAssignmentTab` data-source refactor** — `RoleAssignmentTabFragment` moved
   from `on Query` (`adminRoleAssignments(filter: { roleId })`) to **`on Role` using
   the `Role.users` connection** (Added in 26.3.0; same `RoleAssignmentConnection`).
   The roleId filter is now implicit via the parent role, so the
   `rbac-filter-wrapper` branch for it is gone (the guard remains for
   `adminPermissions` — see the guards section). Refetch (filter/sort/pagination)
   goes through the node-based `RoleAssignmentTabRefetchQuery` (`node(id:)`), which
   should be smoke-tested against a live backend. The former separate
   `RoleAssignmentTab_roleScopeFragment` (`scopes(first: 1)` → `projectScopeId`) is
   merged into the main fragment.
4. **No URL state inside the drawer** — the Assignments tab's `a*` nuqs keys and
   `RoleDetailDrawerContent`'s reset logic are removed; pagination / order / filter
   live in local React state in both tabs. Only the page-level `roleDetail` param
   remains. Per-tab query-string state is deferred to a separate issue.
5. **Query simplification** — `RoleDetailDrawerQuery` takes only `$id`;
   `assignmentQueryRef` / `permissionQueryRef` props are gone. Each tab derives
   `roleId` via `toLocalId(<own fragment>.id)` instead of receiving it as a prop.
6. **Fragment prop naming** — every prop carrying a Role-node-derived fragment is
   uniformly **`roleNodeFrgmt`** (`RoleDetailDrawerContent`, `RoleAssignmentTab`,
   `RolePermissionDetailTab`, `RoleFormModal` — was `roleDetailFrgmt` /
   `roleFrgmt` / `roleScopeFrgmt` / `editingRoleFrgmt`).
7. **i18n copy fix** — `rbac.NoScopesToDisplay` reworded from "no scopes to display"
   to convey "no scopes are configured for this role" (ko: "역할이 적용될 범위가
   설정되지 않았습니다"; en: "No scopes are configured for this role"), re-translated
   across all 21 locales.
8. **Restack onto main (FR-3234)** — `RoleAssignmentTab`'s filter typing follows
   main's schema-typed filters: `RoleAssignmentFilter` (from the refetch query's
   generated types) replaces the generic `GraphQLFilter`, and
   `BAIGraphQLPropertyFilter<RoleAssignmentFilter>` is used.
9. **`Role.scopes` scope-type filter re-verified (2026-07-08)** — re-confirmed live
   that `EntityFilter.entityType` cannot partition a role's scopes by scope type
   (`entityType` is always `ROLE`; `equals: DOMAIN/PROJECT/USER` each return 0 rows,
   `equals: ROLE` returns all). A per-scope-type `@refetchable` fragment design
   stays blocked on the escalated backend `scopeType` filter gap.

## Related Issues

- **FR-3264** (Task, In Progress, assignee SungChul Hong; GitHub clone #8165) — this
  spec's source issue: "Redesign role detail drawer to show assigned scopes and
  permissions at a glance."

## Source Code Map

| File                                                          | Role in this change                                                                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `react/src/pages/RBACManagementPage.tsx`                      | Mounts `RoleDetailDrawer`. **Unchanged.**                                                                                    |
| `react/src/components/RoleDetailDrawer.tsx`                   | Drawer shell + `RoleDetailDrawerQuery`. Header **unchanged**; the top-level query was **simplified to `$id` only** — all tab data flows through `RoleDetailDrawerContentFragment` on `adminRole` (no Query-level fragment spreads or per-tab variables). |
| `react/src/components/RoleDetailDrawerContent.tsx`            | **Modify** — merge Scopes+Permissions into the "Detailed Permissions" tab; keep the `Descriptions` block; **all** nuqs keys (`s*`/`p*`/`a*`) and the reset logic removed. Passes a single `roleNodeFrgmt` per tab. |
| `react/src/components/RoleScopeTab.tsx`                       | **Removed (absorbed)** — its scopes query + name resolution logic feeds the per-type tables.                                 |
| `react/src/components/RolePermissionTab.tsx`                  | **Removed (absorbed)** — `resolveScopeName`, the `adminPermissions` query, and create/delete mutations feed the new flow.    |
| `react/src/components/CreatePermissionModal.tsx`              | **Removed** — replaced by the scope-level permission edit modal. Its `rbacPermissionMatrix` usage and Direct/Delegate grouping logic are ported over. |
| `react/src/components/RoleAssignmentTab.tsx`                  | **Refactored (2026-07-08)** — fragment moved `on Query`(`adminRoleAssignments`) → `on Role`(`users` connection, node-based refetch); `roleId`/`projectScopeId` derived from its own fragment; `a*` nuqs keys → local state; typed `RoleAssignmentFilter`. |
| `react/src/components/RoleFormModal.tsx`                      | `RBACElementType` import re-pointed to its own generated types (was `CreatePermissionModal`'s); fragment prop renamed `roleNodeFrgmt`. Behavior unchanged. |
| `react/src/components/ProjectFolderPermissionPanel.tsx`       | Layout reference — stacked `BAICard` sections + checkbox permission UX.                                                      |
| `packages/backend.ai-ui/src/components/BAIBulkEditFormItem.tsx` | Pattern reference for multi-scope bulk edit ('Keep as is' + modified-only submission).                                       |
| `data/schema.graphql`                                         | Verified source of truth — no changes.                                                                                       |
| `react/src/components/RolePermissionDetailTab.tsx` (NEW)      | The merged tab: per-scope-type `BAICard` sections, each with its own query/filter/refresh, tag cells, and the scope-level permission edit modal. |
