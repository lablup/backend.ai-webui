<a id="rbac-management"></a>

# RBAC Management

RBAC (Role-Based Access Control) Management allows superadmins to define roles with fine-grained permissions and assign them to users. With RBAC, you can control which actions specific users are allowed to perform on various resources throughout the Backend.AI system.

:::note
RBAC Management is only available to superadmins and requires Backend.AI Manager version 26.4.0 or later.
:::

To access the RBAC Management page, click **RBAC Management** in the **Admin Settings** section of the sidebar menu.

![](../images/rbac_role_list_page.png)

<a id="role-list"></a>

## Role List

The Role List page displays all roles in a table format. You can filter, search, and sort roles using the controls at the top of the page.

- **Status filter**: A segmented control to toggle between **Active** and **Inactive** roles. Active is selected by default.
- **Name search**: A property filter to search roles by name or filter by source (System or Custom). The filter input adapts to the selected property — for example, the **Source** filter exposes the available values (System / Custom) as a typed selector rather than a free-form text box, while the **Name** filter accepts free text.
- **Create Role**: A button to create a new custom role.

The table displays the following columns:

- **Role Name**: The name of the role. Click the name to open the role detail drawer.
- **Description**: A brief description of the role's purpose.
- **Scope Type**: The scope type of the role's first assigned scope, with a `+N` indicator when the role has multiple scopes.
- **Scope ID**: The raw scope ID of the role's first assigned scope, with a `+N` indicator when the role has multiple scopes.
- **Source**: Indicates whether the role is **System** (pre-defined) or **Custom** (user-created).
- **Auto Assign**: Indicates whether the role is automatically assigned to a user when they are added to a scope the role is registered in. Displays **Active** when auto-assignment is enabled, or **Inactive** when disabled.
- **Created At**: The date and time when the role was created.
- **Updated At**: The date and time when the role was last modified.

You can sort the table by clicking the **Role Name**, **Created At**, or **Updated At** column headers. Use the column visibility gear button on the right side of the table header to show or hide individual columns. The refresh button next to **Create Role** reloads the list with the latest data; a refresh button is also available in the role detail drawer and on each of its tabs.

:::note
Requires Backend.AI Manager 26.4.4 or later for the **Auto Assign** column to appear.
:::

### System vs Custom Roles

Roles are categorized into two source types:

- **System**: Automatically generated roles. You cannot edit their name or description, but you can manage their user assignments and permissions.
- **Custom**: Roles created by superadmins. These are fully editable, including name, description, assignments, scopes, and permissions.

<a id="activate-and-deactivate-roles"></a>

## Activate and Deactivate Roles

A role can be either **Active** or **Inactive**. Deactivating a role is a reversible, soft-delete-style action: the role is hidden from the Active list but is preserved and can be restored at any time by reactivating it. Use the **Status filter** at the top of the Role List to switch between Active and Inactive roles.

Lifecycle actions are exposed as hover actions on the **Role Name** cell. Hover over a role row to reveal the action icons next to the role name.

![](../images/rbac_role_row_actions.png)
<!-- TODO: Capture screenshot of rbac_role_row_actions.png — Role Name cell hover actions on an active role row showing the Deactivate (ban) icon -->

To deactivate an active role:

1. With the **Status filter** set to **Active**, hover over the role row you want to deactivate.
2. Click the **Deactivate** action (ban icon) next to the role name.
3. In the confirmation popup, click **Deactivate** to confirm, or **Cancel** to dismiss.

The role moves to the Inactive list. To see it again, set the **Status filter** to **Inactive**.

When the **Status filter** is set to **Inactive**, each role row exposes two hover actions: **Activate** (undo icon) and **Purge Role** (delete icon).

![](../images/rbac_inactive_role_actions.png)
<!-- TODO: Capture screenshot of rbac_inactive_role_actions.png — Role Name cell hover actions on an inactive role row showing the Activate (undo) and Purge Role (delete) icons -->

To reactivate an inactive role:

1. Set the **Status filter** to **Inactive** and hover over the role row.
2. Click the **Activate** action (undo icon) next to the role name.
3. In the confirmation popup, click **Activate** to confirm, or **Cancel** to dismiss.

The role returns to the Active list with its scopes, permissions, and user assignments intact.

