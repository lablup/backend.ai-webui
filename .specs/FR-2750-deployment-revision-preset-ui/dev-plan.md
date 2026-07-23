# Deployment Preset Management UI Dev Plan

## Spec Reference
`.specs/FR-2750-deployment-revision-preset-ui/spec.md`

## Epic: FR-2750

## Overview

Three tasks, grouped by functional area. Task 1 and Task 2 are parallel-friendly once the Relay schema is clear (both depend on generated types but can be developed simultaneously). Task 3 depends on Task 2 because it reuses `DeploymentPresetDetailContent`.

- **Task 1 — Admin tab + List page** (1차 마일스톤 core): Relay scaffolding + list table + tab wiring
- **Task 2 — Admin create/edit/delete modal** (1차 마일스톤 core): full form, delete confirmation, extracted detail content
- **Task 3 — User-facing selector detail** (2차 마일스톤): ⓘ button in launcher + read-only modal

## Naming & Pattern Conventions

- **Table components**: Name them `AdminDeploymentPresetTable` (i.e. `OOOTable` not `OOONodes`). May be kept as an inner component inside the page file if it is not reused elsewhere.
- **customizeColumns pattern**: Follow `BAIUserNodes` pattern — base columns defined inside the component, `customizeColumns` prop for consumer overrides, `BAINameActionCell` with customizable action options.
- **No unnecessary modal/content splitting**: Do NOT split a modal into `SettingModal` + `SettingModalContent` unless the content is genuinely reused elsewhere. Keep form logic inside the modal file. The one legitimate split is `DeploymentPresetDetailContent`, which IS reused by both the admin delete-confirm preview and the user-facing read-only modal.

## Sub-tasks (Implementation Order)

---

### Task 1: Admin tab + List page

**Was**: sub-tasks 1 + 2 + 3

**Changed files**:
- `react/src/__generated__/` (auto-generated, tracked)
- `react/src/pages/AdminDeploymentPresetListPage.tsx` (new — contains both the list query and the `AdminDeploymentPresetTable` inner component)
- `react/src/pages/AdminServingPage.tsx` (tab wiring)
- `resources/i18n/en.json` (all 21 locale files under `resources/i18n/` — add keys to `en.json` first, then run `fw:i18n-translator` skill to auto-translate remaining locales) (`adminDeploymentPreset.*` namespace, tab title)

**Dependencies**: None (Relay scaffolding is included here)

**Review complexity**: Medium

**Description**:

1. **Relay scaffolding** — Define in the colocated component file (or a shared fragment file):
   - List query: `deploymentRevisionPresets` connection with fields `name`, `description`, `runtimeVariantId`, `rank`, `cluster`, `resource`, `execution`, `deploymentDefaults`, `modelDefinition`, `presetValues`, `createdAt`, `updatedAt`, `runtimeVariant { id, name }`, `resourceSlots`.
   - Three mutations: `adminCreateDeploymentRevisionPreset`, `adminUpdateDeploymentRevisionPreset`, `adminDeleteDeploymentRevisionPreset` — matching `CreateDeploymentRevisionPresetInput` / `UpdateDeploymentRevisionPresetInput` from `data/schema.graphql`.
   - Fragment `DeploymentRevisionPresetDetailFragment` — covers all fields needed by both the admin list and the user-facing read-only modal (used in Task 3).
   - Run `pnpm run relay` to materialize types under `react/src/__generated__/`.

2. **AdminDeploymentPresetListPage** — Mirror `AdminModelCardListPage.tsx` structure:
   - `useLazyLoadQuery` + `BAITable` + `BAIGraphQLPropertyFilter` + `BAIFetchKeyButton` + `useBAIPaginationOptionStateOnSearchParam` + `useBAISettingUserState('table_column_overrides.AdminDeploymentPresetListPage')`.
   - **Inner component naming**: `AdminDeploymentPresetTable` (not `DeploymentPresetNodes`).
   - **customizeColumns**: follow `BAIUserNodes` pattern — base columns defined in `AdminDeploymentPresetTable`, `customizeColumns` prop for consumer overrides.
   - Columns: Name (fixed-left, `BAINameActionCell` with Edit/Delete action options), Description, Runtime (`runtimeVariant.name`), Image (from `execution`), Cluster (mode × size), Replicas (default), Strategy, Rank, Created at.
   - Defaults hidden: Description, Cluster, Strategy, Rank.
   - Filter properties: `name` (string contains), `runtimeVariantId` (UUID).
   - Sortable: `name`, `rank`, `createdAt` → `DeploymentRevisionPresetOrderField`.
   - The page component is mounted as a tab body (not a route).

