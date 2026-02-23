# User CRUD Test Plan - Credential Page

## Application Overview

The Backend.AI WebUI Credential page (`/credential`) provides user management functionality for administrators. The page has two main tabs:

- **Users Tab**: Manages user accounts (create, edit, activate/deactivate, purge)
- **Credentials Tab**: Manages user credentials/keypairs

This test plan focuses on user creation and complete deletion (purge) operations in the Users tab.

### Key Features

- **User Management**: Create, view, edit, activate/deactivate users
- **User Purge**: Permanently delete inactive users with optional virtual folder cleanup
- **Filtering & Search**: Filter users by status (Active/Inactive) and various attributes (email, username, role, etc.)
- **Batch Operations**: Select multiple users for bulk update or purge operations
- **User Status**: Users can be Active or Inactive (soft delete before permanent purge)
- **Permissions**: Only admin/superadmin users can access this page

### Access Requirements

- User must be logged in as **admin** or **superadmin**
- Regular users will see a 401 Unauthorized Access page
- Use `./e2e/utils/test-util.ts`

---

## Test Scenarios

### 1. User Can Create a New User Account

**Seed:** `tests/seed.spec.ts`

**Preconditions:**
- User is logged in as admin/superadmin
- Browser is at `/credential` page
- "Users" tab is active (default tab)

#### 1.1 User can create a new user with required fields only

**Steps:**
1. Click "Create User" button (top right, has PlusIcon)
2. Wait for "User Setting Modal" to appear
3. Fill in the email field with a unique email (e.g., `test-user-${timestamp}@example.com`)
4. Fill in the username field (e.g., `testuser${timestamp}`)
5. Fill in the password field with a valid password (e.g., `TestPass123!`)
6. Select a domain from the "Domain" dropdown (default domain should be pre-selected)
7. Select a role from the "Role" dropdown (default: `user`)
8. Click "OK" or "Create" button to submit the form

**Expected Results:**
- Modal closes after successful creation
- Success message appears: "User created successfully" or similar
- User list automatically refreshes
- New user appears in the Active users list
- User row shows the created email and username
- User status is "active" by default

#### 1.2 User can create a new user with all optional fields

**Steps:**
1. Click "Create User" button
2. Wait for "User Setting Modal" to appear
3. Fill in required fields (email, username, password, domain, role)
4. Fill in optional field "Full Name" (e.g., `Test User Full Name`)
5. Fill in optional field "Description" (e.g., `Test user created for E2E testing`)
6. Select one or more projects/groups from "Projects" dropdown (if available)
7. Select a "Resource Policy" from dropdown (if not using default)
8. Enable/disable optional checkboxes:
   - "Require Password Change" (checkbox)
   - "Enable Sudo Session" (checkbox)
   - "2FA Enabled" (checkbox, if TOTP is supported)
9. Fill in "Allowed Client IP" field with valid IP/CIDR (e.g., `192.168.1.0/24`)
10. Fill in container UID/GID fields (if using container UID/GID)
11. Click "OK" or "Create" button

**Expected Results:**
- Modal closes after successful creation
- Success message appears
- User appears in Active users list
- User info modal (when clicked) shows all filled values correctly
- All optional fields are saved and retrievable

#### 1.3 User sees validation errors for invalid input

**Steps:**
1. Click "Create User" button
2. Try to submit form without filling required fields
3. Verify email field validation:
   - Enter invalid email format (e.g., `notanemail`)
   - Verify error message appears under email field
4. Verify password field validation (if applicable)
5. Verify IP/CIDR validation:
   - Enter invalid IP format in "Allowed Client IP" (e.g., `999.999.999.999`)
   - Verify error message appears
6. Try to create user with duplicate email
   - Enter email of existing user
   - Submit form
   - Verify error message about duplicate email

**Expected Results:**
- Form cannot be submitted when required fields are empty
- Email field shows validation error for invalid format
- IP/CIDR field shows validation error for invalid format
- Duplicate email shows appropriate error message
- User is not created when validation fails
- Modal remains open until valid data is provided or user cancels

#### 1.4 User can cancel user creation

**Steps:**
1. Click "Create User" button
2. Fill in some fields in the modal
3. Click "Cancel" button or close modal (X button)
4. Confirm that modal closes

