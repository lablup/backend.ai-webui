# Admin Model Card Management Dev Plan

## Spec Reference
`.specs/admin-model-card-management/spec.md`

## Jira Epic: FR-2417

## Sub-tasks (Implementation Order)

### 1. Add admin model card list page with route, menu, table, and scan — #6487
- **Changed files**: 
  - `react/src/pages/AdminModelCardListPage.tsx` (NEW)
  - `react/src/routes.tsx`
  - `react/src/hooks/useWebUIMenuItems.tsx`
  - `resources/i18n/en.json`
- **Dependencies**: None
- **Review complexity**: Medium
- **Description**: Foundation page for admin model card management. Adds route `/admin-model-store`, admin menu item (superadmin-only), table with `adminModelCardsV2` query (pagination, filter by name/domain/project, sort by name/createdAt), access level badge display, single delete with confirmation, scan project VFolders, refresh button. Follows `AdminVFolderNodeListPage` pattern.

### 2. Add admin model card create/edit modal with bulk operations — #6488
- **Changed files**:
  - `react/src/components/AdminModelCardSettingModal.tsx` (NEW)
  - `react/src/pages/AdminModelCardListPage.tsx` (modify)
  - `resources/i18n/en.json`
- **Dependencies**: Sub-task 1 (#6487 blocks #6488)
- **Review complexity**: High
- **Description**: Create/edit modal with all metadata fields (name, author, title, modelVersion, description, task, category, architecture, framework, label, license, readme, accessLevel). VFolder select with folder create button. Inline access level toggle in table. Bulk delete via row selection. Min resource read-only display. Follows `ResourceGroupSettingModal.tsx` pattern.

## PR Stack Strategy
- Sequential: #6487 -> #6488

## Dependency Graph
```
#6487 (List Page) ──blocks──> #6488 (Create/Edit Modal + Bulk Ops)
```

## Estimated Waves
- **Wave 1**: #6487 — Admin model card list page
- **Wave 2**: #6488 — Create/edit modal and bulk operations

## Risks and Notes
- Backend API is fully implemented (PR #10703 + #10783 merged). All GQL queries/mutations are available.
- `minResource` is read-only in GQL (write only via REST). Display only, no edit UI needed.
- `deployModelFolder` API does not exist yet — folder create button should use existing VFolder creation flow with a TODO(needs-backend) marker.
- Deployment (`deployModelCardV2`) is out of scope — handled in separate spec (#6355, #6278).
- The existing `ModelStoreListPage` (user-facing) uses the legacy `model_cards` query. This admin page uses the new `adminModelCardsV2` query with `ModelCardV2` types. They are independent.
- Closed outdated issues #6328 and #6329 which were created before backend field expansion.