3. **Tab wiring in AdminServingPage**:
   - `React.lazy(() => import('./AdminDeploymentPresetListPage'))`.
   - Gate on `isSuperAdmin && baiClient.supports('deployment-preset')`. Tab key: `deployment-presets`.
   - Fallback to `serving` tab when the user lacks access (plain effect on primitives is fine).
   - Wrap in `BAIErrorBoundary` + `Suspense fallback={<Skeleton active />}` matching the existing `model-store` branch pattern.

---

### Task 2: Admin create/edit/delete modal

**Was**: sub-tasks 4 + 5

**Changed files**:
- `react/src/components/AdminDeploymentPresetSettingModal.tsx` (new)
- `react/src/components/DeploymentPresetDetailContent.tsx` (new — pure read-only summary, no Modal chrome)
- `react/src/pages/AdminDeploymentPresetListPage.tsx` (wire create/edit/delete triggers)
- `resources/i18n/en.json` (all 21 locale files under `resources/i18n/` — add keys to `en.json` first, then run `fw:i18n-translator` skill to auto-translate remaining locales) (form labels, section titles, placeholders, required-field errors, delete-confirm copy, summary section labels)

**Dependencies**: Task 1 (list page and Relay types exist)

**Review complexity**: High (largest single piece; covers all form fields, two mutation paths, delete flow)

**Description**:

1. **AdminDeploymentPresetSettingModal** — `BAIModal` + Ant `Form`. Keep all form logic inside this file (do NOT split into SettingModal + SettingModalContent).
   - Sections per the spec:
     1. **Basic info**: `name` (required), `description`, `runtimeVariantId` (required, Select from `runtimeVariants` query — reuse existing dropdown from `ServiceLauncherPageContent` runtime selector if applicable), `imageId` (required — reuse `ImageEnvironmentSelectFormItems` which already queries `image.id` UUID; pass `values.environments.image?.id` as `imageId` on submit).
     2. **Cluster**: `clusterMode` (single-node / multi-node), `clusterSize`.
     3. **Resources**: `resourceSlots`, `resourceOpts` (reuse session/service launcher patterns if applicable; compact JSON textarea with parse validation otherwise).
     4. **Execution**: `startupCommand`, `bootstrapScript`, `environ`, `presetValues`.
     5. **Deployment defaults**: `openToPublic`, `replicaCount`, `revisionHistoryLimit`, `deploymentStrategy`.
     6. **Advanced**: `modelDefinition`.
     7. **Edit-only**: `rank`.
   - Create vs. Update mode determined by whether a `presetId` prop is passed. `runtimeVariantId` and `imageId` are not in `UpdateDeploymentRevisionPresetInput` — render as read-only display in edit mode.
   - Apply `'use memo'`, plain handlers (no `useCallback`), antd v6 prop names.
   - `BAIButton` `action` prop on Save for automatic loading state.

2. **Delete with typed confirmation** (wired in `AdminDeploymentPresetListPage`):
   - `BAIConfirmModalWithInput` (per `destructive-confirmation.md`). `confirmText` = preset name; OK disabled until typed.
   - On success: `commitDeleteMutation` + `updateFetchKey()`. On rejection: surface server error message verbatim; defer cascade UX to follow-up.
   - Show `DeploymentPresetDetailContent` inside the confirm modal as a preview of what will be deleted.

3. **DeploymentPresetDetailContent** (the one legitimate split):
   - Pure read-only component. Takes a Relay fragment ref (`DeploymentRevisionPresetDetailFragment`).
   - Renders: name, description, rank, runtime, image, cluster, resource block (CPU / memory / GPU / shmem from `resourceSlots`), deployment defaults (replicas, limit, strategy, public).
   - No buttons, no edit affordance. Reused in Task 3's read-only modal.

---

### Task 3: User-facing selector detail

**Was**: sub-tasks 6 + 7

**Changed files**:
- `react/src/components/ServiceLauncherPageContent.tsx` (⓪ Select + ⓘ button + modal mount)
- `react/src/components/DeploymentPresetDetailModal.tsx` (new — thin `BAIModal` wrapper)
- `resources/i18n/en.json` (all 21 locale files under `resources/i18n/` — add keys to `en.json` first, then run `fw:i18n-translator` skill to auto-translate remaining locales) (`modelService.DeploymentPreset`, tooltip text, modal title, close button)

