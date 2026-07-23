# Dev Plan: FR-2209 Project Admin Management

## Spec Reference

`.specs/FR-2209-project-admin-management/spec.md` (merged 2026-03-26, 4th review)

## Epic

**FR-2209** — WebUI 프로젝트 관리자 기능 (Project Admin Management)

Related upstream spec PR (open): #6026 — FR-2314 "RBAC admin menu behavior" (FR-1692 epic). This dev plan absorbs FR-2314's UI requirements (3-tier menu, header selector, badge, switch confirm) into FR-2209 implementation.

---

## Backend Reality Check (verified against `lablup/backend.ai` HEAD)

| Capability | Status | Notes |
|---|---|---|
| `myRoles` query (with permissions) | ✅ available since 26.3.0 | Local `data/schema.graphql` may need re-pull |
| `projectRoles(projectId)` | ✅ 26.4.0 | Lists roles in a project scope |
| `PROJECT_ADMIN_PAGE` element type | ✅ in `RBACElementType` enum | **Primary signal for "is project admin"** — preferred over role-name parsing |
| `compute_session_nodes(scope_id: "project:<uuid>")` RBAC filtering | ✅ | |
| `vfolder_nodes(scope_id: "project:<uuid>")` RBAC filtering | ✅ | |
| `endpoint_list` / Serving RBAC | ❌ **gap** — still legacy `project: UUID` arg, no `endpoint_nodes` Relay node | PR-2b blocked or interim implementation |
| `unassignUsersFromProjectV2` callable by project admin | ✅ 26.4.0 | Out of initial scope (no member mutations in v1) |
| Project-member listing by UUID | ⚠️ `adminUsersV2` filters by project **name** only | Use `projectRoles → role.users` connection or name filter |

**`scope_id` format**: `project:<uuid>` (verified in `models/rbac/__init__.py`).

---

## WebUI Current State

- `useCurrentUserRole()` exists (`react/src/hooks/backendai.tsx`) — returns string role
- Admin pages exist as **superadmin global views**, no project scoping yet:
  - `AdminComputeSessionListPage.tsx`, `AdminServingPage.tsx`, `AdminVFolderNodeListPage.tsx`
- `useCurrentUserProjectRoles` / `useEffectiveAdminRole` — **do not exist**
- `ProjectSelect.tsx` — no admin badge
- `WebUISider.tsx` `hasAdminCategoryRole` — simple role-string check
- `WebUIHeader.tsx` — project selector always visible

---

## Phased PR Stack (Graphite)

```
main
 └── PR-0  Schema sync + useCurrentUserProjectRoles            (FR-2209-A)
      ├── PR-1a  3-tier menu visibility + ProjectSelect badge   (FR-2209-B)
      │    └── PR-1b  Header selector + transition confirm     (FR-2209-C)
      ├── PR-2a  Admin Sessions project scope                  (FR-2209-D)
      ├── PR-2b  Admin Serving (project scope)                 (FR-2209-E) ⚠ backend gap
      ├── PR-2c  Admin VFolder + project folder creation       (FR-2209-F)
      ├── PR-2d  Project Members read-only page                (FR-2209-G)
      └── PR-3   E2E + i18n + final verification               (FR-2209-H)
```

PR-1a/b and PR-2a/c/d can be developed in parallel after PR-0 lands. PR-2b is gated on backend.

---

## Sub-tasks

### PR-0 — Schema sync + role detection hook (BLOCKING)

