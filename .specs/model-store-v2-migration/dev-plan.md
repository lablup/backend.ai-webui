# Model Store V2 Migration Dev Plan

## Spec Reference
`.specs/model-store-v2-migration/spec.md`

## Epic: FR-2449
## Spec Task: FR-2450

## Sub-tasks (Implementation Order)

### 1. Register `model-card-v2` feature flag and rename legacy components

Register a new `model-card-v2` feature flag in the backend.ai client (`supports()`) gated on the appropriate manager version. Rename existing components to Legacy variants and set up version branching at the route/page level.

- **Changed files**:
  - `src/lib/backend.ai-client-esm.ts` — add `this._features['model-card-v2'] = true` under appropriate version
  - `react/src/pages/ModelStoreListPage.tsx` — rename to `LegacyModelStoreListPage.tsx`
  - `react/src/components/ModelCardModal.tsx` — rename to `LegacyModelCardModal.tsx`
  - `react/src/components/ModelTryContentButton.tsx` — rename to `LegacyModelTryContentButton.tsx`
  - `react/src/pages/ModelStoreListPage.tsx` — create new file with version branch: renders new component when `model-card-v2` supported, otherwise renders Legacy
  - `react/src/routes.tsx` — update import (no change needed if new file uses same default export name)
  - Relay generated files — update after fragment renames
- **Dependencies**: None
- **Review complexity**: Low (mechanical renaming + small version gate logic)
- **Description**: Rename `ModelStoreListPage` to `LegacyModelStoreListPage`, `ModelCardModal` to `LegacyModelCardModal`, `ModelTryContentButton` to `LegacyModelTryContentButton`. Update all imports accordingly. Create a new `ModelStoreListPage.tsx` that checks `baiClient.supports('model-card-v2')` and conditionally renders the new or legacy component. The new component starts as a minimal placeholder that will be filled in by subsequent sub-tasks. Add the feature flag in `_updateSupportList()` at the correct manager version.

### 2. Implement new ModelStoreListPage with projectModelCardsV2 query, server-side pagination, filtering, and sorting

Build the new `ModelStoreListPage` component that uses the `projectModelCardsV2` GQL query with `ModelCardV2` types. This includes server-side name filtering (debounced), server-side sorting (NAME/CREATED_AT), cursor-based "load more" pagination, and the card grid layout.

- **Changed files**:
  - `react/src/pages/ModelStoreListPageV2.tsx` — new component (the actual v2 implementation)
  - `react/src/pages/ModelStoreListPage.tsx` — import and render `ModelStoreListPageV2` when v2 is supported
  - `resources/i18n/en.json` — add/update i18n keys for sort options, load more button, empty state
- **Dependencies**: Sub-task 1 (version branching infrastructure must exist)
- **Review complexity**: High (new GQL query, pagination logic, server-side filter/sort integration)
- **Description**:
  - Write `projectModelCardsV2` Relay query with `ProjectModelCardV2Scope`, `ModelCardV2Filter` (name: StringFilter with `contains`), `ModelCardV2OrderBy`, and cursor pagination args (`first`, `after`)
  - Use `useDebouncedDeferredValue` + `useTransition` pattern (from `BAIVFolderSelect`) for search input debounce
  - Implement "load more" button using `pageInfo.hasNextPage` and `pageInfo.endCursor`
  - Sort dropdown with options: Name (ASC/DESC), Created At (ASC/DESC)
  - Remove client-side category/task/label Select filters (not in `ModelCardV2Filter`)
  - Maintain Row/Col grid layout (xs/sm: 24, lg: 12, xxl: 8)
  - Each card shows: `ModelBrandIcon`, `metadata.title` or `name`, `metadata.task`, `updatedAt` (fromNow)
  - All tags use default color (no success/blue/geekblue)
  - Refresh button to refetch
  - Card click sets selected model card key for the detail drawer (placeholder for sub-task 3)

## PR Stack Strategy
- Sequential: 1 -> 2

## Dependency Graph
```
Sub-task 1 (legacy rename + version gate)
    |
    v
Sub-task 2 (new list page with v2 query)
```

## Execution Waves

### Wave 1
- Sub-task 1: Register feature flag + rename legacy components

### Wave 2
- Sub-task 2: New ModelStoreListPage with projectModelCardsV2 query

## Key Files Inventory

| File | Current Role | Migration Action |
|------|-------------|------------------|
| `react/src/pages/ModelStoreListPage.tsx` | Main list page (v1) | Rename to `LegacyModelStoreListPage.tsx`, create new version-branching wrapper |
| `react/src/components/ModelCardModal.tsx` | Detail modal (v1) | Rename to `LegacyModelCardModal.tsx` |
| `react/src/components/ModelTryContentButton.tsx` | Service launch button (v1) | Rename to `LegacyModelTryContentButton.tsx` |
| `react/src/components/ModelBrandIcon.tsx` | Model name icon | Reuse as-is (no changes) |
| `react/src/helper/modelBrandIcons.ts` | Icon mapping helper | Reuse as-is |
| `react/src/components/ModelCloneModal.tsx` | Clone folder modal | Keep for legacy; not used in v2 drawer |
| `react/src/routes.tsx` | Route definition | May need import update |
| `src/lib/backend.ai-client-esm.ts` | Feature flags | Add `model-card-v2` feature |
| `data/schema.graphql` | GQL schema | Already has `ModelCardV2` types |

## Risks and Notes

1. **Manager version for feature flag**: The exact manager version that ships the `projectModelCardsV2` API is not yet confirmed. The feature flag version should be coordinated with the backend team. Use a placeholder version and update before merge.
2. **MODEL_STORE project ID**: The `ProjectModelCardV2Scope` requires a `projectId` (UUID). Need to determine how the frontend obtains the MODEL_STORE project UUID — likely from the current project context or a dedicated lookup. The existing code uses `currentProject.id`.
3. **Storage permission filtering**: The spec mentions `TODO(needs-backend)` for mountable storage filtering. This should be marked with a TODO comment in the new list page, not blocking the migration.
4. **Relay compiler**: After renaming fragments, run `pnpm run relay` to regenerate types. Verify no broken imports.