**Dependencies**: Task 2 (`DeploymentPresetDetailContent` must exist)

**Review complexity**: Medium (touches a long/complex form file; the addition is read-only and does not wire preset values into the deployment payload — explicitly out of scope)

**Description**:

1. **ⓘ button in ServiceLauncherPageContent**:
   - Locate the form area near the existing `runtimeVariant` Form.Item.
   - Add a `Form.Item` (or wrapper) with a `Space.Compact` containing: a `Select` of presets (sourced via `availablePresets` connection, scoped by `runtimeVariant` if needed) + a `Button` with info icon (`InfoIcon` from lucide or `<InfoCircleOutlined />`).
   - `Button` disabled when no preset selected. On click: open `DeploymentPresetDetailModal`.
   - Gate the entire row behind `baiClient.supports('deployment-preset')`.
   - Pattern reference: `VFolderSelect.tsx` (Select + `Space.Compact` button row).
   - **Out of scope**: applying chosen preset values to form state. Selector is display/inspect only.

2. **DeploymentPresetDetailModal**:
   - `BAIModal` with `footer={null}` (or single Close button), title = preset name.
   - Body = `DeploymentPresetDetailContent` from Task 2.
   - Loads selected preset by id via `useLazyLoadQuery` for `deploymentRevisionPreset(id: $id)` so it works even when Select options are paginated/truncated. Wrap in `Suspense` with skeleton fallback.
   - No Edit, no Delete, no destructive actions.

---

## Dependency Graph

```
Task 1 (Relay + List + Tab)  ──────────────────────► Task 2 (Modals + DetailContent)
         │                                                      │
         │                                                      │
         └─────────────────── parallel-friendly ───────────────┘
                                                                │
                                                                ▼
                                                    Task 3 (Selector + Read-only Modal)
```

- Task 1 and Task 2 are **parallel-friendly** once the schema/fragment shape is agreed upon.
- Task 3 **cannot start** until `DeploymentPresetDetailContent` (Task 2) is available.

Jira `blocks` links:
- Task 1 blocks Task 2 (generated types needed)
- Task 2 blocks Task 3 (DeploymentPresetDetailContent)

---

## Risks and Open Questions

1. **Runtime variant source query**: Sub-task 2 needs a Select source for `runtimeVariantId`. Plan: reuse the existing runtime selector from `ServiceLauncherPageContent` (lines ~1639–1677) if it wraps `runtimeVariants` with the same shape; otherwise use `runtimeVariants(filter: ..., limit: 100)` from `data/schema.graphql:13827`.
2. **Delete-while-in-use behavior**: Until backend semantics are confirmed (cascade vs. reject), surface the server error message as-is. Worth a Jira comment on FR-2750 once verified.
3. **`modelRuntimeConfig` / `modelMountConfig` / `extraMounts`**: explicitly out of scope per spec. Do not add form fields.
4. **Capability key `deployment-preset`**: confirmed for backend 26.4.2+ per spec. Task 1 (tab) and Task 3 (selector row) must gate on `baiClient.supports('deployment-preset')`.
5. **Preset application is out of scope**: Task 3 only adds the selector and ⓘ button. Applying preset values to form state is a follow-up belonging to a separate spec (the spec lists this as a non-goal).

---

## Estimated Effort

| Task | Complexity | Estimate |
|------|-----------|----------|
| Task 1: Admin tab + List page | Medium | 1.5 days |
| Task 2: Admin create/edit/delete modal | High | 2–2.5 days |
| Task 3: User-facing selector detail | Medium | 1 day |

**Total**: ~4.5–5 days. Task 1 and Task 2 can run in parallel, compressing wall-clock time to ~3 days if two engineers work simultaneously.

---

## Jira Sub-tasks

| Task | Jira Key | URL |
|------|----------|-----|
| Task 1: Add Deployment Preset admin tab and list page | FR-2760 | https://lablup.atlassian.net/browse/FR-2760 |
| Task 2: Add Deployment Preset create/edit/delete modal | FR-2761 | https://lablup.atlassian.net/browse/FR-2761 |
| Task 3: Add Deployment Preset detail view in service launcher | FR-2762 | https://lablup.atlassian.net/browse/FR-2762 |

Links:
- FR-2760 blocks FR-2761
- FR-2761 blocks FR-2762
- All tasks relate to FR-2750