**Expected Results:**
- Modal closes without creating user
- No new user appears in the list
- No error or success messages appear
- User list remains unchanged

---

### 2. User Can Completely Delete (Purge) a User

**Seed:** `tests/seed.spec.ts`

**Preconditions:**
- User is logged in as admin/superadmin
- Browser is at `/credential` page
- "Users" tab is active
- At least one inactive user exists (created in previous test or pre-existing)

**Note:** Users must be **deactivated first** before they can be permanently deleted (purged). Active users can only be deactivated, not purged.

#### 2.1 User can deactivate an active user

**Steps:**
1. Ensure "Active" filter is selected (radio button group at top)
2. Locate the user to deactivate in the table
3. Click the "Deactivate" button (Ban icon) in the Control column
4. Verify popconfirm dialog appears with title "Deactivate User"
5. Verify dialog shows user's email for confirmation
6. Click "Deactivate" button in popconfirm

**Expected Results:**
- Popconfirm closes
- Success message appears: "Status updated successfully" or similar
- User disappears from Active users list
- When switching to "Inactive" filter, the deactivated user appears there
- User row shows inactive status

#### 2.2 User can permanently delete (purge) a single inactive user

**Steps:**
1. Ensure "Inactive" filter is selected (radio button group at top)
2. Locate an inactive user in the table
3. Click the "Delete" button (DeleteOutlined/trash icon) in the Control column for that user
4. Verify confirmation modal appears with title "Permanently Delete Users" or "Delete User"
5. Verify modal shows warning message about permanent deletion
6. Verify modal lists the user's email to be deleted
7. Verify modal has checkbox "Delete Shared Virtual Folders" (unchecked by default)
8. Verify modal has input field requiring typing "Permanently Delete" to confirm
9. Type "Permanently Delete" in the confirmation input field
10. Click "Delete" button

**Expected Results:**
- Confirmation modal closes
- Success message appears: "User permanently deleted" or "{count} users permanently deleted"
- User completely disappears from inactive users list
- User cannot be found by searching with email filter
- User data is completely removed from the system

#### 2.3 User can purge a single inactive user with virtual folder deletion

**Steps:**
1. Ensure "Inactive" filter is selected
2. Create a test inactive user with some virtual folders (preparation step)
3. Click the "Delete" button for that inactive user
4. In the purge confirmation modal, check the "Delete Shared Virtual Folders" checkbox
5. Type "Permanently Delete" in the confirmation input field
6. Click "Delete" button

**Expected Results:**
- Confirmation modal closes
- Success message appears
- User is permanently deleted
- User's shared virtual folders are also deleted
- User's endpoint ownership is delegated (if applicable)

#### 2.4 User can purge multiple inactive users at once (batch operation)

**Steps:**
1. Ensure "Inactive" filter is selected
2. Select checkboxes for 2 or more inactive users in the table
3. Verify that selection count appears (e.g., "2 selected")
4. Verify that a trash bin button appears in the top toolbar (only visible for inactive users)
5. Click the trash bin button
6. Verify "Permanently Delete Users" modal appears
7. Verify modal shows warning alert with list of all selected users' emails
8. Optionally check "Delete Shared Virtual Folders"
9. Type "Permanently Delete" in confirmation input
10. Click "Delete" button

**Expected Results:**
- Modal closes
- Success message shows count of deleted users (e.g., "2 of 2 users permanently deleted")
- All selected users disappear from the list
- Selection is cleared
- If any deletion fails, error message shows which users failed to delete

#### 2.5 User cannot purge an active user (only deactivate)

**Steps:**
1. Ensure "Active" filter is selected
2. Select an active user by clicking its checkbox
3. Verify that trash bin button is NOT visible in the top toolbar
4. Verify that only Ban icon (deactivate) is available in Control column
5. Verify that Delete icon is NOT present for active users

**Expected Results:**
- Purge/delete button is not available for active users
- Only deactivate option is available
- UI prevents accidental permanent deletion of active users

#### 2.6 User can cancel purge operation

**Steps:**
1. Ensure "Inactive" filter is selected
2. Select one or more inactive users
3. Click the trash bin button
4. In the purge confirmation modal, click "Cancel" button
5. Verify modal closes

