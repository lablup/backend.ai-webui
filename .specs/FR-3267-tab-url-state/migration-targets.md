# FR-3267 — tab-url-state Migration Targets

Audit of every tab UI in `react/src/**` against the policy in
`.claude/skills/tab-url-state/SKILL.md`. Each work item below is scoped to be
implemented independently by one subagent. Read the skill first; it defines
Pattern A (page-like tabs: full URL state + `queryMapRef` save/restore) and
Pattern B (widget tabs on a detail surface: tab key only, table state local).

- Audit date: 2026-07-11 (branch `feat/FR-3267-per-tab-url-state`, base `main` @ 1c5a8e35b)
- Jira: FR-3267 / GitHub #8173

## Reference implementations (do not modify; copy from these)

| Role | File |
|---|---|
| Pattern A-i canonical (single component, parsed-state snapshot) | `react/src/pages/AdminComputeSessionListPage.tsx` |
| Pattern A-i (nuqs, second example) | `react/src/pages/ComputeSessionListPage.tsx` |
| Pattern A-ii canonical (host + self-contained children, raw query-string snapshot) | `react/src/pages/AdminUsersPage.tsx` (implemented by A1) |
| Pattern B canonical (tab key only) | `react/src/components/DeploymentRevisionCard.tsx` (`revisionTab`) |
| Pattern B table-state model (local pagination) | `react/src/components/DeploymentAuditLogTab.tsx` (`useBAIPaginationOptionState`) |

