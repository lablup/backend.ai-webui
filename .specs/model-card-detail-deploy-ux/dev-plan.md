# Model Card Detail Drawer + Deploy UX Dev Plan

## Spec Reference
`.specs/model-card-detail-deploy-ux/spec.md`

## Parent Issue
#6475 (FR-2489)

## Sub-tasks (Implementation Order)

### 1. Create ModelCardDrawer with v2 metadata display - #6510
- **Changed files**:
  - `react/src/components/ModelCardDrawer.tsx` (NEW)
  - `react/src/pages/ModelStoreListPageV2.tsx` (add drawer open, opacity for unavailable cards, availablePresets count in fragment)
  - `resources/i18n/en.json` (drawer i18n keys)
- **Dependencies**: None (depends on existing ModelStoreListPageV2 from PR #6491)
- **Review complexity**: Medium
- **Description**:
  - New `ModelCardDrawer` component using `ModelCardV2` fragment with nested `metadata` structure
  - Display: title, author, description, tags (all default color), architecture, framework (with icons), version, vfolder (identicon + File Browser link), minResource, README (markdown, Drawer scroll), ModelBrandIcon
  - Remove legacy patterns: error_msg, footer buttons
  - Deploy button placeholder in Drawer `extra` prop (disabled, wired in sub-task 2)
  - Add `availablePresets { count }` to list fragment for opacity treatment
  - Wire card click to open Drawer in ModelStoreListPageV2

### 2. Implement deploy UX with 3 scenarios and selection modal - #6511
- **Changed files**:
  - `react/src/components/ModelCardDrawer.tsx` (deploy button logic, scenario branching)
  - `react/src/components/ModelCardDeployModal.tsx` (NEW - scenario 3 selection modal)
  - `resources/i18n/en.json` (deploy i18n keys)
- **Dependencies**: Sub-task 1 (#6510 blocks #6511)
- **Review complexity**: High
- **Description**:
  - Scenario 1 (no presets): disabled deploy button + error Alert
  - Scenario 2 (single preset + single resource group): auto-deploy via `deployModelCardV2` mutation
  - Scenario 3 (multiple): selection modal with Runtime (`runtimeVariants` query), Preset (`availablePresets` filtered by `runtimeVariantId`, rank-sorted, auto-select lowest), Resource Group (`BAIResourceGroupSelect`)
  - `deployModelCardV2` mutation with `cardId`, `projectId` (current project), `revisionPresetId`, `resourceGroup`, `desiredReplicaCount: 1`
  - Navigate to `/serving/${deploymentId}` on success

### 3. Add post-deploy status alerts to EndpointDetailPage - #6512
- **Changed files**:
  - `react/src/pages/EndpointDetailPage.tsx` (scheduling history query + alert section)
  - `resources/i18n/en.json` (alert i18n keys)
- **Dependencies**: Sub-task 2 (#6511 blocks #6512)
- **Review complexity**: Medium
- **Description**:
  - Query `deploymentScopedSchedulingHistories` with `scope: { deploymentId }`, `filter: { toStatus: ["READY"] }`, `limit: 1`
  - Pre-first-serve (count === 0): info Alert with preparation message
  - Post-first-serve + chat available (blockList check + hasAnyHealthyRoute): success Alert with "Start Chat" button -> `/chat?endpointId=...`
  - Reuses existing `hasAnyHealthyRoute` and `blockList` logic

## PR Stack Strategy
- Sequential: #6510 -> #6511 -> #6512
- Stack branch base: `feat/FR-2489-model-card-detail-deploy-ux` (spec PR)
- Each PR stacked on the previous

## Dependency Graph
```
#6510 (ModelCardDrawer)
  |
  v
#6511 (Deploy UX + 3 scenarios)
  |
  v
#6512 (Post-deploy alerts)
```

## Notes

- PR #6491 (ModelStoreListPageV2 implementation) must be merged or stacked below before sub-task 1
- The `deployModelCardV2` mutation, `runtimeVariants` query, `availablePresets` connection, and `deploymentScopedSchedulingHistories` query all exist in the current GQL schema (`data/schema.graphql`)
- Legacy components (`LegacyModelCardModal`, `LegacyModelTryContentButton`) are already renamed and not touched by this work
- `BAIResourceGroupSelect` from `packages/backend.ai-ui` is ready for reuse in the deploy modal