## Purge a Role (Permanent Deletion)

Purging permanently removes a role from the system. Unlike deactivation, purging cannot be undone.

:::danger
Purging a role is **irreversible**. The role and its configuration are permanently deleted and cannot be recovered. Deactivate a role instead if you only need to temporarily disable it.
:::

The **Purge Role** action is available only for **Inactive** roles. If a role is currently active, deactivate it first (see [Activate and Deactivate Roles](#activate-and-deactivate-roles)).

To purge an inactive role:

1. Set the **Status filter** to **Inactive** and hover over the role row.
2. Click the **Purge Role** action (delete icon) next to the role name.
3. In the confirmation modal, type the exact role name into the input field to confirm. The **Purge Role** button stays disabled until the typed name matches.
4. Click **Purge Role** to permanently delete the role, or **Cancel** to dismiss.

![](../images/rbac_purge_role_modal.png)
<!-- TODO: Capture screenshot of rbac_purge_role_modal.png — Purge Role typed-name confirmation modal -->

:::warning
A role can only be purged after all of its user assignments and permissions have been removed. If any remain, the purge fails with the message *"Cannot purge this role. Please remove all assignments and permissions first."* Remove the role's [permissions](#manage-permissions) and [user assignments](#manage-user-assignments) before purging.
:::

## Create a Role

Creating a role requires you to define its **scopes** upfront. A scope binds the role to a specific resource entity (such as a domain, project, or user) so that every permission you later add to the role is confined to the scopes defined here.

To create a new custom role:

1. Click the **Create Role** button at the top right of the Role List page
2. In the creation modal, fill in the following fields:
   - **Role Name** (required): Enter a unique name for the role
   - **Description** (optional): Enter a description of the role's purpose
   - **Auto Assign** (optional): When enabled, the role is automatically granted to users when they are added to a scope the role is registered in. Disabled by default.
   - **Scope Type / Target** (required, at least one): For each scope row, select a **Scope Type** and then choose the specific **Target** within that scope type. Click **Add** to add more scope rows, or the delete icon to remove a row. You must add at least one scope.
3. Click **OK** to create the role

![](../images/rbac_create_role_modal.png)

:::info
Scopes are defined at role creation time and cannot be edited afterwards through the role detail drawer. Plan the scopes carefully before creating the role.
:::

### Scope Types

A scope type determines the kind of resource entity a scope binds the role to. Depending on your deployment, the following scope types can be selected when creating a role:

- **Domain**: Select from a list of active domains
- **Project**: Select a project (with domain filtering)
- **User**: Search for a user by email or name
- **Folder**: Select a storage folder
- **Resource Group**: Select a resource group
- **Session**: Select a compute session
- **Model Service**: Select a model service
- **Container Registry**: Select a container registry
- **Storage Host**: Select a storage host
- **Keypair**: Select a keypair

:::note
The list of available scope types is determined by the Backend.AI Manager — only scope types that have at least one actionable entity are shown. As a result, the exact set of selectable scope types may vary by version and deployment, and may differ from the list above.
:::

## View Role Details

To view detailed information about a role, click the role name in the table. A detail drawer opens on the right side of the page.

The drawer header displays the role name and provides an **Edit** button for custom roles. The detail section shows the following metadata:

- **Source**: System or Custom
- **Status**: Active or Inactive
- **Auto Assign**: Whether auto-assignment is Active or Inactive. When Active, the role is automatically granted to users added to one of its registered scopes.
- **Created At**: The creation timestamp
- **Updated At**: The last modification timestamp
- **Description**: The role's description

Below the metadata, three tabs are available: **Scopes**, **Permissions**, and **Role Assignments**.

![](../images/rbac_role_detail_drawer.png)

### Edit a Role

To edit a custom role's name, description, or auto-assignment setting:

1. Open the role detail drawer by clicking a role name in the table
2. Click the **Edit** button (pencil icon) in the drawer header
3. Modify the following fields in the edit modal:
   - **Role Name**: The name of the role
   - **Description**: A description of the role's purpose
   - **Auto Assign**: When enabled, the role is automatically granted to users added to a scope the role is registered in. This field is available only on Backend.AI Manager 26.4.4 or later.
4. Click **OK** to save the changes

![](../images/rbac_edit_role_modal.png)
<!-- TODO: Recapture rbac_edit_role_modal.png so the Auto Assign checkbox is visible -->

:::note
The Edit button is only available for Custom roles. System roles cannot have their name or description modified. Scopes cannot be modified after role creation in either case.
:::

## View Role Scopes

The **Scopes** tab in the role detail drawer lists the scope entries that were assigned to the role at creation time. Each entry constrains the set of targets that permissions on this role can reference.

![](../images/rbac_role_scope_tab.png)

The table displays the following columns:

- **Scope Type**: The type of the scope entry (e.g., Domain, Project, User).
- **Target**: The human-readable name of the scope target (e.g., the domain name, project name, or user email).
- **Scope ID**: The UUID of the scope target.

Use the filter control at the top to narrow down scope entries by **Scope Type**.

:::note
Scopes are read-only in this tab. To change a role's scopes, you must create a new role with the desired scopes.
:::

<a id="manage-permissions"></a>

## Manage Permissions

The **Permissions** tab in the role detail drawer shows the fine-grained permissions configured for the role.

![](../images/rbac_permissions_tab.png)

### Understanding Permissions

Each permission consists of four components:

- **Scope Type**: The type of resource that the permission targets (e.g., Domain, Project, User)
- **Target**: The specific entity within the scope type (e.g., a specific domain name, a specific project)
- **Permission Type**: The category of resource the permission controls, filtered based on the selected scope type. Available permission types include **Domain**, **Project**, **User**, **Session**, **Folder**, **Model Service**, **Resource Group**, and **Image**, among others. The exact set depends on the selected scope type and your deployment.
- **Permission**: The operation allowed on the resource. Only valid operations for the selected permission type are shown. Operations are grouped into two categories:
   * **Direct**: Create, Read, Update, Soft Delete, Hard Delete
   * **Delegate to Others**: Delegate All, Delegate Read, Delegate Update, Delegate Soft Delete, Delegate Hard Delete

:::info
The combined **Scope Type / Target** of each permission is inherited from the role's scope entries. When you add a permission, you can only pick from the scopes that were defined when the role was created. To broaden a role's reach, create a new role with additional scopes.
:::

### Permission Examples

Here are some common permission configurations to help you understand how the four components work together. The **Scope Type / Target** column shows the role-level scope that the permission reuses.

| Scenario | Scope Type / Target | Permission Type | Permission |
|----------|---------------------|----------------|------------|
| Allow a user to create storage folders in a specific project | Project / my-project | Folder | Create |
| Allow a user to view all sessions in a domain | Domain / default | Session | Read |
| Allow a user to manage model services | Domain / default | Model Service | Create, Read, Update |
| Allow a user to delete container images | Domain / default | Image | Soft Delete |

<a id="add-a-permission"></a>

### Add a Permission

1. Open the role detail drawer and select the **Permissions** tab
2. Click the **Add Permission** button
3. In the modal, fill in the following fields:
   - **Scope Type / Target**: Select one of the scope entries that were assigned to the role. The dropdown lists only scopes that have at least one actionable entity. The target is shown by its resolved, localized name (for example, the domain or project's display name) rather than its raw UUID, so you can recognize the scope at a glance.
   - **Permission Type**: Select the entity type. Only valid types for the selected scope type are shown. Permission type labels (such as **Role Assignment**) are localized to match your UI language.
   - **Permission**: Select the operation (e.g., Create, Read, Update, Soft Delete, Hard Delete, or delegation operations)
4. Click **Add** to create the permission

![](../images/rbac_permission_modal.png)

:::note
The filter controls in the permissions list now use input types tailored to each filter property — selectors for enumerated values (such as Permission Type, Permission), and free text for name-style fields — making it faster to narrow the list to the entries you care about.
:::

:::note
If a role was created without any scopes (for example, a legacy role imported from an earlier version), the **Add Permission** modal falls back to showing separate **Scope Type** and **Target** fields so that administrators can still configure the permission target.
:::

### Edit a Permission

You can modify an existing permission without removing and re-adding it.

1. In the **Permissions** tab, hover over the permission row you want to change and click the **Edit** action (pencil icon).
2. The same modal used to add a permission opens, pre-filled with the current values. Adjust the **Scope Type / Target**, **Permission Type**, and **Permission** as needed.
3. Click **Save** to apply your changes.

![](../images/rbac_edit_permission_modal.png)
<!-- TODO: Capture screenshot of rbac_edit_permission_modal.png — Edit Permission modal showing the Edit Permission title and the Save button -->

The editable fields are identical to those in [Add a Permission](#add-a-permission); only the modal title (**Edit Permission**) and the confirmation button (**Save**) differ.

### Remove a Permission

1. In the **Permissions** tab, click the **Remove Permission** button next to the permission you want to remove
2. A small confirmation popup appears anchored to the button. Click **OK** to confirm, or **Cancel** to dismiss.

Removing a permission from a role only detaches it from the role's permission set — the role itself, its scopes, and its user assignments are kept. You can add the same permission back later from the same tab, so this action is treated as reversible and uses a lightweight popup confirmation rather than a typed-name confirmation modal.

<a id="manage-user-assignments"></a>

## Manage User Assignments

The **Role Assignments** tab in the role detail drawer shows which users are assigned to the role.

![](../images/rbac_assignments_tab.png)

<a id="add-users-to-a-role"></a>

### Add Users to a Role

1. Open the role detail drawer and select the **Role Assignments** tab
2. Click the **Add User** button
3. In the modal, search for users by email or name
4. Select one or more users using the checkboxes
5. Click **Add** to assign the selected users to the role

![](../images/rbac_add_user_modal.png)

Adding users is a bulk operation — you can select several users in a single pass and assign them all at once.

:::note
If some of the selected users cannot be assigned, the assignment continues for the rest. A summary message reports how many users failed, and a separate error notification appears for each failed user describing the reason.
:::

<a id="revoke-users-from-a-role"></a>

### Revoke Users from a Role

You can revoke a single user or several users at once.

To revoke a single user:

1. In the **Role Assignments** tab, hover over the user row and click the revoke (trash) icon next to the user.
2. A **Revoke User** confirmation modal opens. Review the listed user(s) and click **Revoke User** to confirm, or **Cancel** to dismiss.

![](../images/rbac_revoke_popconfirm.png)

To revoke multiple users at once:

1. In the **Role Assignments** tab, use the checkboxes to select the users you want to remove. A selection-count label appears next to the revoke control showing how many rows are selected; use the clear-selection control on that label to deselect all rows.
2. Click the bulk **Revoke User** button (trash icon) that appears once one or more rows are selected.
3. In the **Revoke User** confirmation modal, review the listed users and click **Revoke User** to confirm, or **Cancel** to dismiss.

![](../images/rbac_bulk_revoke_selection.png)
<!-- TODO: Capture screenshot of rbac_bulk_revoke_selection.png — Role Assignments tab with multiple rows selected, showing the selection-count label and the bulk Revoke User control -->

Revoking a user removes only that user's assignment to this role; the role itself and its other assignments remain unchanged.

:::note
If some of the selected users cannot be revoked, the operation continues for the rest. A summary message reports how many users failed, and a separate error notification appears for each failed user describing the reason.
:::

:::note
Revoking a role assignment can be reversed by re-adding the user to the role from the **Role Assignments** tab.
:::

<a id="grant-project-admin"></a>

## Grant Project Admin Authority

Creating a project also creates a dedicated role named `project-<project_id>-admin`, where `<project_id>` is the UUID of that project. Assigning a user to this role grants them [Project Admin](#project-admin-features) authority over that specific project — they can manage the project's users, sessions, deployments, and storage folders without holding system-wide superadmin privileges.

![](../images/rbac_project_admin_role_in_list.png)

To grant Project Admin authority to a user:

1. Open the [Role List](#role-list) and locate the `project-<project_id>-admin` role for the target project. Use the property filter to search by role name (e.g. enter `project-` to narrow the list).
2. Click the role name to open the role detail view.
3. Follow [Add Users to a Role](#add-users-to-a-role) on this role to assign the user.

![](../images/rbac_project_admin_role_detail.png)

The user gains Project Admin authority immediately. The next time they open the header's project dropdown they will see the project-admin badge next to the corresponding project, and the project-admin sidebar entries described in the [Project Admin Features](#project-admin-features) chapter.

To revoke Project Admin authority, follow [Revoke Users from a Role](#revoke-users-from-a-role) on the same `project-<project_id>-admin` role.
