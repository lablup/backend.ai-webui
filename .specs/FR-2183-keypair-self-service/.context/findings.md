# Self-Service Keypair Management Findings

## Decisions
| Date | Decision | Rationale | Issue |
|------|----------|-----------|-------|
| 2026-03-19 | Use `modify_keypair` as fallback for deactivate/activate | `updateMyKeypair` mutation not yet in schema (PR #10309 pending) | #6038, #6039 |
| 2026-03-19 | Use local state for pagination/filter in modal | Modal context differs from page -- URL params not appropriate | #6036 |
| 2026-03-19 | Split Active/Inactive tab actions into separate sub-tasks | Each tab has distinct actions and can be developed in parallel | #6038, #6039 |

## Discoveries
- `updateMyKeypair` mutation is referenced in the spec but not present in `data/schema.graphql` -- backend PR #10309 may not be merged yet
- Three Strawberry mutations are available: `issueMyKeypair`, `revokeMyKeypair`, `switchMyMainAccessKey`
- `UserCredentialList` provides a complete reference pattern for tabs, sorting, pagination, and filtering
- `GeneratedKeypairListModal` provides the pattern for masked secret key display with copy

## Issues Encountered
| Date | Problem | Root Cause | Resolution | Issue |
|------|---------|-----------|------------|-------|
