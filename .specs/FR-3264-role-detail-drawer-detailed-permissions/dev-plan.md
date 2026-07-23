# Dev Plan: FR-3264 Role Detail Drawer — "Detailed Permissions" Tab Redesign

## Spec Reference

`.specs/FR-3264-role-detail-drawer-detailed-permissions/spec.md` (finalized 2026-07-07; all open questions resolved)

## Parent Task

**FR-3264** — "Redesign role detail drawer to show assigned scopes and permissions at a glance" (Task, In Progress, assignee SungChul Hong). GitHub clone **#8165**.

> **No Epic, and no Jira Sub-task type used.** FR-3264 is a `Task`. The FR project's sub-task issue type (`Subtask`) does **not** get cloned to GitHub by the Jira→GitHub webhook (verified: FR-3208/FR-3207 have `github_issue_url: null`), whereas `Task` issues do (FR-3264 → #8165). A Graphite stacked-PR flow needs a GitHub clone per PR for the `Resolves #N (FR-XXXX)` reference. Therefore the three work items are created as **`Task` issues linked to FR-3264 with `relates`**, and chained with `is blocked by` to model the stack order. Each got its own GitHub clone.

---

## WebUI Current State (verified against `main`)

- `RoleDetailDrawer.tsx` — `RoleDetailDrawerQuery` (`useLazyLoadQuery`, `fetchPolicy: network-only`) spreads `RoleScopeTabFragment`, `RolePermissionTabFragment`, `RoleAssignmentTabFragment` + role fragments, then hands `data` to `RoleDetailDrawerContent` as `scopeQueryRef` / `permissionQueryRef` / `assignmentQueryRef`.
- `RoleDetailDrawerContent.tsx` — `Descriptions` metadata block + three-tab `Tabs` (`scopes` / `permissions` / `assignments`). Holds `activeTab` local state and a `useQueryStates` reset of `s*` / `p*` / `a*` nuqs keys on tab change.
- `RoleScopeTab.tsx` — `useRefetchableFragment` over `adminRole.scopes` (`scopeType`, `scopeId`, `scope` name via `ProjectV2`/`DomainV2`/`UserV2` `basicInfo`); own filter + `BAIFetchKeyButton`; offset pagination via `sCurrent/sPageSize/sOrder/sFilter` nuqs keys.
- `RolePermissionTab.tsx` — `useRefetchableFragment` over `adminPermissions`; flat table one row per grant; `CreatePermissionModal` for create/edit, `BAIDeleteConfirmModal` for delete; `resolveScopeName()` name resolver (single source of truth, richer than `RoleScopeTab`'s — covers VFOLDER/SESSION/MODEL_DEPLOYMENT/RESOURCE_GROUP/CONTAINER_REGISTRY); `p*` nuqs keys.
- `CreatePermissionModal.tsx` — `rbacPermissionMatrix` (`useLazyLoadQuery`) + `adminCreatePermission` / `adminUpdatePermission`; groups ops into Direct vs Delegate (`GRANT_*`); `CreatePermissionModal_roleScopeFragment` fetches `scopes(first: 100)` to enumerate the role's scopes.
- `RoleAssignmentTab.tsx` — user assignments, bulk assign/revoke, `a*` nuqs keys. **Unchanged by this work.**
- `ProjectFolderPermissionPanel.tsx` — layout reference: one `BAICard` per section stacked in `BAIFlex direction="column"`, card-scoped control in `extra`, `styles={{ body: { paddingTop: 0 } }}`.
- `packages/backend.ai-ui/src/components/BAIBulkEditFormItem.tsx` — bulk-edit pattern reference: `keep` / `edit` / `clear` modes; `keep` submits `undefined` (excluded); only user-modified fields enter the submission.

### GraphQL reality (verified — no schema change)

- `rbacPermissionMatrix: [ScopeEntityOperationCombination!]` at `data/schema.graphql:14695`; `ScopeEntityOperationCombination` at `:17826` (`scopeType`, `entities[].entityType`, `entities[].actions[]` with `operation` / `description` / `requiredPermission`).
- `adminRole(id).scopes(filter: EntityFilter, limit, offset, …)` and `adminPermissions(filter: PermissionFilter{roleId,scopeType,scopeId,entityType}, limit, offset)` support the offset pagination + filters needed.
- Mutations `adminCreatePermission` / `adminDeletePermission` exist; **no bulk permission mutation** → per-cell N mutations with partial-failure handling.
- `baiClient.supports('rbac-filter-wrapper')` (filter value wrapping) and `baiClient.supports('role-auto-assign')` (metadata `autoAssign`) guards must be preserved.

---

## Phased PR Stack (Graphite)

```
main
 └── PR 1  FR-3271 (#8179)  "Detailed Permissions" tab — per-scope-type tables + grant-state tags (VIEW)
      └── PR 2  FR-3272 (#8181)  Scope-level permission edit modal — single-scope (replaces CreatePermissionModal)
           └── PR 3  FR-3273 (#8180)  Multi-scope bulk edit (rowSelection + Keep-as-is)
```

Linear stack — each PR stacks on the previous. Rationale: the three genuinely-distinct concerns are the at-a-glance **view** (High-tier: grant-state tag algorithm), the **single-scope edit** (High-tier: matrix grid + N-mutation reconciliation), and the **multi-scope bulk edit** (High-tier: BAIBulkEditFormItem "Keep as is" + apply-to-all). i18n strings and the file deletions are folded into the PR that introduces/supersedes them (per the "don't create separate PRs for Low-tier i18n/cleanup" guidance) rather than a standalone cleanup PR.

**Merge as a stack.** The two-tab end state (FR-1) is reached at PR 2. Recommended non-regressive sequencing: PR 1 removes only the **Scopes** tab (fully absorbed, no CRUD lost) and keeps the standalone **Permissions** tab in place; PR 2 removes the Permissions tab when its replacement (the edit modal) lands. This keeps each PR independently non-regressive while the stack converges on exactly two tabs.

---

## Sub-tasks

### PR 1 — FR-3271 (GitHub #8179) — "Detailed Permissions" tab: per-scope-type tables + grant-state tags

- **Title**: `feat(FR-3271): add "Detailed Permissions" tab with per-scope-type tables and grant-state tags`
- **Review complexity**: **High** (grant-state tag algorithm + multi-query section wiring + tab/query restructure)
- **Changed files**:
  - NEW `react/src/components/RolePermissionAssignmentTab.tsx` — merged tab. Derive the distinct assigned scope types from the role's scopes (reuse the `scopes(first: 100)` precedent — either spread `CreatePermissionModal_roleScopeFragment` on the `role` already available in `RoleDetailDrawerContent`, or issue an equivalent `adminRole(id).scopes(first: 100)` query). Render one `BAICard` per distinct type, stacked in `BAIFlex direction="column"` (layout ref `ProjectFolderPermissionPanel.tsx`, `styles={{ body: { paddingTop: 0 } }}`). Empty state (`rbac.NoScopesToDisplay`) when the role has no scopes.
  - NEW per-scope-type section (inline component or `RoleScopePermissionSection.tsx`) — issues its **own** queries so filter/refresh on one card does not refetch the others: (a) `adminRole(id).scopes(filter:{entityType}, limit, offset)` for rows, (b) `adminPermissions(filter:{roleId, scopeType}, limit, offset)` for tag computation, (c) `rbacPermissionMatrix` for the selectable entity list + full operation set. Card-scoped `BAIFetchKeyButton` in `extra`; content-scoped `BAIGraphQLPropertyFilter` in the body. Offset pagination (`limit`+`offset` **only**) in **local React state** (not nuqs). Port `resolveScopeName()` from `RolePermissionTab.tsx`.
  - MODIFY `react/src/components/RoleDetailDrawerContent.tsx` — add the Detailed Permissions tab (default active); remove the Scopes tab; drop the `s*`/`p*` nuqs keys and their reset in `handleTabChange` (keep `a*`). Keep the `Descriptions` block byte-for-byte (FR-7). `<Suspense fallback={<Skeleton active/>}>` around the new tab.
  - MODIFY `react/src/components/RoleDetailDrawer.tsx` — drop the `RoleScopeTabFragment` spread + `scope*` variables from `RoleDetailDrawerQuery`.
  - DELETE `react/src/components/RoleScopeTab.tsx` (fully absorbed). Keep `RolePermissionTab.tsx` / `CreatePermissionModal.tsx` (removed in PR 2).
  - `resources/i18n/en.json` + `ko.json` — add `rbac.DetailedPermissions` (ko: 세부 권한), `rbac.FullyAllowed`, `rbac.PartiallyAllowed`, `rbac.NotAllowed`, `rbac.NoScopesToDisplay`. Reuse `rbac.types.*`, `rbac.ScopeId`, `rbac.ScopeRawId`.
- **Grant-state tag logic (FR-4)**: for each `(scopeId, entityType)`, compare the role's granted operations against the **full** matrix operation set for `(scopeType, entityType)` — including `GRANT_*` delegate ops. all → green, some → gold, none → gray (still shown). Tags are **display-only**. Entity types absent from the matrix render no tag.
- **Dependencies**: none (stack base).
- **Acceptance criteria → spec FRs**:
  - Exactly the new tab + Assignments; Detailed Permissions default; Assignments unchanged. **(FR-1)**
  - One card per distinct assigned scope type; no card for unassigned types; empty state when no scopes; section title = `rbac.types.{TYPE}`. **(FR-2)**
  - Per-card filter + refresh + independent query; `(limit, offset)`-only pagination in local state. **(FR-3)**
  - Columns = name (`BAINameActionCell`) + scopeId (`BAIId`) + display-only color-coded entity tags; green/gold/gray computed against the full matrix set. **(FR-4)**
  - `Descriptions` metadata block unchanged; `autoAssign` still gated by `supports('role-auto-assign')`. **(FR-7)**

### PR 2 — FR-3272 (GitHub #8181) — Scope-level permission edit modal (single-scope), replaces CreatePermissionModal

- **Title**: `feat(FR-3272): add scope-level permission edit modal replacing CreatePermissionModal`
- **Review complexity**: **High** (matrix checkbox grid + dirty-tracked N-mutation reconciliation + partial-failure handling)
- **Changed files**:
  - NEW `react/src/components/RoleScopePermissionEditModal.tsx` — header shows scope-type label + resolved scope name of the row being edited. Body: entity × action checkbox grid from `rbacPermissionMatrix` (`entities[].actions[]`, using `operation`/`description` for labels/tooltips), Direct vs Delegate (`GRANT_*`) grouping ported from `CreatePermissionModal`, `ProjectFolderPermissionPanel`-style check UX. Single-scope pre-checks the ops the role currently grants on that `scopeId` (`adminPermissions(filter:{roleId, scopeType, scopeId})`). Save = dirty-track vs initial set, one mutation per changed cell only (`adminCreatePermission` on check, `adminDeletePermission({id})` on uncheck), no request for unchanged cells; `BAIButton` `action` loading; per-op failure surfaced via `message`/notification; refetch section on completion. Reversible → normal modal (not `BAIConfirmModalWithInput`).
  - MODIFY `react/src/components/RolePermissionAssignmentTab.tsx` — wire the `BAINameActionCell` edit action on each row to open the modal for that single scope; refetch that section on success (tag colors recompute).
  - MODIFY `react/src/components/RoleDetailDrawerContent.tsx` — remove the standalone Permissions tab → tab list reaches the FR-1 two-tab end state.
  - MODIFY `react/src/components/RoleDetailDrawer.tsx` — drop the `RolePermissionTabFragment` spread + `permission*` variables from `RoleDetailDrawerQuery`.
  - DELETE `react/src/components/RolePermissionTab.tsx` and `react/src/components/CreatePermissionModal.tsx` (superseded; matrix usage, Direct/Delegate grouping, `resolveScopeName` ported).
  - i18n: add `rbac.EditScopePermissions` (+ any modal labels); reuse `rbac.operations.*`, `rbac.operationGroups.*`, `rbac.types.*`.
- **Dependencies**: FR-3271 (`is blocked by`).
- **Acceptance criteria → spec FRs** (all **FR-6**, single-scope):
  - Edit modal from the `default` project row shows `default` in the header, renders the project scope's full entity × action grid, pre-checks exactly the currently-granted ops.
  - Check + save creates a permission row; uncheck + save removes it; only matrix-listed `(entity, operation)` combos are offered.
  - On success the modal closes, the section refetches, tag colors recompute; drawer shows exactly two tabs (FR-1 end state).

### PR 3 — FR-3273 (GitHub #8180) — Multi-scope bulk permission edit (rowSelection + Keep-as-is)

- **Title**: `feat(FR-3273): add multi-scope bulk permission edit to the scope-level edit modal`
- **Review complexity**: **High** (BAIBulkEditFormItem "Keep as is" semantics + per-scope apply-to-all reconciliation)
- **Changed files**:
  - MODIFY `react/src/components/RolePermissionAssignmentTab.tsx` (+ section component) — add `rowSelection` to each per-scope-type table; add a selection toolbar entry (`BAISelectionLabel`) that opens the edit modal in bulk mode for the selected scopes.
  - MODIFY `react/src/components/RoleScopePermissionEditModal.tsx` — add bulk mode following `BAIBulkEditFormItem`: every cell initially "Keep as is" (per-scope current values not merged for display); only user-modified cells enter the submission; untouched cells submit `undefined` and keep each scope's existing value. On save, each modified cell's final value is applied to every selected scope via the same dirty-tracked per-cell `adminCreatePermission`/`adminDeletePermission` reconciliation (per target scope), skipping scopes already in the desired state. Header reflects multi-scope. Aggregate + report per-op failures; refetch section on completion.
  - i18n: any bulk-specific labels; reuse `comp:BAIBulkEditFormItem.KeepAsIs` semantics.
- **Dependencies**: FR-3272 (`is blocked by`).
- **Acceptance criteria → spec FRs** (all **FR-6**, multi-scope):
  - Selecting project1 (`SESSION: CREATE/READ`) + project2 (`SESSION: READ`) shows every cell as "Keep as is".
  - Modifying only `SESSION × CREATE` to checked and saving adds CREATE to project2 (project1 unchanged), all other permissions retained on both.
  - Untouched cells issue no mutation; tags recompute after refetch; partial failures reported without losing the rest.

---

## Dependency Graph / Wave Ordering

```
FR-3271 (#8179) ──is blocked by── FR-3272 (#8181) ──is blocked by── FR-3273 (#8180)
   (all three: relates → FR-3264 #8165)
```

| Wave | Issue | GitHub | Depends on | Can start when |
|---|---|---|---|---|
| 1 | FR-3271 | #8179 | — | now |
| 2 | FR-3272 | #8181 | FR-3271 | PR 1 branch exists (stack on it) |
| 3 | FR-3273 | #8180 | FR-3272 | PR 2 branch exists (stack on it) |

Strictly sequential — no parallelism (each PR extends the component the previous one introduces). This is one Graphite stack, submitted with `gt submit --stack` and merged as a stack.

---

## Excluded / Non-goals (from spec)

- **FR-5** ("?" explanation modal) — explicitly excluded 2026-07-07; matrix `operation`/`description` surface inside the edit modal instead.
- `RoleAssignmentTab` / `AssignRoleModal` / `RoleFormModal` / `RoleNodes` / `RBACManagementPage` list surface — unchanged.
- No backend / `data/schema.graphql` change (a genuine gap is a risk to escalate, not in-scope).
- No bulk permission mutation (would be backend work) — bulk edit is N single mutations.
- Localizing the 20 non-en/non-ko locales — English fallback until a follow-up pass.

---

## Risks (carried from spec, to confirm during implementation)

1. **Distinct-scope-type derivation vs. pagination** — deriving the distinct set from a paginated `adminRole.scopes` is exact only if all scopes are fetched. Use the `scopes(first: 100)` precedent; confirm the upper bound is sufficient.
2. **Tag-state computation truncation** — `adminPermissions` filtered by `roleId` + `scopeType` must not be truncated by pagination before the fully/partial/none computation. Verify the fetched permission set is complete for the visible rows (fetch enough, or fetch per visible page).
3. **Non-atomic saves** — no bulk mutation → a mid-batch failure leaves partial state. Must report which ops failed and refetch to reflect true state (both single- and multi-scope). Escalate only if atomicity is required (new backend mutation, out of scope).
4. **Non-regression sequencing** — keep the standalone Permissions tab (CRUD) alive in PR 1; remove it in PR 2 when the edit modal replaces it, so no PR merged alone loses permission editing.

---

## Verification (every PR)

Run from project root:

```bash
pnpm run relay          # after adding/altering any graphql tag
bash scripts/verify.sh  # Relay + Lint + Format + TypeScript; must end with "=== ALL PASS ==="
```

Per-PR checks:

- No dangling imports of deleted components (`RoleScopeTab`, `RolePermissionTab`, `CreatePermissionModal`).
- Pagination on every section declares only `(limit, offset)` — no mixed cursor/offset args (`.claude/rules/graphql-pagination.md`).
- `BAICard` usage follows `.claude/rules/use-bai-card.md` (`styles={{ body: { paddingTop: 0 } }}`, card-scoped actions in `extra`).
- New components carry the `'use memo'` directive; no new `useMemo`/`useCallback` (`.claude/rules/react-compiler-memoization.md`).
- i18n keys added to both `en.json` and `ko.json`; no hardcoded UI strings.
- PR body starts with `Resolves #<clone> (FR-XXXX)` — `#8179 (FR-3271)`, `#8181 (FR-3272)`, `#8180 (FR-3273)` — with the required space before `(`.