**Expected Results:**
- Modal closes without deleting users
- Selected users remain in the inactive list
- No success or error messages appear
- User selection is preserved

#### 2.7 User must type exact confirmation text to enable purge

**Steps:**
1. Select an inactive user and open purge modal
2. Try to click "Delete" button without typing anything in confirmation input
3. Verify "Delete" button is disabled
4. Type incorrect text (e.g., "Permanently Deleted" instead of "Permanently Delete")
5. Verify "Delete" button remains disabled
6. Type correct text "Permanently Delete"
7. Verify "Delete" button becomes enabled

**Expected Results:**
- Delete button is disabled by default
- Delete button remains disabled with incorrect confirmation text
- Delete button becomes enabled only when exact confirmation text is entered
- This prevents accidental permanent deletion

---

## Test Data Requirements

### User Creation Test Data

```javascript
// Example test user data
const testUser = {
  email: `e2e-test-user-${Date.now()}@example.com`,
  username: `testuser${Date.now()}`,
  password: 'TestPassword123!',
  full_name: 'E2E Test User',
  description: 'Created by E2E test for user CRUD',
  role: 'user', // or 'superadmin'
  domain_name: 'default', // or get from current domain
  resource_policy: 'default', // or select available policy
  need_password_change: false,
  sudo_session_enabled: false,
  totp_activated: false,
  allowed_client_ip: ['192.168.1.0/24'],
};
```

### User Deletion Test Data

- At least 3 inactive users should exist for batch deletion tests
- Users should be created and deactivated as part of test setup
- Test users should have unique identifiers to avoid conflicts

---

## UI Element Reference

### Users Tab Main Page

| Element | Type | Selector/Description |
|---------|------|---------------------|
| Users Tab | Tab | Text: "Users" (credential.Users) |
| Active/Inactive Toggle | Radio Button Group | Options: "Active", "Inactive" |
| Property Filter | Filter Component | Filters: email, uuid, username, full_name, role, resource_policy, etc. |
| Refresh Button | Button | Icon: ReloadOutlined |
| Create User Button | Button | Text: "Create User", Icon: PlusIcon, type: primary |
| User Table | Table | Shows user list with columns |
| Control Column | Table Column | Contains Info, Edit, Activate/Deactivate buttons |
| Selected Count | Text | Format: "{count} selected" (when users are selected) |
| Batch Edit Button | Button | Icon: EditIcon, visible when users selected |
| Batch Delete Button | Button | Icon: TrashBinIcon, visible when inactive users selected |

### User Table Columns

| Column Key | Title | Sortable | Description |
|------------|-------|----------|-------------|
| email | Email / User ID | Yes | User's email address |
| control | Control | No | Action buttons (Info, Edit, Activate/Deactivate/Delete) |
| username | Name | Yes | User's username |
| full_name | Full Name | Yes | User's full name |
| role | Role | Yes | User role (superadmin/user) |
| status | Status | Yes | User status (active/inactive) |
| created_at | Created At | Yes | User creation timestamp |
| resource_policy | Resource Policy | Yes | Assigned resource policy |

### User Setting Modal (Create/Edit)

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| Email | Input | Yes | Email format | User's email (unique) |
| Username | Input | Yes | - | User's username |
| Password | Input Password | Yes (create) | - | User's password |
| Full Name | Input | No | - | User's full name |
| Description | Input.TextArea | No | - | User description |
| Role | Select | Yes | - | User role (superadmin/user) |
| Domain | Select | Yes | - | User's domain |
| Projects | Select (multiple) | No | - | Assigned projects/groups |
| Status | Select | Yes | - | User status (active/inactive) |
| Resource Policy | Select | No | - | Assigned resource policy |
| Allowed Client IP | Input (tags) | No | IP/CIDR format | Allowed client IPs |
| Require Password Change | Checkbox | No | - | Force password change on next login |
| Enable Sudo Session | Checkbox | No | - | Enable sudo session capability |
| 2FA Enabled | Checkbox | No | - | Enable TOTP 2FA (if supported) |
| Container UID | InputNumber | No | - | Container UID |
| Container Main GID | InputNumber | No | - | Container main GID |
| Container GIDs | Input (tags) | No | - | Additional container GIDs |

### Purge Users Modal

