# Storage Host Permission Migration Spec

> **Epic**: [FR-2969](https://lablup.atlassian.net/browse/FR-2969)
> **Status**: Draft
> **Created**: 2026-05-26
> **Author**: sungchul@lablup.com

## Overview

Migrate the **storage host permission management** feature from `backend.ai-control-panel`
(currently at `/vfolders/?tab=permissions`, i.e. `StoragePermissionsPage.tsx`) into
`backend.ai-webui`'s Resources → Storage tab, and absorb the existing **standalone
Storage Setting page** (`StorageHostSettingPage.tsx`, route `/storage-settings/:hostname`)
into a tabbed **Detail Drawer** opened from the storage row's gear icon.

### Current UX (webui, as of main)

```
Resources → Storage tab
   └─ StorageProxyList table row
       ├─ ⓘ "Info"      → dispatches `backend-ai-selected-storage-proxy` event (legacy panel)
       └─ ⚙ "Settings"  → webuiNavigate(`/storage-settings/${record.id}`)
                          → full-page StorageHostSettingPage
                              ├─ Breadcrumb: Resources / Storage Setting
                              ├─ <Typography.Title> {hostname}
                              ├─ <StorageHostResourcePanel/> (Usage, Endpoint, Backend, Capabilities)
                              └─ <StorageHostSettingsPanel/> (Quota Settings — Card with For User / For Project tabs)
```

There is no UI in webui today for managing storage host **permissions**
(allowed_vfolder_hosts per domain / project / keypair-resource-policy).
That feature only exists in control-panel.

### Target UX

```
Resources → Storage tab
   └─ StorageProxyList table row
       ├─ ⓘ "Info"      → unchanged (legacy event-dispatched panel)
       └─ ⚙ "Settings"  → opens StorageHostDetailDrawer (NEW)
                            ├─ Drawer header: storage host name (record.id)
                            ├─ Drawer extra: BAIFetchKeyButton (refresh)
                            ├─ Drawer body — top section:
                            │     <StorageHostResourcePanel/>  (Endpoint, Backend, Capabilities, Usage)
                            └─ Drawer body — bottom section: <Tabs>
                                  ├─ Tab "Capacity Setting" (default active)
                                  │     └─ <StorageHostSettingsPanel/>  (existing Quota Settings)
                                  └─ Tab "Permissions"
                                        └─ <StorageHostPermissionPanel/> (NEW — ported from control-panel)
```

The standalone `/storage-settings/:hostname` route is **removed**; the gear
icon now opens the drawer instead of navigating. (See [Decision D-3](#decisions-and-defaults).)

## Problem Statement

1. Operators currently need to switch between control-panel and webui to manage
   storage host permissions. The capacity (quota) UI lives in webui; the
   permissions UI lives in control-panel. Migration consolidates both in webui.
2. webui's existing Storage Setting page is a separate full-page route, which is
   inconsistent with the project's prevailing detail-drawer pattern
   (`AgentDetailDrawer`, `RoleDetailDrawer`, etc.). Moving to a drawer unifies
   the UX and frees the gear-icon flow to host the new Permissions tab.

## Source Code Map

### `backend.ai-control-panel` (source — port FROM here)

| File | Purpose |
|---|---|
| `frontend-react/src/pages/StoragePermissionsPage.tsx` | The permission management form. Hosts a `StorageSelect` and three `StoragePermissionFormItems` tables (domains / projects / keypair_resource_policies). Implements `handleUpdate` with a mount-in-session warning modal, calls `updateStorageHostPermission()` which round-trips via `hubFetch` REST proxy. |
| `frontend-react/src/components/StoragePermissionFormItems.tsx` | Per-policy-type table component. Defines the permission column model (`getPermissionGroups`) with 8 permission keys grouped by category. |
| `frontend-react/src/hooks/useStoragePermissions.ts` | TanStack-Query hook that calls `GET /api/storage-volume/get_permissions_related_policies/` and filters per selected storage host. |
| `frontend-react/src/pages/VFolderPage.tsx` (lines 85–95) | Where the "permissions" tab is registered. Tab key = `permissions`. Hidden via `managerHub.configs.display.hideStoragePermissionTab` flag. |
| `frontend-react/src/locales/en/translation.json` (key `storagePermissions.*`) | English strings for the permissions UI. |
| `frontend-react/src/locales/ko/translation.json` (key `storagePermissions.*`) | Korean strings. |
| `manager_hub/vfolder/views.py` (lines 880–1043) | Django REST endpoints: `GET get_permissions_related_policies/` proxies a GraphQL query for `domains { name allowed_vfolder_hosts }`, `groups { id name allowed_vfolder_hosts }`, `keypair_resource_policies { name allowed_vfolder_hosts }`. `POST update_permissions_related_policies/` builds a multi-mutation GraphQL string with one `modify_domain`/`modify_group`/`modify_keypair_resource_policy` per row and forwards it through `sess.Admin.query(...)`. |

**Reusable knowledge to port:**

- Permission grouping (categories + 8 keys) — see [Permission Model](#permission-model) below.
- Mount-in-session warning flow: if any policy has `mount-in-session` enabled
  without both `download-file` and `upload-file`, show a warning modal before
  saving.
- "Select All" / "Unselect All" toggle per policy-type table.

### `backend.ai-webui` (destination — port TO here)

| File | Role | Action |
|---|---|---|
| `react/src/components/StorageProxyList.tsx` | Storage host table (Resources → Storage tab). Row action `key: 'settings'` currently calls `webuiNavigate('/storage-settings/${record.id}')` (lines 172–178). | **Modify** — replace `webuiNavigate` with `setDrawerStorageHostId(record.id)` (or equivalent) to open the new drawer. Add Suspense-wrapped `<StorageHostDetailDrawer/>` mounted at the list level. |
| `react/src/pages/StorageHostSettingPage.tsx` | Standalone settings page (route `/storage-settings/:hostname`). Renders `<StorageHostResourcePanel/>` + `<StorageHostSettingsPanel/>` with a breadcrumb. | **Delete** — content moves into the drawer. See [Decision D-3](#decisions-and-defaults). |
| `react/src/routes.tsx` (lines 51–52, 765–771) | Route registration for `StorageHostSettingPage`. | **Remove** the lazy import and the route entry. |
| `react/src/components/MainLayout/WebUISider.tsx` (lines 252–253) | Sidebar selection logic that special-cases `storage-settings` path. | **Remove** the `storage-settings` branch — no longer reachable. |
| `react/src/hooks/useWebUIMenuItems.tsx` (lines 785, 799) | Menu selection logic that special-cases `storage-settings` path. | **Remove** the `storage-settings` branch — no longer reachable. |
| `react/src/components/StorageHostResourcePanel.tsx` | "Endpoint / Backend / Capabilities / Usage" Descriptions panel. Used today inside `StorageHostSettingPage`. | **Reuse** unchanged inside the drawer header section. |
| `react/src/components/StorageHostSettingsPanel.tsx` | Quota Settings card (For User / For Project tabs, Domain/Project/User selectors, `QuotaScopeCard`, `QuotaSettingModal`). Backed by `quota_scope` GraphQL query. | **Reuse** unchanged as the "Capacity Setting" tab body. |
| `react/src/components/AgentDetailDrawer.tsx`, `react/src/components/AgentDetailDrawerContent.tsx` | Canonical reference for the project's tabbed detail-drawer pattern (refetchable fragment, `BAIFetchKeyButton` in `extra`, internal `<Tabs items={…}/>`, `size={800}`). | **Reference only** — model `StorageHostDetailDrawer` on this. |
| `react/src/components/RoleDetailDrawer.tsx`, `react/src/components/RoleDetailDrawerContent.tsx` | Secondary tabbed-drawer reference. | Reference only. |
| `resources/i18n/en.json` (key `storageHost.*`) and `resources/i18n/ko.json` | Existing storage host i18n strings (`StorageSetting`, `QuotaSettings`, `ForUser`, `ForProject`, etc.). | **Extend** with new `storageHost.permission.*` keys (and Korean equivalents). |

**New components to create:**

| Path | Purpose |
|---|---|
| `react/src/components/StorageHostDetailDrawer.tsx` | The new drawer. Props: `storageHostId?: string \| null; onRequestClose: () => void; open: boolean`. Loads the storage volume via `useLazyLoadQuery` (the same `storage_volume(id:)` query currently inside `StorageHostSettingPage`). Renders header (host id as title, refresh button in `extra`), top `StorageHostResourcePanel`, and an internal `Tabs` with the two children. Pattern mirror: `AgentDetailDrawer.tsx`. |
| `react/src/components/StorageHostPermissionPanel.tsx` | The new "Permissions" tab body. Fetches domain / group / keypair_resource_policy permissions for the given storage host via Relay (see [API Contract](#api-contract)), renders three tables (one per policy type) with checkbox permission cells using `BAITable`, and provides "Update" + "Select all/Unselect all" + mount-in-session warning behavior, mirroring the control-panel implementation but rewritten with the project's conventions (`'use memo'`, `BAIButton action`, `BAIFlex`, `useTranslation`, etc.). |

### `backend.ai` (backend — schema reference only; no changes required for v1)

| File | Purpose |
|---|---|
| `data/schema.graphql` (webui-bundled copy) | Source of truth for the GraphQL schema served to webui. Confirms `modify_domain`, `modify_group`, `modify_keypair_resource_policy` mutations exist (lines 10508, 10527, 10633), input shapes (`ModifyDomainInput`, `ModifyGroupInput`, `ModifyKeyPairResourcePolicyInput` at lines 10029, 10140, 10206), and `vfolder_host_permissions { vfolder_host_permission_list }` query (line 13610, type at line 12103) are all available. |
| `src/ai/backend/manager/models/{domain,group,keypair}/` (in `backend.ai` repo) | Backend implementation of `allowed_vfolder_hosts` on each entity (JSONString per-host → array of permission strings). Used by manager core; nothing to change for this spec. |

No new manager-side schema work is required for v1 — see [Decision D-5](#decisions-and-defaults).

## Permission Model

Per-storage-host, each policy row (a domain / project / keypair resource policy)
holds a list of permission strings. The full set of 8 permissions, as defined
by `vfolder_host_permissions.vfolder_host_permission_list` (a backend-provided
list, but the canonical UI grouping is the one used by control-panel):

| Group | Permission key | Display (control-panel i18n) |
|---|---|---|
| Volume | `create-vfolder` | Create |
| Volume | `delete-vfolder` | Delete |
| Volume | `modify-vfolder` | Modify |
| Folder | `mount-in-session` | Mount |
| Folder | `download-file` | Download |
| Folder | `upload-file` | Upload |
| User Folder | `invite-others` | Invite |
| Project Folder | `set-user-specific-permission` | Set Permission |

> The webui implementation MUST source the **authoritative** permission list
> from the `vfolder_host_permissions` GraphQL query at render time and render
> a column for each returned key, falling back to the static grouping above
> only for the **label / category mapping**. This makes the UI forward-
> compatible if the backend adds new permission keys.

Per-storage-host storage shape on each policy is a JSON string of the form:

```json
{
  "<storage-host-name>": ["create-vfolder", "mount-in-session", ...],
  "<other-storage-host>": ["download-file", ...]
}
```

When updating, the webui implementation MUST preserve permissions for **other**
storage hosts on the same policy (i.e. only replace the entry for the current
host), matching the merge logic in
`StoragePermissionsPage.tsx#updateStorageHostPermission`.

## API Contract

All operations use the existing GraphQL schema. No new operations are required.

### Queries

#### `vfolder_host_permissions` (existing, schema line 13610)

Returns the authoritative list of valid permission strings.

```graphql
query StorageHostPermissionPanel_HostPermissionsQuery {
  vfolder_host_permissions {
    vfolder_host_permission_list
  }
}
```

Returns: `{ vfolder_host_permissions: { vfolder_host_permission_list: [String] } }`.

#### Fetch per-host permissions (existing fields)

Replaces the control-panel REST endpoint
`GET /api/storage-volume/get_permissions_related_policies/`. The same three
collections are fetched directly via GraphQL:

```graphql
query StorageHostPermissionPanel_PoliciesQuery {
  domains { name allowed_vfolder_hosts }
  groups { id name allowed_vfolder_hosts }
  keypair_resource_policies { name allowed_vfolder_hosts }
}
```

Each `allowed_vfolder_hosts` is a `JSONString` (per-host → permission array)
which the panel must `JSON.parse` and filter by the current storage host id.

> **Note**: control-panel currently issues this through a Django proxy because
> control-panel does not speak GraphQL directly. webui already uses Relay for
> manager GraphQL — issue these as native Relay queries. No proxy or REST
> intermediary is needed.

### Mutations

For each policy row whose permission set changed, issue **one** of the three
existing mutations (schema lines 10508, 10527, 10633):

```graphql
mutation ModifyDomainAllowedVfolderHostsMutation(
  $name: String!
  $props: ModifyDomainInput!
) {
  modify_domain(name: $name, props: $props) { ok msg }
}

mutation ModifyGroupAllowedVfolderHostsMutation(
  $gid: UUID!
  $props: ModifyGroupInput!
) {
  modify_group(gid: $gid, props: $props) { ok msg }
}

mutation ModifyKeypairResourcePolicyAllowedVfolderHostsMutation(
  $name: String!
  $props: ModifyKeyPairResourcePolicyInput!
) {
  modify_keypair_resource_policy(name: $name, props: $props) { ok msg }
}
```

The `props.allowed_vfolder_hosts` field is a `JSONString`. The implementer MUST:

1. Read the row's current `allowed_vfolder_hosts` (already in cache from the
   list query — no extra round-trip needed).
2. Merge: replace **only** the entry for the current storage host id, leave
   all other hosts' entries untouched.
3. `JSON.stringify` the merged object.
4. Send as `props.allowed_vfolder_hosts`.

> **No `NEW` operations are required.** All necessary GraphQL ops exist in
> `data/schema.graphql`.

### Backend compatibility

These mutations are stable manager APIs (not RBAC-gated additions). The feature
should work against any manager version that webui's manifest already supports;
no `@since` directive guard is needed.

## Requirements

### Must Have

#### Drawer skeleton

- [ ] Create `StorageHostDetailDrawer.tsx` mirroring `AgentDetailDrawer.tsx`:
  - Wraps `antd` `<Drawer>`, `size={800}` (matches `AgentDetailDrawer`; see [Decision D-2](#decisions-and-defaults)).
  - Header title: the storage host id (`record.id` from `storage_volume_list`).
  - `extra`: `BAIFetchKeyButton` that refetches both the storage volume query
    and the permission queries.
  - Body wrapped in `<Suspense fallback={<Skeleton active/>}/>`.
- [ ] Drawer body renders top section (`<StorageHostResourcePanel/>`) and
      bottom section (`<Tabs>` with two items).
- [ ] Tabs default active key = `capacity`. Tab keys: `capacity`, `permissions`.
- [ ] Tab labels are translated via i18n keys
      `storageHost.tab.CapacitySetting` and `storageHost.tab.Permissions`.

#### Open / close wiring

- [ ] `StorageProxyList.tsx` row action `key: 'settings'` opens the drawer
      (sets `drawerStorageHostId` state). Remove the
      `webuiNavigate('/storage-settings/${record.id}')` call.
- [ ] Drawer closes via header close button or backdrop (default antd Drawer
      behavior) — `onRequestClose` clears `drawerStorageHostId`.
- [ ] Closing the drawer does **not** navigate. Browser back button does not
      open or close the drawer (drawer state is not URL-synced for v1; see
      [Open Questions](#open-questions)).

#### Capacity Setting tab

- [ ] Tab body renders `<StorageHostSettingsPanel storageVolumeFrgmt={…}/>`
      with the same fragment input it receives today inside
      `StorageHostSettingPage`.
- [ ] The "quota not supported" fallback (currently the `<Card><Empty/></Card>`
      branch in `StorageHostSettingPage` lines 75–81) MUST also be rendered
      inside this tab — preserve the existing behavior.

#### Permissions tab

- [ ] Tab body renders `<StorageHostPermissionPanel storageHostId={…}/>`.
- [ ] Panel fetches the permission list and the three policy collections via
      Relay (see [API Contract](#api-contract)).
- [ ] Panel renders three sections (`Domains`, `Projects`, `Keypair Resource
      Policies`), each as a `BAITable` with:
  - One row per entity (rowKey = `name` for domains and keypair-resource-policies,
    `id` for groups, matching the control-panel rowKey logic).
  - One column per permission key returned by `vfolder_host_permissions`.
  - Each cell is a `<Checkbox>` reflecting whether that permission is granted
    for the current storage host.
  - A "Select All" / "Unselect All" toggle button per section, matching
    `StoragePermissionFormItems.tsx#handleSelectAll`.
- [ ] An "Update" button (rightmost in the section header area or panel header)
      saves all dirty rows by issuing the appropriate `modify_*` mutations.
  - Use `BAIButton` with `action` prop for the loading state.
- [ ] **Mount-in-session warning**: if any policy row has `mount-in-session`
      enabled while either `download-file` or `upload-file` is disabled, show
      a confirmation modal before saving with title
      `storageHost.permission.MountSessionWarningTitle` and content
      `storageHost.permission.MountSessionWarningContent`, OK = "Update",
      Cancel preserves edits. (This is a non-destructive confirmation —
      `App.useApp().modal.confirm` is appropriate, **not**
      `BAIConfirmModalWithInput` (see project rule
      `.claude/rules/destructive-confirmation.md` — saving permissions is
      reversible by editing again).)
- [ ] On successful save, show a `message.success` toast and refetch the
      permission queries.

#### Permission scope (v1)

- [ ] All three permission scopes from control-panel are ported in v1:
      **domains**, **groups (projects)**, **keypair_resource_policies**.
      See [Decision D-1](#decisions-and-defaults).
- [ ] Per-user resource policy and per-project resource policy `allowed_vfolder_hosts`
      management are **out of scope** for v1 (see [Out of Scope](#out-of-scope)).

#### Access control

- [ ] The Permissions tab is visible only to **superadmin**. For
      domain-admin and regular users, the Permissions tab is **not rendered**.
      The Capacity Setting tab visibility follows the existing
      `StorageHostSettingPage` behavior (no role gating change). See
      [Decision D-7](#decisions-and-defaults).
- [ ] Use `useCurrentUserRole()` from `react/src/hooks` to gate the tab.

#### Old standalone page removal

- [ ] Delete `react/src/pages/StorageHostSettingPage.tsx`.
- [ ] Remove the lazy import and route definition at
      `react/src/routes.tsx` lines 51–52 and 765–771.
- [ ] Remove the `storage-settings` branch in:
  - `react/src/components/MainLayout/WebUISider.tsx` lines 252–253
  - `react/src/hooks/useWebUIMenuItems.tsx` lines 785, 799
- [ ] Add a 404-friendly redirect from `/storage-settings/:hostname` to
      `/agent` (the Storage tab landing) so any external bookmarks land
      somewhere reasonable. (Implementation: replace the route entry with one
      that renders a `<Navigate to="/agent" replace />`.)

#### Internationalization

- [ ] All new strings have keys under `storageHost.permission.*` and
      `storageHost.tab.*` in `resources/i18n/en.json` and
      `resources/i18n/ko.json`.
- [ ] Other 20 locales receive English fallback values for now; targeted
      translations are out of scope for v1. See [Decision D-6](#decisions-and-defaults).
- [ ] i18n key naming follows the project's existing casing convention under
      `storageHost.*` (PascalCase leaf keys, e.g. `MountSessionWarningTitle`).

#### Code conventions

- [ ] All new `.tsx` files start with `'use memo'` per
      `.claude/rules/react-compiler-memoization.md`.
- [ ] Use `BAIFlex`, `BAITable`, `BAIButton`, `BAICard` (with
      `styles={{ body: { paddingTop: 0 } }}` when not using `tabList`) per
      `.claude/rules/use-bai-card.md`.
- [ ] If a `BAICard` is used with `tabList` for the inner Tabs, do **not**
      override `paddingTop` — keep the default. (Alternatively, use a bare
      `<Tabs>` inside `BAIFlex` as `AgentDetailDrawerContent.tsx` does — this
      is the recommended pattern here.)
- [ ] Drawer follows `Omit<DrawerProps, …>` props-extension pattern
      (`.claude/rules/component-props-extension.md`).
- [ ] No `useMemo` / `useCallback` introduced in new code.
- [ ] No `console.log` — use `useBAILogger`.
- [ ] Use `useEffectEvent` instead of stale-closure `useEffect`s where
      applicable.

### Nice to Have

- [ ] Optimistic UI on the Permissions tab save (toggle in cache before
      mutation resolves). Skip if it complicates the merge logic.
- [ ] Sticky "Update" button at the bottom of the Permissions tab when the
      list scrolls.
- [ ] Visual diff indicator (e.g. badge on the section header) showing how
      many rows have unsaved changes.

## User Stories

- **As a superadmin**, I want to manage which domains / projects /
  keypair-resource-policies can perform which folder operations on a given
  storage host, **so that** I can enforce storage access policy without
  switching to control-panel.
- **As a superadmin**, I want the capacity (quota) settings and the permission
  settings for a storage host to be reachable from the same gear icon, **so that**
  I do not need to remember two different navigation paths.
- **As a domain admin**, I want to continue managing quotas via the gear icon
  exactly as before; I do not need to see or use the Permissions tab.
- **As any user with access to the Storage tab**, I want the gear icon to open
  a drawer instead of navigating to a separate page, **so that** I keep my
  context (the storage list) on screen.

## Acceptance Criteria

UI behavior:

- [ ] Clicking the gear icon on any storage row opens `StorageHostDetailDrawer`
      with the storage host id rendered as the drawer title.
- [ ] The drawer body shows `StorageHostResourcePanel` (Endpoint / Backend /
      Capabilities / Usage) as a top section.
- [ ] The drawer body shows a `Tabs` with two tabs: "Capacity Setting"
      (default active) and "Permissions" (superadmin only).
- [ ] The Capacity Setting tab renders the existing `StorageHostSettingsPanel`
      with identical behavior to the pre-migration full-page version,
      including the "quota not supported" `Empty` fallback.
- [ ] For storage backends that don't support quota, the Capacity Setting tab
      shows the existing "This storage backend does not support quota." message.
- [ ] The Permissions tab renders three sections (`Domains`, `Projects`,
      `Keypair Resource Policies`), each as a checkbox matrix.
- [ ] Each section has a "Select All / Unselect All" toggle.
- [ ] The "Update" button is disabled while permissions are still loading.
- [ ] Saving permissions calls the correct GraphQL mutations
      (`modify_domain` / `modify_group` / `modify_keypair_resource_policy`)
      with the `JSONString` payload preserving permissions for other storage
      hosts.
- [ ] A round-trip save (toggle a permission, click Update, success toast,
      reopen drawer) reflects the saved value.
- [ ] If saving would enable `mount-in-session` without both `download-file`
      and `upload-file`, a confirmation modal appears before the network
      request fires. Cancel preserves the in-form edits without saving;
      OK proceeds with the save.
- [ ] On save success, the user sees a `message.success` toast and the
      permission queries refetch automatically.
- [ ] On save failure, the user sees a `message.error` toast with the
      backend error message.

Migration / removal:

- [ ] `react/src/pages/StorageHostSettingPage.tsx` is deleted.
- [ ] `/storage-settings/:hostname` no longer renders the old full-page
      settings; visiting it redirects to `/agent`.
- [ ] Sidebar selection logic (`WebUISider.tsx`) and menu logic
      (`useWebUIMenuItems.tsx`) no longer special-case the
      `storage-settings` path segment.
- [ ] `StorageProxyList.tsx` row action `key: 'settings'` no longer calls
      `webuiNavigate`.

Role gating:

- [ ] A non-superadmin (domain-admin or user) opening the drawer sees only
      the Capacity Setting tab; the Permissions tab is not rendered for them.
- [ ] A superadmin sees both tabs.

i18n:

- [ ] All new visible strings have keys present in both
      `resources/i18n/en.json` and `resources/i18n/ko.json`.
- [ ] The keys follow the existing `storageHost.*` naming pattern.
- [ ] Korean translations are reviewed for the formal polite style (합니다체)
      consistent with the rest of `ko.json`.

Code quality:

- [ ] `bash scripts/verify.sh` ends with `=== ALL PASS ===`.
- [ ] No new ESLint `react-hooks/exhaustive-deps` disables.
- [ ] No new `useMemo` / `useCallback` calls in the added files.
- [ ] All new `.tsx` files start with `'use memo'`.
- [ ] Generated Relay artifacts under `react/src/__generated__/` are
      committed for the new queries / fragments / mutations.

## Out of Scope

- **Per-user-resource-policy and per-project-resource-policy `allowed_vfolder_hosts`
  management** — control-panel's UI only covers domain / project (group) /
  keypair-resource-policy, and v1 matches that surface. See [Decision D-1](#decisions-and-defaults).
- **Adding / removing / editing the domains, projects, or keypair resource
  policies themselves** — those CRUD flows live in their own dedicated pages
  (`DomainList`, `KeypairResourcePolicyList`, etc.). The Permissions tab only
  toggles their `allowed_vfolder_hosts` for the current storage host.
- **URL-syncing drawer open / active-tab state** — v1 uses local React state
  only. No deep linking to "open storage X drawer, permissions tab".
- **Localization for the 20 non-en/non-ko locales** — those will inherit
  English fallback strings until a follow-up translation pass.
- **Backend mutation changes** — all writes use existing `modify_domain` /
  `modify_group` / `modify_keypair_resource_policy` mutations. No new manager
  or storage-proxy code.
- **Mobile / narrow-viewport-specific drawer layout** — match the existing
  `AgentDetailDrawer` `size={800}` behavior; responsive tweaks are not in
  scope.
- **Audit log entry for permission changes** — out of scope; the backend may
  emit audit events independently but the webui does not surface them.
- **Replacing the legacy "Info" event-based panel** (`backend-ai-selected-storage-proxy`)
  — that pre-existing flow is unrelated and stays as is.

## Decisions and Defaults

These decisions were made by the spec author under Auto Mode based on the
control-panel reference implementation and webui conventions. Flag any item
that needs human re-confirmation.

| ID | Topic | Decision | Rationale |
|---|---|---|---|
| **D-1** | Permission scope in v1 | Port all three scopes that control-panel covers: `domains`, `groups` (projects), `keypair_resource_policies`. **Do not** add user-resource-policy or project-resource-policy `allowed_vfolder_hosts` (those are not in control-panel's UI today). | Match control-panel parity; do not expand surface. |
| **D-2** | Drawer width | `size={800}`, matching `AgentDetailDrawer`. | Largest existing detail drawer in the codebase; matrix-style permission tables benefit from width. |
| **D-3** | Standalone Storage Setting page | **Remove** `StorageHostSettingPage.tsx` and replace the route with a redirect to `/agent`. The drawer is the only entry point post-migration. | Avoid dual-maintenance; user request was to absorb the page into the drawer. |
| **D-4** | Permission tab CRUD | Full CRUD per row (toggle each permission cell, then "Update" saves all dirty rows). Same column set as control-panel (8 keys × 3 policy types). | Direct port of control-panel; preserves operator workflow. |
| **D-5** | New backend ops needed? | **No.** `modify_domain`, `modify_group`, `modify_keypair_resource_policy`, `vfolder_host_permissions`, and the three list queries (`domains`, `groups`, `keypair_resource_policies`) all exist in `data/schema.graphql`. webui issues these as native Relay queries / mutations — no Django REST proxy intermediary as in control-panel. | Schema verified at `data/schema.graphql` lines 10508 / 10527 / 10633 / 13610 / 12103. |
| **D-6** | i18n languages in v1 | English (`en.json`) + Korean (`ko.json`). Other 20 locales get English-fallback values until a follow-up translation pass. | Matches the project's prevailing pattern for new features. |
| **D-7** | Permission tab access | Superadmin only. Domain-admin and regular users see only the Capacity Setting tab. | `allowed_vfolder_hosts` is a system-level policy assignment; domain-admins do not have authority to grant permissions across other domains' policies, and the underlying mutations are superadmin-gated server-side anyway. Hiding the tab avoids 403-surfacing UX. |

## Open Questions

These should be answered before or during implementation:

1. **Drawer URL state** — should the drawer be deep-linkable (e.g.
   `?storage-host=…&tab=permissions`)? v1 says no, but if operators expect to
   share links to a specific host's permissions, this becomes useful. Confirm
   with PO whether to bake it in now via `useSearchParams` or defer.
2. **Bulk vs. per-row mutations** — control-panel sends a single hand-built
   multi-mutation GraphQL string (see `views.py#update_permissions_related_policies`).
   With Relay we will issue **N separate mutations** (one per dirty row). Is
   this acceptable, or do we need a true batch mutation for atomicity? (If
   the latter, we'd need a `NEW` backend mutation — currently scoped out by
   [D-5](#decisions-and-defaults).)
3. **"Info" gear-icon flow** — the storage row currently has two actions:
   "Info" (event-based, opens a legacy panel via
   `backend-ai-selected-storage-proxy`) and "Settings" (this drawer). Should
   the legacy "Info" panel be absorbed into the drawer too (perhaps as a
   third "Diagnostics" tab using `StorageProxyDiagnosticsSection`)? Out of
   scope for v1 unless the PO says otherwise.
4. **Refetch policy** — should the storage-list query (`StorageProxyListQuery`)
   refetch automatically after a permission change? Permissions don't affect
   the list columns (id / backend / usage / capabilities), so refetching is
   probably unnecessary, but `useFetchKey` is already wired on the list.

## Related Issues

- **FR-2969** (Epic): Migrate storage host permission management from Control
  Panel to WebUI — this spec's Epic.

## Implementation Notes (for the dev-planner / coding agent)

These are non-binding hints, but they save investigation time.

- The drawer's `useLazyLoadQuery` for `storage_volume` should be lifted into
  the drawer **content** component (mirroring `AgentDetailDrawerContent`)
  rather than the outer drawer, so Suspense fallback only shows when the
  drawer is actually open and the content is loading.
- The three policy queries on the Permissions tab are unrelated to the
  `storage_volume` query — keep them in a sibling query inside
  `StorageHostPermissionPanel` so that switching tabs doesn't refetch the
  resource panel.
- When the implementer writes the mutation merge logic, the exact behavior to
  match is:
  ```ts
  // Existing on the row (parsed JSONString):
  const existing = JSON.parse(row.allowed_vfolder_hosts || '{}');
  // Merge: replace ONLY the current host, keep others verbatim.
  const merged = { ...existing, [storageHostId]: enabledPermissions };
  // Send:
  props.allowed_vfolder_hosts = JSON.stringify(merged);
  ```
  This matches `StoragePermissionsPage.tsx` lines 100–112.
- The control-panel implementation parses `allowed_vfolder_hosts` defensively
  (it might already be an object or a string). In webui, the GraphQL schema
  types it as `JSONString` (always a string from the wire), so a single
  `JSON.parse` with a `try/catch` defaulting to `{}` is sufficient.
- Reuse `StorageHostFilterInput` and `StorageHostFetchErrorBoundary` from
  `react/src/components/` if any storage-host-name UI is needed inside the
  panel; they already exist and follow project conventions.
- The drawer mounting site (in `StorageProxyList`) should follow the same
  pattern as `AgentList` mounts `AgentDetailDrawer` — keep the drawer in
  the list component so closing the drawer doesn't unmount the list.
