# Prometheus Query Preset Admin (FR-2451) Dev Plan

## Spec Reference

- Spec: `/Users/sujinkim/lablup/webui2/.specs/draft-auto-scaling-rule-management/spec.md` (Korean source; this dev plan and all sub-task issues are written in English)
- Jira: FR-2451 — "Adding Prometheus Query Preset CRUD page (admin)"
- GitHub Issue: lablup/backend.ai-webui#6357
- Spec PR (open): lablup/backend.ai-webui#6356
- Mode: flat Sub-task (no `metadata.json` present)

## Scope Summary (English)

Add a new "Auto Scaling Rule" tab to `AdminServingPage` that provides full CRUD for **Prometheus Query Presets** (`QueryDefinition` GraphQL type). The existing endpoint list becomes the "Serving" tab; the new tab is super-admin-gated and contains a paginated, filterable list with Create / Edit (with a live "Current value" preview) / Delete flows. Out of scope: rule editor changes inside the service detail page, and Prometheus Query Preset **Category** CRUD (categories are consumed read-only via dropdown).

## Architectural Notes (informs sub-task cuts)

- `AdminServingPage.tsx` already uses `BAICard` with `tabList` + `nuqs`-based `tab` query parameter. There is currently a `serving` tab and a super-admin-only `model-store` tab. Adding `auto-scaling-rule` is a small, additive change to the `tabList` + the lazy-rendered branch in the body — no scaffolding work is needed.
- Follow the **fragment architecture**: a query orchestrator (`useLazyLoadQuery`) at the tab content level + a list/table component that uses `useFragment`. Mirror the structure of `ResourcePresetList.tsx` (fetchKey-driven refresh, `useTransition`, `BAITable`, `BAINameActionCell`).
- The Edit modal's "Current value" preview must reuse the `PreviewValue` / `PrometheusPresetPreview` components currently embedded in `AutoScalingRuleEditorModal.tsx`. Extracting them into a shared component avoids duplication and keeps both consumers in sync.
- `prometheusQueryPresetResult(id, options: { filterLabels: [], groupLabels: [] })` requires a saved preset id, so preview is **edit-only** (per spec).
- Destructive deletion → must use `BAIConfirmModalWithInput` per `.claude/rules/destructive-confirmation.md`. Confirmation string should be the preset's `name`.
- Form is largely identical between Create and Edit (same fields, same validation). Build a single `PrometheusQueryPresetEditorModal` driven by an optional fragment ref; the create path passes `null` and the edit path passes the row's fragment.
- `i18n`: add new keys under a `prometheusQueryPreset.*` namespace in `resources/i18n/en.json` (and `packages/backend.ai-ui/src/locale/en.json` if shared components are added there). Other locales fill in later; English is source.
- Antd 6 conventions: use v6 prop names (e.g., no `Alert.message` — use `title`).
- Use `'use memo'` directive on every new component.
- Run `bash scripts/verify.sh` before pushing each PR.

## Sub-tasks (Implementation Order)

The work splits into 5 dependency-ordered sub-tasks plus one optional polish task. Each sub-task is independently mergeable: at every cut point the app still compiles, the existing Serving tab keeps working, and what has shipped delivers a coherent slice (e.g., after Sub-task 2 the tab is readable but read-only; after Sub-task 3 admins can create but not yet edit/delete; etc.).

### 1. Add "Auto Scaling Rule" tab scaffolding

- **Title**: `feat(FR-2451): add Auto Scaling Rule tab scaffolding to AdminServingPage`
- **Branch**: `feature/fr-2451-tab-scaffolding`
- **Description**:
  - Extend `AdminServingPage`'s `tabList` with a new `auto-scaling-rule` entry, gated behind `isSuperAdmin` (matching the existing `model-store` gating pattern).
  - Render a placeholder `AutoScalingRulePresetTab` component inside the lazy `Suspense` switch when `queryParam.tab === 'auto-scaling-rule'`. The component renders an empty `BAIFlex` with a `Skeleton` or "Coming soon" placeholder.
  - Confirm `nuqs` URL state already persists tab selection (it does); no change needed there. Verify browser back/forward works.
  - Add i18n keys: `webui.menu.AutoScalingRule` (or reuse if it exists) and any tab label key needed.