| Element | Type | Description |
|---------|------|-------------|
| Title | Text | "Permanently Delete Users" |
| Warning Alert | Alert | Shows list of users to be deleted |
| Confirmation Message | Text | Warning about permanent deletion |
| Delete Shared Virtual Folders | Checkbox | Option to delete user's virtual folders |
| Confirmation Input | Input | Requires typing "Permanently Delete" |
| Cancel Button | Button | Cancels the operation |
| Delete Button | Button (danger) | Confirms and executes deletion |

---

## GraphQL Mutations Used

### User Creation
```graphql
mutation UserSettingModalCreateMutation(
  $email: String!
  $props: UserInput!
) {
  create_user(email: $email, props: $props) {
    ok
    msg
    user {
      id
      email
      username
      # ... other fields
    }
  }
}
```

### User Deactivation
```graphql
mutation UserManagementModifyMutation(
  $email: String!
  $props: ModifyUserInput!
) {
  modify_user(email: $email, props: $props) {
    ok
    msg
  }
}
```

### User Purge (Permanent Deletion)
```graphql
mutation PurgeUsersModalMutation(
  $email: String!
  $props: PurgeUserInput!
) {
  purge_user(email: $email, props: $props) {
    ok
    msg
  }
}
```

---

## Error Scenarios to Test

### User Creation Errors

1. **Duplicate Email**: Creating user with existing email
   - Expected: Error message "User already exists" or similar
   - User is not created

2. **Invalid Email Format**: Email without @ symbol or invalid domain
   - Expected: Form validation error under email field
   - Submit button disabled or shows error on submit

3. **Missing Required Fields**: Submitting form without email/username/password
   - Expected: Form validation errors for all required fields
   - Form cannot be submitted

4. **Invalid IP/CIDR Format**: Entering invalid IP in Allowed Client IP
   - Expected: Validation error message
   - Form cannot be submitted

5. **Network Error**: Server unreachable during user creation
   - Expected: Error message about network failure
   - Modal remains open, allowing retry

### User Deletion Errors

1. **Attempting to Purge Active User**: Should not be possible in UI
   - Expected: Delete button not available for active users
   - Only deactivate option shown

2. **User Has Active Sessions**: Attempting to delete user with running sessions
   - Expected: Error message about active sessions
   - User is not deleted

3. **Network Error During Purge**: Server unreachable during deletion
   - Expected: Error message shown
   - User remains in inactive list

4. **Partial Batch Deletion Failure**: Some users fail to delete in batch operation
   - Expected: Error message shows which users failed
   - Success message shows how many succeeded
   - Failed users remain in list

---

## Performance Considerations

- User list pagination is set to 10 users per page by default
- Large user lists (100+ users) should load within 3 seconds
- Batch deletion of 10+ users should complete within 10 seconds
- UI should remain responsive during batch operations

---

## Accessibility Requirements

- All interactive elements should be keyboard accessible
- Tab order should be logical (left to right, top to bottom)
- Form fields should have proper labels
- Error messages should be associated with form fields
- Confirmation modals should trap focus
- Screen reader announcements for success/error messages

---

## Browser Compatibility

Tests should pass on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Test Execution Notes

### Setup Requirements

1. Backend.AI server must be running
2. Admin/superadmin user credentials must be available
3. Test database should be in clean state or have proper cleanup
4. At least one domain must exist
5. At least one resource policy must exist

### Cleanup After Tests

1. Delete all test users created during test execution
2. Clean up any test virtual folders
3. Reset any modified user settings
4. Clear test data from database

### Known Limitations

1. Purge operation is permanent and cannot be undone
2. Bulk purge uses individual mutations (no batch mutation yet)
3. Active users cannot be purged directly (must deactivate first)
4. Some fields may not be available depending on Backend.AI server version

---

## Related Documentation

- User Management Guide: `webui.docs.backend.ai/en/latest/admin_menu/admin_menu.html`
- GraphQL Schema: `/data/`
- Component Source:
  - UserManagement: `/react/src/components/UserManagement.tsx`
  - UserSettingModal: `/react/src/components/UserSettingModal.tsx`
  - PurgeUsersModal: `/react/src/components/PurgeUsersModal.tsx`

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-30 | 1.0 | Initial test plan created |