- **Title**: `feat(FR-2209): add useCurrentUserProjectRoles hook with myRoles RBAC query`
- **Scope**:
  - Pull latest schema (`data/schema.graphql`) so `myRoles`/`projectRoles` are present; regenerate Relay artifacts.
  - Create `react/src/hooks/useCurrentUserProjectRoles.ts`:
    - `useLazyLoadQuery` against `myRoles`
    - Returns `{ isSuperAdmin, domainAdminDomains: string[], projectAdminIds: string[], rawAssignments }`
    - Detection: collect `scopeId` where `permissions[].scopeType === 'PROJECT' && permissions[].entityType === 'PROJECT_ADMIN_PAGE'`
    - Fallback to role-name parsing (`role_project_<8-hex>_admin`) if `PROJECT_ADMIN_PAGE` permissions not present
    - Graceful fallback when `myRoles` query is unsupported (older core)
  - Create `useEffectiveAdminRole()` derived hook returning `'superadmin' | 'domainAdmin' | 'projectAdmin' | 'none'` (priority: super > domain > project)
  - Unit tests covering super, domain, project, mixed, and no-role cases
- **Files**: `react/src/hooks/useCurrentUserProjectRoles.ts` (new), `data/schema.graphql`
- **Dependencies**: none (stack base)
- **Acceptance**:
  - Hook returns correct admin role for each test fixture
  - `myRoles` query failure does not break general pages (returns `none`)
  - `pnpm run relay && bash scripts/verify.sh` passes

### PR-1a — 3-tier menu visibility + ProjectSelect badge

- **Title**: `feat(FR-2209): add project-admin tier to admin menu and project selector`
- **Scope**:
  - `useWebUIMenuItems.tsx` add a `PROJECT_ADMIN_PAGE_KEYS` subset (Session, Serving, Data, Members)
  - `WebUISider.tsx` `hasAdminCategoryRole = useEffectiveAdminRole() !== 'none'`
  - `ProjectSelect.tsx` render "Project Admin" badge for projects in `projectAdminIds` (hidden if user is also superadmin/domainAdmin)
- **Files**: `react/src/hooks/useWebUIMenuItems.tsx`, `react/src/components/MainLayout/WebUISider.tsx`, `react/src/components/ProjectSelect.tsx`
- **Dependencies**: PR-0
- **Acceptance** (FR-2314 spec):
  - Project-admin-only user sees Admin menu category when current project has admin rights
  - Domain admin / superadmin always see Admin menu
  - Badge shows on admin projects for project-admin users only

### PR-1b — Header selector + transition confirm

- **Title**: `feat(FR-2209): control header project selector by admin role and confirm switch out of admin scope`
- **Scope**:
  - `WebUIHeader.tsx`: in admin mode, show project selector only for project admins; hide for domain/super admin
  - On project change in admin mode, if target project not in `projectAdminIds`, show confirm dialog ("You don't have admin rights for this project. Switching will exit admin mode.")
  - Accept → switch project + leave admin mode; cancel → restore selector
- **Files**: `react/src/components/MainLayout/WebUIHeader.tsx`
- **Dependencies**: PR-1a
- **Acceptance** (FR-2314 spec): switch confirm flow + selector visibility per role

### PR-2a — Admin Sessions project scope

- **Title**: `feat(FR-2209): scope admin sessions by project for project admins`
- **Scope**:
  - `AdminComputeSessionListPage.tsx`: derive `scope_id` from `useEffectiveAdminRole` × `useCurrentProject`
    - projectAdmin → `project:<uuid>`
    - domainAdmin → domain-level filter (TBD per backend; may need TODO marker if no domain-scope arg)
    - superadmin → no scope (current behavior)
  - Owner column always visible; Agent column superadmin only (existing `hideAgents` rule)
  - Do **not** change `SessionActionButtons.tsx` `isOwner` checks — spec confirms App launcher / terminal / SFTP / commit / rename remain owner-only
- **Files**: `react/src/pages/AdminComputeSessionListPage.tsx`
- **Dependencies**: PR-0
- **Acceptance**: spec §스토리 1 acceptance criteria

### PR-2b — Admin Serving project scope (⚠ backend gap)

