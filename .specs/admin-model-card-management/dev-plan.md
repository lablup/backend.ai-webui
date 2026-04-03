# Admin Model Card Management Dev Plan

## Spec Reference
`.specs/admin-model-card-management/spec.md`

## Jira Epic: FR-2417

## Sub-tasks (Implementation Order)

### 1. Admin Model Card List Page with Route, Menu, and Table - #6328
- **Changed files**:
  - `react/src/pages/AdminModelCardListPage.tsx` (NEW)
  - `react/src/components/AdminModelCardList.tsx` (NEW)
  - `react/src/routes.tsx`
  - `react/src/hooks/useWebUIMenuItems.tsx`
  - `resources/i18n/en.json`
- **Dependencies**: None
- **Review complexity**: High
- **Description**: New admin page with `modelCardsV2` query, BAITable with columns (name, title, category, domain, project, createdAt), filtering (ModelCardV2Filter), sorting (ModelCardV2OrderBy), delete action with `adminDeleteModelCardV2` mutation, route registration at `/admin-model-store`, superadmin menu item. Follow `ResourceGroupList.tsx` + `AdminServingPage` patterns.

### 2. Admin Model Card Create/Edit Setting Modal - #6329
- **Changed files**:
  - `react/src/components/AdminModelCardSettingModal.tsx` (NEW)
  - `react/src/components/AdminModelCardList.tsx` (modify)
  - `resources/i18n/en.json`
- **Dependencies**: Sub-task 1 (#6328 blocks #6329)
- **Review complexity**: Medium
- **Description**: Single setting modal for create (`adminCreateModelCardV2`) and edit (`adminUpdateModelCardV2`) modes. Create requires name, vfolderId, projectId, domainName. Edit currently supports name and description only. Uses BAIDomainSelect, ProjectSelectForAdminPage, VFolderSelect. TODO(needs-backend) markers for future GQL input expansion, visibility toggle, and service definition fields.

## PR Stack Strategy
- Sequential: 1 -> 2 (stacked PRs via Graphite)
- Branch: `feature/admin-model-card-management`

## Dependency Graph
```
#6328 (List Page) ──blocks──> #6329 (Setting Modal)
```

## Backend Blockers (tracked as TODO in code)
1. **GQL CreateInput expansion**: Only 4 required fields. Full metadata fields need backend follow-up.
2. **GQL UpdateInput expansion**: Only name/description. All metadata fields need backend follow-up.
3. **Visibility field**: Not in model_cards table yet. Visibility toggle blocked.
4. **Service definition fields**: Not in backend yet. Blocked for this spec entirely.

## Key Patterns to Follow
- `ResourceGroupList.tsx` - Table with CRUD actions, BAITable, BAINameActionCell
- `ResourceGroupSettingModal.tsx` - Combined create/edit modal pattern
- `AdminServingPage` - Admin route/menu registration pattern
- `ModelCardV2` GQL type with nested `metadata: ModelCardV2Metadata!` (note: metadata fields are nested, not flat)

## GQL Schema Notes
- `ModelCardV2.metadata` is a nested type `ModelCardV2Metadata` containing author, title, description, task, category, etc.
- `modelCardsV2` supports both cursor-based (before/after/first/last) and offset-based (limit/offset) pagination
- `ModelCardV2Filter` supports: name (StringFilter), domainName (String), projectId (UUID)
- `ModelCardV2OrderBy` fields: NAME, CREATED_AT with ASC/DESC direction
