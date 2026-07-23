# Admin Model Card Management Findings

## Decisions
| Date | Decision | Rationale | Issue |
|------|----------|-----------|-------|
| 2026-04-08 | 2 sub-tasks instead of many small ones | Create/edit modal + bulk ops are tightly coupled to the list page; splitting further would cause merge conflicts and coordination overhead | #6487, #6488 |
| 2026-04-08 | Closed #6328, #6329 | Outdated issues created before backend fully expanded all metadata fields in GQL | #6487, #6488 |
| 2026-04-08 | Use `adminModelCardsV2` (not legacy `model_cards`) | New V2 API provides proper CRUD, access level, and metadata structure | #6487 |

## Discoveries
- Existing `ModelStoreListPage` uses legacy `model_cards` query (no V2). Admin page is fully independent.
- `BAIVFolderSelect` component exists in `packages/backend.ai-ui/` with refetch support.
- `ProjectSelectForAdminPage` exists for admin pages (disables default project filter).
- `minResource` is read-only in GQL; write requires REST API.
- `deployModelFolder` API does not exist yet for model-specific folder creation.

## Issues Encountered
| Date | Problem | Root Cause | Resolution | Issue |
|------|---------|-----------|------------|-------|
