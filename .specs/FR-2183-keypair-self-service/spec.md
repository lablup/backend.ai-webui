# Self-Service Keypair Management & Main Access Key Switching

## Overview

Enable regular users to manage their own API keypairs (issue, deactivate, activate, purge, switch main) through the WebUI. The backend APIs are already complete, providing four Strawberry GraphQL mutations: `issueMyKeypair`, `updateMyKeypair`, `revokeMyKeypair`, and `switchMyMainAccessKey`.

## Problem Statement

Currently, keypair management in the WebUI is admin-only (`/credential` page). Regular users can only view their keypairs in a read-only modal (`MyKeypairInfoModal`). There is no way for users to:
- Create additional keypairs for different environments or applications
- Deactivate or reactivate keypairs
- Permanently remove unused keypairs
- Switch which keypair serves as their main access key

## Requirements

### Must Have

- [ ] Upgrade `MyKeypairInfoModal` from read-only to interactive, supporting issue/deactivate/activate/purge/switch actions
- [ ] **Active / Inactive tabs** — add tab switching (like admin `UserCredentialList` pattern using `BAIRadioGroup`) to separate active and inactive keypairs
- [ ] "Issue New Keypair" button that calls `issueMyKeypair` mutation (no input required)
- [ ] After issuing a keypair, display the generated `accessKey`, `secretKey`, and `sshPublicKey` with copy-to-clipboard and a warning that the secret key will not be shown again
- [ ] **Control buttons per tab:**
  - **Active tab:** "Set as Main" action (calls `switchMyMainAccessKey`), "Deactivate" action (calls `updateMyKeypair(isActive: false)` — soft, reversible)
  - **Inactive tab:** "Activate" action (calls `updateMyKeypair(isActive: true)` — restore), "Purge" action (calls `revokeMyKeypair` — permanent deletion, irreversible)
- [ ] Show "Main" badge on the current main access key row
- [ ] Disable "Deactivate" on the main access key row with a tooltip: must switch main first
- [ ] Deactivate confirmation: simple confirmation dialog (reversible action)
- [ ] Purge confirmation: use `BAIConfirmModalWithInput` requiring the user to type the access key (irreversible, permanent deletion)
- [ ] **Main key display:** If filtering by main key is available via the query, add a main key filter option. If not, display a message/banner above the keypair table indicating which key is the current main access key.
- [ ] **Secret key display:** Show secret key as masked (`****`) but make it copyable (consistent with admin `UserCredentialList` behavior)

#### Table Enhancements

- [ ] **Additional columns:** Add `created_at`, `last_used` (and `updated_at` if available from the backend) columns to the keypair table
- [ ] **Sorting:** Enable column-based sorting (by created_at, last_used, access_key, etc.)
- [ ] **Pagination:** Add pagination support for users with many keypairs (use `limit`/`offset` from `keypair_list` query)
- [ ] **Filtering:** Add filter capabilities (e.g., search by access key, filter by main key status)
- [ ] Migrate keypair list fetching from current legacy REST API (`baiClient.keypair.list()`) to GraphQL `keypair_list` query via Relay `useLazyLoadQuery`
  - The `keypair_list` query supports all user roles: regular users are automatically scoped to their own keypairs by the backend (`scoped_query` decorator)
  - Same query already used in admin `UserCredentialList` — reuse the same pattern

### Nice to Have
- [ ] Download keypair credentials as CSV after issuing (consistent with `GeneratedKeypairListModal` pattern)
- [ ] Add a "Copy all credentials" button after keypair issuance that copies access key, secret key, and SSH public key together

## User Stories

- As a **regular user**, I want to issue a new API keypair so that I can use separate credentials for different applications or environments.
- As a **regular user**, I want to deactivate a keypair temporarily so that I can disable it without losing it permanently.
- As a **regular user**, I want to reactivate a previously deactivated keypair so that I can restore it when needed.
- As a **regular user**, I want to permanently purge an unused keypair so that I can clean up credentials I no longer need.
- As a **regular user**, I want to switch my main access key so that I can rotate credentials while keeping my account active.
- As a **regular user**, I want to clearly see which keypair is my main access key so that I know which one controls my default authentication.
- As a **regular user**, I want to see my keypairs separated by active/inactive status so that I can manage them effectively.
- As a **regular user**, I want to sort and filter my keypairs so that I can quickly find the one I need.

## Acceptance Criteria

**Entry Point:**
- [ ] The modal is accessible via the existing "My Keypair Info" config button in User Settings page
  - Navigation path: **User avatar (top-right)** → **Preferences** → `/usersettings` → **Preferences** section → **"My Keypair Info"** Config button
  - Component: `UserSettingsPage` (`react/src/pages/UserSettingsPage.tsx`) opens `MyKeypairInfoModal` (`react/src/components/MyKeypairInfoModal.tsx`)

**Active / Inactive Tabs:**
- [ ] Add `BAIRadioGroup` tab switcher with "Active" and "Inactive" options (same pattern as admin `UserCredentialList`)
- [ ] Active tab shows active keypairs with actions: "Set as Main", "Deactivate"
- [ ] Inactive tab shows inactive keypairs with actions: "Activate" (restore), "Purge" (permanent delete)
- [ ] Tab selection filters the keypair list via `is_active` query parameter