- **Title**: `feat(FR-2209): scope admin serving by project for project admins`
- **Scope**:
  - `AdminServingPage.tsx`: pass project filter
  - **Path A (preferred)**: wait for backend `endpoint_list(scope_id)` or `endpoint_nodes` Relay node, then use it
  - **Path B (interim)**: use legacy `endpoint_list(project=<uuid>)` arg with `TODO(needs-backend): FR-2313` marker for domain admin scope and full RBAC validation
  - "Start Service" button hidden in admin mode (DN-4 confirmed)
  - Modify/delete remain enabled (current `EndpointList` already has no owner gating for these)
- **Files**: `react/src/pages/AdminServingPage.tsx`
- **Dependencies**: PR-0; backend coordination
- **Acceptance**: spec §스토리 2 acceptance criteria
- **Risk**: backend gap; file backend follow-up issue

### PR-2c — Admin VFolder + project folder creation

- **Title**: `feat(FR-2209): scope admin vfolders by project and allow project folder creation in admin mode`
- **Scope**:
  - `AdminVFolderNodeListPage.tsx`: `scope_id: "project:<uuid>"` + `ownership_type === 'project'` filter
  - Add `FolderCreateModal` integration: type locked to `project`, project locked to current project (DN-5)
  - Permission management entry points (invite/remove users, change access level) preserved
- **Files**: `react/src/pages/AdminVFolderNodeListPage.tsx`, related modal usage
- **Dependencies**: PR-0
- **Acceptance**: spec §스토리 3 acceptance criteria

### PR-2d — Project Members read-only page

- **Title**: `feat(FR-2209): add project members list page for project admins`
- **Scope**:
  - New page `react/src/pages/ProjectMemberListPage.tsx`
  - Route `/admin-members` (or under existing menu key); add to admin menu for project/domain/super admins
  - Query strategy: `projectRoles(projectId) → role.users` collection (preferred), with `adminUsersV2(filter: {project: {name}})` fallback
  - Columns: name, email, project role (admin/member)
  - **No CUD UI** (initial scope); spec §스토리 4
- **Files**: new page, route entry, menu entry, i18n keys
- **Dependencies**: PR-0
- **Acceptance**: spec §스토리 4 acceptance criteria

### PR-3 — E2E + i18n + final verification

- **Title**: `test(FR-2209): add E2E coverage and finalize translations for project admin`
- **Scope**:
  - Playwright tests using project-admin account (`project-admin-for-default@lablup.com`) on test server `http://10.122.10.215:8090`:
    - Login → Admin menu visible → each Admin page shows only `default` project data
    - Project selector badge visible
    - Switch to non-admin project → confirm dialog appears
  - i18n keys for all new strings (badge, confirm dialog, page titles)
  - `bash scripts/verify.sh` clean across stack
  - Run `/fw:batch-review` against the stack
- **Dependencies**: all prior PRs

---

## Open Questions & Risks

1. **Schema sync procedure**: how is `data/schema.graphql` refreshed (make target / manual fetch)? Confirm before PR-0.
2. **Serving backend gap**: file follow-up backend issue (or coordinate with backend team) — spec claims confirmed but schema disagrees.
3. **`PROJECT_ADMIN_PAGE` permission grant**: verify at runtime that the `role_project_<id>_admin` actually carries this permission; if not, role-name fallback is the actual signal.
4. **Domain admin scope arg**: which GraphQL arg (or RBAC scope string) does the WebUI pass for `domain:<name>` filtering on session/vfolder queries?
5. **Project member query**: validate that `projectRoles → role.users` connection is reliable in production data.
6. **PR #6026 disposition**: with FR-2314 absorbed here, decide whether to close #6026 or merge it as historical context (with PO).

---

## Verification

Test target (per user instruction):

```
E2E_WEBSERVER_ENDPOINT=http://10.122.10.215:8090
E2E_USER_EMAIL=project-admin-for-default@lablup.com
E2E_USER_PASSWORD="CWR0y4s5E9p#"
```

Account is **project admin of the `default` project**. Verifies PR-0 through PR-3 acceptance criteria end-to-end.
