# Session Template Management Findings

## Decisions
| Date | Decision | Rationale | Issue |
|------|----------|-----------|-------|
| 2026-03-10 | Use direct `newSignedRequest` for create/update/delete | SDK `SessionTemplate` class only has `list()` method | #5837 |
| 2026-03-10 | Place menu in `adminMenu` (not `superAdminMenu`) | Spec says admin/superadmin should see it; adminMenu covers both | #5840 |
| 2026-03-10 | Separate list and modal into distinct sub-tasks | They can be developed in parallel after the hook is ready | #5838, #5839 |

## Discoveries
- SDK `SessionTemplate` class at line 3883 of `src/lib/backend.ai-client-esm.ts` only implements `list(listall, groupId)`
- Control panel reference uses `hubFetch` (Django proxy) not direct SDK — WebUI must adapt to use `baiClient.newSignedRequest`
- Create API expects `template` field as `JSON.stringify([templateDetails])` (array wrapped)
- Existing `SessionTemplateModal.tsx` in WebUI is for session history (different feature), not template management

## Issues Encountered
| Date | Problem | Root Cause | Resolution | Issue |
|------|---------|-----------|------------|-------|