**Keypair Table:**
- [ ] Columns: Access Key, Secret Key (masked `****` but copyable), Main indicator (badge), Created At, Last Used
- [ ] Secret key displayed as `****` with a copy button — consistent with admin credential list behavior
- [ ] Sorting enabled on columns (created_at, last_used, access_key)
- [ ] Pagination for large keypair lists (using `limit`/`offset` from `keypair_list` query)
- [ ] Filtering: search by access key text, filter by main key status
- [ ] Main key info: if main key filtering is supported by backend, add filter option; otherwise show an informational banner above the table indicating the current main access key

**Issue Keypair:**
- [ ] "Issue New Keypair" button above the table
- [ ] After calling `issueMyKeypair`, a result view displays `accessKey`, `secretKey`, and `sshPublicKey` with copy buttons and a warning that the secret key cannot be retrieved later
- [ ] Keypair settings (resource_policy, rate_limit, is_admin) are auto-inherited from the current main keypair — no user input required

**Control Buttons (Active Tab):**
- [ ] "Set as Main" button on each non-main keypair row — calls `switchMyMainAccessKey`
- [ ] After switching main access key, the "Main" indicator moves to the new main keypair
- [ ] "Deactivate" button on each keypair row — calls `updateMyKeypair(accessKey, isActive: false)`
- [ ] Deactivate is a soft/reversible operation — use simple confirmation dialog (not `BAIConfirmModalWithInput`)
- [ ] The main keypair row's "Deactivate" button is disabled with tooltip text: "Cannot deactivate the main access key. Switch to another key first."

**Control Buttons (Inactive Tab):**
- [ ] "Activate" button to reactivate a keypair — calls `updateMyKeypair(accessKey, isActive: true)`
- [ ] "Purge" button to permanently delete an inactive keypair — calls `revokeMyKeypair`
- [ ] Purge confirmation uses `BAIConfirmModalWithInput` requiring the user to type the access key to confirm (irreversible, permanent deletion from database)

**Data Migration:**
- [ ] Migrate keypair list fetching from current legacy REST API (`baiClient.keypair.list()`) to GraphQL `keypair_list` query via Relay `useLazyLoadQuery`

**Error Handling:**
- [ ] Error states are handled with appropriate error messages (e.g., trying to deactivate main key returns backend error, network failures)

## Backend API Reference

### Self-Service Mutations (Strawberry)

| Mutation | Input | Output | Notes |
|---|---|---|---|
| `issueMyKeypair` | None | `{ accessKey, secretKey, sshPublicKey }` | Inherits resource_policy, rate_limit, is_admin from main keypair. Keys are auto-generated (AKIA + random). |
| `updateMyKeypair` | `{ accessKey: String!, isActive: Boolean! }` | `{ success: Boolean! }` | Soft deactivate/activate toggle. Validates ownership (error: "Cannot update another user's keypair"). Keypair must exist (error: "Keypair {accessKey} not found"). |
| `revokeMyKeypair` | `{ accessKey: String! }` | `{ success: Boolean! }` | **Permanent deletion** from database. Cannot revoke main access key (error: "Cannot revoke the main access key. Switch main access key first."); validates ownership (error: "Cannot revoke another user's keypair"). |
| `switchMyMainAccessKey` | `{ accessKey: String! }` | `{ success: Boolean! }` | Target must be active (error: "Cannot set an inactive keypair as the main access key.") and owned by user (error: "Cannot set another user's access key as the main access key."). |

### Keypair List Query (Graphene GraphQL)

| Query | Usage | Available Fields | Access Control |
|---|---|---|---|
| `keypair_list(limit, offset, email, is_active)` | Fetch current user's keypair list (same query used in admin `UserCredentialList`) | access_key, secret_key, is_active, is_admin, created_at, last_used, rate_limit, num_queries, ssh_public_key, resource_policy | `scoped_query` — USER role is auto-scoped to own keypairs only |

## Affected Components

| Component | Change |
|---|---|
| `MyKeypairInfoModal` | Upgrade from read-only to interactive with tabs, table enhancements, and control buttons |
| `KeypairInfoModal` | No change (already shows main key tag) |
| `KeypairSettingModal` | No change |
| `UserSettingModal` | No change (already has main_access_key field) |
| `UserSettingsPage` | No change (entry point already exists) |

## Out of Scope

- Backend API changes (already complete: BA-4764 PR #10066, PR #10309)
- Admin keypair management enhancements (already implemented)
- Admin creating keypairs on behalf of users (existing `create_keypair` mutation already handles this)
- Keypair resource policy or rate limit modification by regular users (self-service keypairs inherit settings from main keypair)
- SSH keypair management (separate feature, already has its own modal: `SSHKeypairManagementModal`)
- Keypair expiration or time-based rotation policies
- Bulk keypair operations
- Audit log of keypair operations
- Strawberry-based keypair list query (existing Graphene `keypair_list` query is sufficient)

## Related Issues

- FR-2183: Add UI for self-service keypair management and main access key switching (source issue)
- BA-4764: Backend API for self-service keypair management (backend, done, PR #10066 merged)
- BA-4762: Parent epic (Improve scheduler, user management, and storage clone APIs)
- Backend PR #10309: Add `updateMyKeypair` mutation for soft deactivate/activate
- GitHub #5675: Cloned issue in webui repo
