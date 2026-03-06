# RBAC Management UI Progress

## Last Session: 2026-03-06

### 1. Current Phase
All 8 sub-tasks (ST-1 through ST-8) implemented and submitted as a Graphite PR stack.
Backend integration branches (3 additional) created on top of the stack.

### 2. Backend Integration Branches

| Branch | Feature | Backend Dependency | Status |
|--------|---------|-------------------|--------|
| `03-06-feat_migrate_rbac_tabs_to_role_sub_connections` | Role sub-connections (fragments) | `main` (PR #9518 merged) | Committed |
| `03-06-feat_add_bulk_role_assignment_mutations` | Bulk assign/revoke | `feat/BA-4877-bulk-role-gql` | Committed |
| `03-06-feat_add_permission_update_mutation` | Permission update + edit mode | `feat/BA-4876-permission-update-gql` | Committed |

### 3. Next Action
- Submit PRs for the 3 new backend integration branches
- Run `/fw:i18n` to verify translations across all languages
- Assign Jira issues and move to active sprint

### 4. Lessons Learned
- `gpt-tokenizer` has pre-existing TypeScript errors in node_modules — ignore these
- Generated Relay files are .gitignored, don't try to stage them
- Linter auto-formats on `gt create` via pre-commit hooks — account for `_data` prefix on unused params
- `UserV2` uses nested `basicInfo { email, fullName }` structure, not flat fields
- `RoleAssignmentFilter` only supports `roleId` filter (no userId filter)
- `PermissionFilter` supports `roleId`, `scopeType`, `entityType`
- Features depending on different backend branches should be in separate frontend branches for testing ease

### 5. Completed Work
| Issue | Title | PR | Status |
|-------|-------|-----|--------|
| FR-2219 | ST-1: Foundation | [#5766](https://app.graphite.com/github/pr/lablup/backend.ai-webui/5766) | Done |
| FR-2220 | ST-2: Role List Page | [#5767](https://app.graphite.com/github/pr/lablup/backend.ai-webui/5767) | Done |
| FR-2221 | ST-3: Role Creation Modal | [#5768](https://app.graphite.com/github/pr/lablup/backend.ai-webui/5768) | Done |
| FR-2222 | ST-4: Role Detail Drawer | [#5769](https://app.graphite.com/github/pr/lablup/backend.ai-webui/5769) | Done |
| FR-2223 | ST-5: Role Edit Modal | [#5770](https://app.graphite.com/github/pr/lablup/backend.ai-webui/5770) | Done |
| FR-2224 | ST-6: Role Status Management | [#5771](https://app.graphite.com/github/pr/lablup/backend.ai-webui/5771) | Done |
| FR-2225 | ST-7: Role Assignment Management | [#5772](https://app.graphite.com/github/pr/lablup/backend.ai-webui/5772) | Done |
| FR-2226 | ST-8: Permission Management | [#5773](https://app.graphite.com/github/pr/lablup/backend.ai-webui/5773) | Done |
