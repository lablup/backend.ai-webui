# Self-Service Keypair Management Dev Plan

## Spec Reference
`.specs/FR-2183-keypair-self-service/spec.md`

## Parent Issue
GitHub #5675 (FR-2183)

## Sub-tasks (Implementation Order)

### 1. Migrate MyKeypairInfoModal to Relay GraphQL - #6035
- **Changed files**: `react/src/components/MyKeypairInfoModal.tsx`
- **Dependencies**: None
- **Expected PR size**: S (~80 lines)
- **Description**: Replace legacy REST API (`baiClient.keypair.list()` via `useTanQuery`) with GraphQL `keypair_list` query via `useLazyLoadQuery`. Add query variables for `is_active`, `limit`, `offset`, `filter`, `order`. Keep existing `user` query for `main_access_key`. Remove `useSuspendedBackendaiClient` and `useTanQuery` imports.

### 2. Add Active/Inactive tabs and enhanced table columns - #6036
- **Changed files**: `react/src/components/MyKeypairInfoModal.tsx`, `resources/i18n/en.json`
- **Dependencies**: Sub-task 1 (#6035 blocks #6036)
- **Expected PR size**: M (~200 lines)
- **Description**: Add `BAIRadioGroup` tab switcher (Active/Inactive), replace `Table` with `BAITable`, add columns (Created At, Last Used, masked Secret Key with copy), add sorting via `onChangeOrder`, add pagination, add `BAIPropertyFilter` for access_key search, add main access key informational banner. Follow `UserCredentialList` patterns.

### 3. Add Issue New Keypair action with credential display - #6037
- **Changed files**: `react/src/components/MyKeypairInfoModal.tsx`, `resources/i18n/en.json`
- **Dependencies**: Sub-task 1 (#6035 blocks #6037)
- **Expected PR size**: M (~150 lines)
- **Description**: Add "Issue New Keypair" button calling `issueMyKeypair` Strawberry mutation. Display generated credentials (accessKey, secretKey, sshPublicKey) with copy buttons and warning. Follow `GeneratedKeypairListModal` pattern for credential display.

### 4. Add Switch Main Access Key and Deactivate actions (Active tab) - #6038
- **Changed files**: `react/src/components/MyKeypairInfoModal.tsx`, `resources/i18n/en.json`
- **Dependencies**: Sub-task 2 (#6036 blocks #6038)
- **Expected PR size**: M (~200 lines)
- **Description**: Add "Set as Main" button calling `switchMyMainAccessKey` mutation and "Deactivate" button calling `updateMyKeypair(isActive: false)`. Disable Deactivate on main keypair row with tooltip. Use `Popconfirm` for deactivate confirmation. Note: `updateMyKeypair` mutation may not be in schema yet (PR #10309) -- use `modify_keypair` fallback with `TODO(needs-backend)` marker if needed.

### 5. Add Activate and Purge actions (Inactive tab) - #6039
- **Changed files**: `react/src/components/MyKeypairInfoModal.tsx`, `resources/i18n/en.json`
- **Dependencies**: Sub-task 2 (#6036 blocks #6039)
- **Expected PR size**: M (~180 lines)
- **Description**: Add "Activate" button calling `updateMyKeypair(isActive: true)` and "Purge" button calling `revokeMyKeypair` mutation. Purge uses `BAIConfirmModalWithInput` requiring user to type access key. Same `updateMyKeypair` availability caveat as sub-task 4.

### 6. Add i18n translations for keypair self-service - #6040
- **Changed files**: `resources/i18n/en.json`, `resources/i18n/*.json`
- **Dependencies**: Sub-tasks 4, 5 (#6038 and #6039 block #6040)
- **Expected PR size**: M (~100-200 lines across language files)
- **Description**: Final i18n pass. Audit all new keys added in sub-tasks 1-5, ensure completeness in en.json, add translations to all 22 language files.

## PR Stack Strategy
- Wave 1: Sub-task 1 (foundation -- GraphQL migration)
- Wave 2: Sub-tasks 2, 3 (parallel -- tabs/table and issue keypair, both depend only on #1)
- Wave 3: Sub-tasks 4, 5 (parallel -- active tab actions and inactive tab actions, both depend on #2)
- Wave 4: Sub-task 6 (i18n finalization)

## Dependency Graph
```
#6035 (GraphQL migration)
  |
  +---> #6036 (Tabs + Table) --+--> #6038 (Active: Set Main + Deactivate) --+--> #6040 (i18n)
  |                            |                                             |
  +---> #6037 (Issue Keypair)  +--> #6039 (Inactive: Activate + Purge) ------+
```

## Risks and Notes

1. **`updateMyKeypair` mutation not in schema**: The spec references `updateMyKeypair` for soft deactivate/activate (PR #10309), but this mutation is not yet in `data/schema.graphql`. Sub-tasks 4 and 5 should use the existing admin `modify_keypair` mutation as a fallback, guarded by `TODO(needs-backend)` markers, and switch to `updateMyKeypair` once the schema is updated.

2. **Modal vs Page context**: `MyKeypairInfoModal` is a modal, not a page. Pagination and filter state should use local React state instead of URL query params (unlike `UserCredentialList` which uses `useQueryParams`).

3. **Schema update needed**: Before implementation begins, `data/schema.graphql` should be updated to include `updateMyKeypair` if the backend PR #10309 has been merged.
