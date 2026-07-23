# Endpoint → Deployment UI Migration Progress

## Last Session: 2026-04-22 (plan creation)

### 1. Current Phase

Planning complete. 6 Stories + 22 Sub-tasks created in Jira under Epic FR-1368. Ready for Wave 1 (Foundation) implementation.

### 2. Next Action

Run `/batch-implement .specs/FR-1368-endpoint-deployment-migration/dev-plan.md` to start Wave 1 (FR-2663, FR-2664, FR-2665, FR-2666 — Foundation layer).

All four Wave 1 sub-tasks have no blockers and can run in parallel, though they may be bundled into a single "Foundation" PR since they are small / mechanical-tier changes.

### 3. Current Goal

Land Story 1 (Foundation) so downstream Stories 2 – 6 are unblocked.

### 4. Lessons Learned

- Jira issuetype is `Subtask` (single word), not `Sub-task`. Using hyphenated form returns HTTP 400.
- `fw-jira` binary symlink in `~/.local/bin/fw-jira` is broken; use `bash /Users/sujinkim/.claude/plugins/fw/bin/jira.sh` directly.
- Dependency modeling prioritized *code-level* blockers: shared components (FR-2667, FR-2668) block list table (FR-2670); list table blocks list pages; list pages block cleanup; etc. Cross-story relations that aren't strict blockers are modeled with `relates` (e.g. FR-2675 ↔ FR-2676).

### 5. Completed Work

- Spec finalized: `.specs/FR-1368-endpoint-deployment-migration/spec.md` (PR-review feedback applied)
- Dev plan created: `.specs/FR-1368-endpoint-deployment-migration/dev-plan.md`
- 6 Stories created under Epic FR-1368: FR-2657, FR-2658, FR-2659, FR-2660, FR-2661, FR-2662
- 22 Sub-tasks created with parent Story links: FR-2663 – FR-2684
- Dependency links (`blocks` + one `relates`) set between sub-tasks to enable `/batch-implement` wave scheduling
- `metadata.json` updated with Story / Sub-task mapping
- `.context/` initialized (this file + tasks.md + findings.md)