**A2–A6 all use Pattern A-ii**: the host snapshots `location.search` per tab in
a `queryMapRef` and restores it on switch. Children keep their own URL state
untouched — do NOT hoist child params into the host or drill props (see the
skill's anti-patterns).

**Status: A1–A11 complete; only Pattern B items (B1–B5) remain.**

Also compliant, no action: `VFolderNodeListPage.tsx`, `AdminVFolderNodeListPage.tsx`
(queryMapRef on the legacy `use-query-params` API — correct behavior, library
migration is out of FR-3267 scope).

## Verification required for every item

1. `bash scripts/verify.sh` passes.
2. Reload test per the skill's checklist: for Pattern A, set filter + page on
   each tab, switch tabs, reload — the active tab's state must reproduce; for
   Pattern B, only the open tab (where a tab key exists) survives reload.
3. No two sibling tabs read/write the same URL key via separate declarations.

---

## Pattern A work items (page-like tabs)

### A1. AdminUsersPage — `?tab=` full replace ✅ DONE (Pattern A-ii)

- Files: `react/src/pages/AdminUsersPage.tsx` only — children unchanged.
- Violations: `onTabChange` did `navigate({ pathname: '/credential', search: `?tab=${key}` })`
  (full query-string replace), wiping the departing tab's
  `filter`/`order`/`current`/`pageSize`.
- Fix applied: host-level `queryMapRef<Record<string, string>>` snapshotting
  `location.search` per tab (seeded with the current tab, kept fresh by a
  `useEffect` on `[currentTab, location.search]`); `onTabChange` navigates to
  the stored string, falling back to `?tab=${key}` for never-visited tabs.
  Children keep their own URL state (generic keys are fine — the host swaps
  the whole string, and only one child is mounted at a time).
  `AdminUserCredentialList` stays on use-query-params (library migration is
  out of FR-3267 scope).

### A2. AdminDeploymentListPage — `?tab=` full replace + 4-way collision (heaviest) ✅ DONE (Pattern A-ii)

- Files: `react/src/pages/AdminDeploymentListPage.tsx` only — children unchanged.
- Violations: `onTabChange` navigated with `pathname: '/admin-deployments',
  search: `?tab=${key}`` (full replace). All four tab children declare their
  own nuqs URL state with the same generic keys: `filter`(json)/`order` +
  `current`/`pageSize` (the deployments tab additionally `statusCategory`).
- Fix applied: added host-level `queryMapRef<Record<string, string>>` at the
  `AdminDeploymentListPage` wrapper, seeded with the current tab and kept fresh
  by a named-function `useEffect(function snapshotTabQueryString() {...},
  [currentTab, location.search])`; `onTabChange` now navigates to the stored
  raw query string (`navigate({ search: queryMapRef.current[key] ?? `?tab=${key}` })`,
  no pathname), falling back to `?tab=${key}` for never-visited tabs. Tab read
  via read-only nuqs `useQueryState` (`parseAsStringLiteral`, default
  `'deployments'`). All four children stay
  untouched — the host swaps the whole query string per tab, so their shared
  generic keys never collide.

### A3. AdminSessionPage — full replace over a nested Pattern-A child ✅ DONE (Pattern A-ii)

- Files: `react/src/pages/AdminSessionPage.tsx` only — children unchanged.
- Violations: `onTabChange` both wrote nuqs `tab` (`history: 'push'`) AND
  called `webUINavigate({ search: new URLSearchParams({ tab: key }) })` — a
  full replace that wiped the nested child's `type`/`filter`/`order`/
  `statusCategory`/`current`/`pageSize`. `PendingSessionNodeList` uses
  `...OnSearchParamLegacy` (`current`/`pageSize`), colliding with the
  sessions child.
- Fix applied: removed the nuqs `useQueryStates` `tab` schema and the
  `webUINavigate` double-write entirely; adopted the A-ii idiom —
  read-only nuqs `useQueryState('tab', parseAsStringLiteral(...))` (default
  `'compute-sessions'`), `useLocation`, a `queryMapRef<Record<string, string>>`
  seeded with the current tab, a named-function `snapshotTabQueryString`
  effect, and `onTabChange` doing `webUINavigate({ search:
  queryMapRef.current[key] ?? `?tab=${key}` })` (no pathname). The nested
  Pattern A-i child (`AdminComputeSessionListPage`) works naturally: its keys
  are part of the raw string being snapshotted. Children untouched.

### A4. EnvironmentPage — lingering keys across tabs (merge setter) ✅ DONE (Pattern A-ii)

- Files: `react/src/pages/EnvironmentPage.tsx` only — children unchanged.
- Violations: tab key `tab` via use-query-params with merge semantics — keys
  were never reset, so `image` ↔ `registry` carried each other's
  `order`/`current`/`pageSize` (both children write those generic keys).
- Fix applied: replaced the use-query-params `useQueryParam('tab')` merge
  setter with the A-ii idiom — read-only nuqs `useQueryState` (default `'image'`),
  `useLocation`, a `queryMapRef` seeded with the current tab, a named-function
  `snapshotTabQueryString` effect, and an `onTabChange` that navigates to the
  stored raw query string (swap, don't merge; fallback `?tab=${key}`). Added
  `'use memo'` to the component body. Children untouched.

### A5. ResourcesPage — state loss on switch, shared keys ✅ DONE (Pattern A-ii)

- Files: `react/src/pages/ResourcesPage.tsx` only — children unchanged.
- Violations: tab key via use-query-params `updateType: 'replace'` — each
  switch dropped the other params, so tabs lost filter/page on switch and a
  reloaded non-default tab couldn't reproduce its view. `agents` and `storages`
  share `current`/`pageSize` (AgentList also `status`/`filter`/`order`).
- Fix applied: replaced the `updateType: 'replace'` tab setter with the A-ii
  idiom — read-only nuqs `useQueryState` (default `'agents'`), `useLocation`, a
  `queryMapRef` seeded with the current tab, a named-function
  `snapshotTabQueryString` effect, and an `onTabChange` navigating to the
  stored raw query string. Removed the now-unused `TabKey` type and the
  use-query-params import; added `'use memo'`. Also renamed the deprecated
  `tab:` → `label:` in all three `tabList` items (antd-v6-props). Children
  untouched. Note: the old setter used history *replace*; the A-ii idiom
  navigates with *push* (consistent with the pattern's deep-linkable-tab
  intent), so tab switches now create history entries — deliberate, not a
  regression.

### A6. ResourcePolicyPage — full-replace idiom, currently benign (small) ✅ DONE (Pattern A-ii)

- Files: `react/src/pages/ResourcePolicyPage.tsx`
- Violations: `onTabChange` full-replaced via
  `webUINavigate({ pathname: '/resource-policy', search: URLSearchParams({ tab }) })`.
  Children declare no URL table state today, so nothing was lost —
  consistency/latent fix only.
- Fix applied: replaced the full-replace `onTabChange` with the A-ii
  snapshot/restore idiom — read-only nuqs `useQueryState` (default `'keypair'`),
  `useLocation`, a `queryMapRef` seeded with the current tab, a named-function
  `snapshotTabQueryString` effect, and `webUINavigate({ search:
  queryMapRef.current[key] ?? `?tab=${key}` })` (no pathname). Dropped the
  use-query-params import; added `'use memo'`. Future-proofs the page and keeps
  the idiom uniform.

### A7. SchedulerPage — latent full replace, single tab (small) ✅ DONE (handler removed)

- Files: `react/src/pages/SchedulerPage.tsx`
- Violations: single tab (`fair-share`) but `onTabChange` full-replaced; child
  `FairShareItems/FairShareList.tsx` carries significant URL state
  (`resourceGroup`/`domain`/`project`/`user`/`current`/`pageSize`) that would
  have been wiped if a second tab is ever added.
- Fix applied: removed the dangerous full-replace `onTabChange` entirely — a
  single-tab card never switches, so snapshot machinery would be inert dead
  code (simplify-pass judgment). Kept a read-only nuqs `useQueryState` read for
  `activeTabKey`. Dropped the use-query-params import (the
  `FairShareErrorFallback` nuqs `useQueryStates` is unrelated and kept);
  added `'use memo'`; renamed the deprecated `tab:` → `label:` in the single
  `tabList` item.

### A8. ProjectAdminDataPage — missing explicit reset before restore (tiny) ✅ DONE (A-i reset fix)

- Files: `react/src/pages/ProjectAdminDataPage.tsx`
- Violations: had `queryMapRef` + restore but merged without the
  `setQueryParams(null)` reset. Worked only because both tabs share an
  identical key schema; keys could linger when switching to a never-visited tab.
- Fix applied: added the `setQuery(null)` reset (with the "Set to null first to
  reset to default values" comment) immediately before applying the stored/
  spread state in `onChange`, matching the canonical A-i implementation in
  `AdminComputeSessionListPage.tsx`. Nothing else changed.

### A9. StatisticsPage — full replace wipes child URL state (user-facing) ✅ DONE (Pattern A-ii)

- Files: `react/src/pages/StatisticsPage.tsx` only — children unchanged.
- Violations: originally misclassified as "no violation" because its children
  don't share generic keys — but its tab setter used use-query-params
  `updateType: 'replace'`, which replaces ALL query params, wiping the other
  tab's child state on switch (`AllocationHistory` → `selectedPeriod`,
  `UserSessionsMetrics` → `startDate`/`endDate`). Same class of bug as A5.
- Fix applied: A-ii idiom — read-only nuqs `useQueryState` (default
  `'allocation-history'`), `useLocation`, `queryMapRef` + named-function
  `snapshotTabQueryString` effect, navigate swap `onTabChange`. Dropped the
  use-query-params import; added `'use memo'`; renamed deprecated `tab:` →
  `label:` in both `tabList` items. Children untouched.

### A10. UserSettingsPage — uniform A-ii protection (user-facing) ✅ DONE (Pattern A-ii)

- Files: `react/src/pages/UserSettingsPage.tsx` only — children unchanged.
- Rationale: no active bug (merge-semantics setter, children keep table state
  in memory today), but per the uniform-host policy every page-like multi-tab
  host carries the A-ii snapshot/restore so children can adopt URL state
  later without host changes.
- Fix applied: replaced the use-query-params `useQueryParam('tab')` with
  read-only nuqs `useQueryState` (literal union of the four tab keys, default
  `'general'`), `useLocation`, `queryMapRef` + named-function
  `snapshotTabQueryString` effect, navigate swap `onTabChange`. The lazy
  Relay query loading keyed on `curTabKey` is untouched. Removed the unused
  `TabKey` type and `tabParam` const.

### A11. Single-tab pages — dead `onTabChange` + legacy tab setter sweep ✅ DONE

- Files: `react/src/pages/AgentSummaryPage.tsx`, `BrandingPage.tsx`,
  `ConfigurationsPage.tsx`, `MaintenancePage.tsx`, `MyEnvironmentPage.tsx`,
  `DiagnosticsPage.tsx`
- Violations: each single-tab page carried an `onTabChange` that can never
  fire with a different key, wired to a use-query-params setter
  (AgentSummaryPage even with the dangerous `updateType: 'replace'`), plus
  deprecated `tab:` props and missing `'use memo'` in places.
- Fix applied (SchedulerPage/A7 precedent): removed the dead `onTabChange`
  and all use-query-params tab machinery; tab key read via read-only nuqs
  `useQueryState` with a single-literal parser; `'use memo'` where missing,
  and `tab:` → `label:` renames. ConfigurationsPage's raw antd `Card`
  migrated to `BAICard` (use-bai-card rule; tabbed card keeps default body
  padding).

---

## Pattern B work items (widget tabs / cards on detail surfaces)

### B1. DeploymentRevisionHistoryTab — `rv*` keys → local state

- Files: `react/src/components/DeploymentRevisionHistoryTab.tsx`
- Violations: nuqs `useQueryStates` writes `rvFilter`/`rvOrder`/`rvCurrent`/
  `rvPageSize` to the deployment detail URL from inside a widget tab.
- Fix: `useState` for filter/order, `useBAIPaginationOptionState` for
  pagination — mirror its sibling `DeploymentAuditLogTab.tsx`. Delete the
  `useQueryStates`/`urlKeys` block. Note: the file's inline comment says URL
  persistence was added to avoid an out-of-range page index across tab
  switches — local state also resets the page on remount, so verify paging
  across tab switches still behaves (BAITable receiving `current` from fresh
  local state).

### B2. DeploymentReplicasCard — `r*` keys → local state

- Files: `react/src/components/DeploymentReplicasCard.tsx`
- Violations: writes `rFilter`/`rOrder`/`rCurrent`/`rPageSize`/
  `rStatusCategory` to the deployment detail URL from a plain (non-tabbed)
  sibling card.
- Fix: `useState` for filter/order/statusCategory,
  `useBAIPaginationOptionState` for pagination. Delete the `useQueryStates`
  block.

### B3. DeploymentAutoScalingCard — fully generic keys on the detail URL

- Files: `react/src/components/DeploymentAutoScalingCard.tsx`
- Violations: the worst offender — generic `order`/`filter` via
  `useQueryStates` (no key remap) plus generic `current`/`pageSize` via
  `useBAIPaginationOptionStateOnSearchParam`, all on the shared deployment
  detail URL (collision hazard with sibling cards and any page-level keys).
- Fix: `useState` for order/filter, `useBAIPaginationOptionState` for
  pagination. Remove both URL hooks.

### B4. ReservoirArtifactDetailPage — version-list table state → local

- Files: `react/src/pages/ReservoirArtifactDetailPage.tsx`
- Violations: the Version List card persists `filter` (use-query-params
  `JsonParam`) and `current`/`pageSize` (`...OnSearchParamLegacy`) to the
  detail-page URL.
- Fix: `useState` for filter, `useBAIPaginationOptionState` for pagination;
  drop the use-query-params import if unused afterward.

### B5. RoleDetailDrawer tabs — `s*`/`p*`/`a*` keys → local state

- Files: `react/src/components/RoleDetailDrawerContent.tsx`,
  `react/src/components/RoleScopeTab.tsx`,
  `react/src/components/RolePermissionTab.tsx`,
  `react/src/components/RoleAssignmentTab.tsx`
- Scope decision (made for FR-3267): a drawer is a widget surface — Pattern B
  applies. The active tab key is already local `useState` (fine; a drawer tab
  need not persist at all).
- Violations: each tab persists its table state to the URL with prefixed keys
  (`sCurrent`/`sPageSize`/`sOrder`/`sFilter`, `p*`, `a*`), and
  `RoleDetailDrawerContent` declares all twelve keys solely to null them out
  on tab change.
- Fix: move each tab's filter/order/pagination to local state
  (`useState` + `useBAIPaginationOptionState`); delete the twelve-key
  `useQueryStates` reset bookkeeping in `RoleDetailDrawerContent`.

---

## Explicitly out of scope / no action

- **Decorative-tab pages** (static `activeTabKey`, no `onTabChange`, no tab
  URL key): `ProjectPage`, `RBACManagementPage`, `ReservoirPage`. The other
  single-tab pages initially listed here were swept in A11, and
  `UserSettingsPage`/`StatisticsPage` were reclassified as A10/A9 — the
  uniform-host policy now covers every page-like tab host.
- **Local-state widget tabs already compliant**: `SessionDetailContent`,
  `StorageHostDetailDrawerContent`, `AgentDetailDrawerContent`,
  `FolderExplorerModalV2`, `SettingList`, `RuntimeParameterFormSection`,
  modals (`StartFromURLModal`, `DownloadModal`).
- **use-query-params → nuqs migration** is NOT a goal of FR-3267. With the
  A-ii recipe no item requires it — the raw query-string snapshot is
  library-agnostic. `VFolderNodeListPage`/`AdminVFolderNodeListPage` and all
  legacy children stay on the legacy API.
- **Deprecated `tab:` → `label:`** (antd v6): fixed in every page an A-item
  touched that still had it (A5, A7, A9, A11; UserSettingsPage/A10 already
  used `label:`). The only remaining `tab:` is
  `ReservoirPage` — a decorative single-static-tab page (out of scope; see
  below), left untouched.
- **Decorative single-static-tab pages** (`activeTabKey` is a hardcoded
  literal, no `onTabChange`, no tab URL key — BAICard's `tabList` used purely
  as a titled header): `ProjectPage`, `RBACManagementPage`, `ReservoirPage`.
  No tab switching exists, so there is no state to protect. Genuinely out of
  scope.

## Suggested execution order

1. **B1–B5** — independent, small, no shared files; safe to run in parallel.
2. **A6, A7, A8** — tiny, independent.
3. **A1, A4, A5** — medium; independent of each other.
4. **A2** — heaviest (4 tab children).
5. **A3** — last: it wraps the canonical `AdminComputeSessionListPage`; doing
   it after the others means the nested-tab handling gets the benefit of
   lessons from A1/A2.

All items are file-disjoint except A3's read-dependency on
`AdminComputeSessionListPage` — no two items should edit the same file.