- **Changed files**:
  - `react/src/pages/AdminServingPage.tsx`
  - `react/src/components/AutoScalingRulePresetTab.tsx` (new, placeholder)
  - `resources/i18n/en.json`
- **Dependencies**: None
- **Review complexity**: Low (mechanical wiring of an existing tab pattern + i18n string)

### 2. Implement Prometheus Query Preset list (Read + filter + pagination)

- **Title**: `feat(FR-2451): implement Prometheus Query Preset list table`
- **Branch**: `feature/fr-2451-preset-list`
- **Description**:
  - Replace the placeholder `AutoScalingRulePresetTab` body with a real query orchestrator that runs `prometheusQueryPresets(filter, orderBy, limit, offset)` via `useLazyLoadQuery`.
  - Render results in a `BAITable` with columns: `name`, `metricName`, `queryTemplate` (truncated with tooltip showing full PromQL), `timeWindow`, `createdAt`, `updatedAt`. Use existing date formatting helpers.
  - Add `BAIPropertyFilter` for the `name` field (the only filter the schema currently exposes — `QueryDefinitionFilter`). Wire filter + offset/limit pagination through `useBAIPaginationOptionStateOnSearchParamLegacy` and `useQueryStates` (mirror `ServingTabContent`).
  - Add a `BAIFetchKeyButton` reload control + transition-driven loading state.
  - Add a disabled "Add Preset" toolbar button (real handler comes in Sub-task 3) so the toolbar layout is finalized once.
  - Use a Relay fragment for each row (`PrometheusQueryPresetRowFragment`) with the fields needed for both display and the (later) Edit modal.
  - Add i18n keys: `prometheusQueryPreset.Name`, `prometheusQueryPreset.MetricName`, `prometheusQueryPreset.QueryTemplate`, `prometheusQueryPreset.TimeWindow`, `prometheusQueryPreset.CreatedAt`, `prometheusQueryPreset.UpdatedAt`, `prometheusQueryPreset.AddPreset`, etc.
- **Changed files**:
  - `react/src/components/AutoScalingRulePresetTab.tsx`
  - `react/src/components/PrometheusQueryPresetList.tsx` (new — the table + fragment)
  - `resources/i18n/en.json`
- **Dependencies**: Sub-task 1 (blocks)
- **Review complexity**: Medium (new Relay query + fragment wiring + filter/pagination, but follows established patterns)

### 3. Implement Create Preset modal

- **Title**: `feat(FR-2451): add Prometheus Query Preset create modal`
- **Branch**: `feature/fr-2451-create-modal`
- **Description**:
  - Create `PrometheusQueryPresetEditorModal.tsx` as a unified Create/Edit modal. This sub-task wires up the **create** path; Sub-task 4 adds the edit path on top.
  - Form fields (Antd `Form`, `layout="vertical"`):
    - `name` (required, unique — validation hint via `extra` text)
    - `description` (optional)
    - `categoryId` (optional, `Select` driven by a sibling `prometheusQueryPresetCategories` query — read-only consumption; no category CRUD this PR)
    - `rank` (optional, `InputNumber`, default `0`)
    - `metricName` (required)
    - `queryTemplate` (required, multi-line `Input.TextArea`; tooltip mentioning `{labels}`, `{window}`, `{group_by}` placeholders is deferred to the optional polish task)
    - `timeWindow` (optional, plain `Input` — string like `5m`)
    - `options.filterLabels` (multi-input — `Select mode="tags"` accepting empty array)
    - `options.groupLabels` (multi-input — same pattern)
  - Wire `adminCreatePrometheusQueryPreset(input: CreateQueryDefinitionInput!)` via `useMutation`. On success: success toast, refetch list (via `updateFetchKey` passed in from list), close modal. On error: keep modal open and show field/global error. Use the `BAIButton` `action` prop or modal's `confirmLoading` for inflight UI.
  - Hook the disabled toolbar button from Sub-task 2 to open the modal in create mode.
  - Add i18n keys for every label, placeholder, and validation message.
- **Changed files**:
  - `react/src/components/PrometheusQueryPresetEditorModal.tsx` (new)
  - `react/src/components/PrometheusQueryPresetList.tsx` (toolbar wiring)
  - `resources/i18n/en.json`
- **Dependencies**: Sub-task 2 (blocks — needs the list to mount the modal and refetch after success)
- **Review complexity**: High (new mutation, novel form validation, `options` shape, success/error flow, refetch coordination)

