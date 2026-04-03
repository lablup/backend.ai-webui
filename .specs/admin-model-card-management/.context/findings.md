# Admin Model Card Management Findings

## Decisions
| Date | Decision | Rationale | Issue |
|------|----------|-----------|-------|
| 2026-04-01 | Use nested ModelCardV2Metadata instead of flat fields | GQL schema uses `metadata: ModelCardV2Metadata!` as nested type | #6328 |
| 2026-04-01 | Single SettingModal for create+edit | Follows ResourceGroupSettingModal pattern used across codebase | #6329 |
| 2026-04-01 | Defer visibility toggle and service definition | Backend fields not yet implemented (see spec blockers section) | #6328, #6329 |

## Discoveries
- `ModelCardV2` uses a nested `metadata` field (type `ModelCardV2Metadata`) rather than flat fields on the type. This differs from the old `ModelCard` type which had flat fields.
- `DeleteModelCardPayloadGQL` returns only `id: UUID!` (not ok/msg pattern used by older mutations).
- Existing `ModelStoreListPage` uses the old `model_cards` query (not `modelCardsV2`). The admin page will use the new V2 API exclusively.

## Issues Encountered
| Date | Problem | Root Cause | Resolution | Issue |
|------|---------|-----------|------------|-------|