### 4. Implement Edit Preset modal with "Current value" preview

- **Title**: `feat(FR-2451): add Prometheus Query Preset edit modal with live preview`
- **Branch**: `feature/fr-2451-edit-modal`
- **Description**:
  - Extend `PrometheusQueryPresetEditorModal` to accept an optional fragment ref (`PrometheusQueryPresetEditorModalFragment$key`). When supplied, the modal:
    - Pre-fills the form via `getInitialValues(rowFragment)`.
    - Renders the **`PrometheusPresetPreview`** block above the form (or under `queryTemplate`), showing "Current value:" + computed result + refresh button.
    - Calls `adminModifyPrometheusQueryPreset(id, input)` with **only the changed fields** (compute diff from initial values to satisfy the partial-update contract of `ModifyQueryDefinitionInput`).
  - **Extract `PreviewValue` and `PrometheusPresetPreview`** out of `AutoScalingRuleEditorModal.tsx` into a new shared component file (`react/src/components/PrometheusPresetPreview.tsx`) and update `AutoScalingRuleEditorModal` to import from there. The component remains identical in behaviour; this is a pure move + import update so reviewers can verify it's a refactor, not a rewrite. Confirm the `prometheusQueryPresetResult` query is still co-located inside the extracted module.
  - Wire the "Edit" action in `BAINameActionCell` (or a `Tooltip` + icon button per the table's existing action-column convention) on each row to open the modal in edit mode with the row's fragment.
  - Add i18n keys for the edit-mode title, success message, and any new copy.
- **Changed files**:
  - `react/src/components/PrometheusQueryPresetEditorModal.tsx`
  - `react/src/components/PrometheusPresetPreview.tsx` (new, extracted)
  - `react/src/components/AutoScalingRuleEditorModal.tsx` (replace inline preview components with import)
  - `react/src/components/PrometheusQueryPresetList.tsx` (row edit action)
  - `resources/i18n/en.json`
- **Dependencies**: Sub-task 2 (blocks — needs row fragment), Sub-task 3 (blocks — extends the same modal/form and reuses validation; merging in this order avoids large refactor conflicts)
- **Review complexity**: High (mutation diffing, preview extraction touches an existing modal, suspense boundary placement for preview)

### 5. Implement Delete Preset flow

- **Title**: `feat(FR-2451): add Prometheus Query Preset delete confirmation`
- **Branch**: `feature/fr-2451-delete`
- **Description**:
  - Add a destructive "Delete" action on each row (icon button — `DeleteOutlined`) that opens a `BAIConfirmModalWithInput` requiring the user to type the preset's `name`. (Per `.claude/rules/destructive-confirmation.md` — never `Popconfirm` for permanent deletion.)
  - On confirm, call `adminDeletePrometheusQueryPreset(id: ID!)` via `useMutation`. On success: success toast + `updateFetchKey()` to refetch list. On error: error toast, modal stays open.
  - i18n: `prometheusQueryPreset.PermanentlyDeletePreset`, `prometheusQueryPreset.DeleteWarning`, `prometheusQueryPreset.SuccessfullyDeleted`.
- **Changed files**:
  - `react/src/components/PrometheusQueryPresetList.tsx`
  - `resources/i18n/en.json`
- **Dependencies**: Sub-task 2 (blocks — needs the list/row infrastructure)
- **Review complexity**: Medium (new mutation + destructive UX, but pattern is well established)

### 6. (Optional) Polish: sorting, placeholder tooltips, copy hardening

- **Title**: `feat(FR-2451): polish Prometheus Query Preset admin UX`
- **Branch**: `feature/fr-2451-polish`
- **Description**:
  - Add column sorting via `QueryDefinitionOrderBy` (NAME / CREATED_AT / UPDATED_AT). Wire through `order` in `useQueryStates` similar to `ServingTabContent`.
  - Add a `Tooltip` / `extra` guide text on the `queryTemplate` field listing `{labels}`, `{window}`, `{group_by}` placeholders with one-line descriptions and a link to the seed presets reference (or render the same hint as collapsible `<Form.Item extra>`).
  - i18n sweep: confirm all new keys exist, no hardcoded English strings remain, key naming follows the project convention.
- **Changed files**:
  - `react/src/components/PrometheusQueryPresetList.tsx`
  - `react/src/components/PrometheusQueryPresetEditorModal.tsx`
  - `resources/i18n/en.json`
- **Dependencies**: Sub-tasks 2, 3, 4 (blocks — touches the list and editor modal)
- **Review complexity**: Low (cosmetic; sorting is a small additive change)

## Dependency Graph

```
SUBTASK-1 (tab scaffolding)
    │
    └──blocks──> SUBTASK-2 (preset list)
                     │
                     ├──blocks──> SUBTASK-3 (create modal)
                     │                │
                     │                └──blocks──> SUBTASK-4 (edit modal + preview)
                     │
                     ├──blocks──> SUBTASK-5 (delete flow)
                     │
                     └──blocks──> SUBTASK-6 (polish, optional)
                                  ▲           ▲
                                  │           │
                                  └─SUBTASK-3,4 also block 6 (it polishes the editor modal)
```

## Execution Waves (for batch-implement)

- **Wave 1** (sequential, foundational): `SUBTASK-1`
- **Wave 2** (sequential): `SUBTASK-2` (must follow 1)
- **Wave 3** (parallel, both unblocked by 2): `SUBTASK-3`, `SUBTASK-5`
  - 3 and 5 touch the list toolbar and row actions respectively; minor merge conflicts in `PrometheusQueryPresetList.tsx` are expected but trivial. Can be sequenced if a clean stack is preferred.
- **Wave 4** (sequential): `SUBTASK-4` (depends on 2 + 3)
- **Wave 5** (optional): `SUBTASK-6`

## PR Stack Strategy (Graphite)

Recommended stack (top → bottom of stack, top = most recent):

```
feature/fr-2451-polish              (optional, Sub-task 6)
feature/fr-2451-edit-modal          (Sub-task 4)
feature/fr-2451-delete              (Sub-task 5, parallel-mergeable with 4 in theory)
feature/fr-2451-create-modal        (Sub-task 3)
feature/fr-2451-preset-list         (Sub-task 2)
feature/fr-2451-tab-scaffolding     (Sub-task 1)
main
```

Because Sub-tasks 3 and 5 both branch from 2 and touch the same file (`PrometheusQueryPresetList.tsx`), a strict linear stack is simpler. If parallel review is desired, branch 5 directly off 2 (sibling of 3) and rebase one onto the other before merge.

## Risks & Open Questions

- **Category CRUD is out of scope** but the create/edit modal needs to *consume* `prometheusQueryPresetCategories`. If the seed data is empty in dev environments, verify the form still submits with `categoryId = null`. Document this in Sub-task 3's PR description.
- **`queryTemplate` placeholder safety**: the modal does not validate that the PromQL string actually contains the expected placeholders. The backend will execute it as-is in preview, so a malformed template returns "No data available" — acceptable per spec, but worth surfacing in the polish task as a help tooltip.
- **`PrometheusPresetPreview` extraction (Sub-task 4)** changes a file currently unrelated to this feature (`AutoScalingRuleEditorModal.tsx`). Keep the extraction commit isolated within Sub-task 4's PR to make the diff obviously a move + import. Note in the PR description that no behavior changes.
- **`ModifyQueryDefinitionInput` semantics**: spec says "send only changed fields." For nested `options` (filterLabels / groupLabels), `null` = no change. Make sure the diffing logic in Sub-task 4 distinguishes "user cleared the array" (send `[]`) from "user didn't touch it" (send `null`). Add a unit-level test or an explicit form-state comparison helper.
- **`prometheusQueryPresets` access policy**: spec says "all authenticated users can read"; mutations are admin-only. The new tab is gated behind `isSuperAdmin` in `AdminServingPage`, but be aware the underlying query is not admin-restricted. Acceptable per spec.
- **Spec path**: Recommend keeping the spec at `.specs/draft-auto-scaling-rule-management/` (and this dev plan there) until the spec PR #6356 is merged, then rename in a follow-up to `.specs/FR-2451-prometheus-query-preset-admin/` to match the existing `FR-XXXX-...` convention.

## Verification

Each sub-task PR must run `bash scripts/verify.sh` (Relay + Lint + Format + TypeScript) and confirm `=== ALL PASS ===` before push. PR descriptions should embed the verification output, per `CLAUDE.md`.
