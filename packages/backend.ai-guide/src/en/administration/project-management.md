---
title: Project Management
order: 158
---
# Project Management

The Project Management page provides superadmins with a comprehensive interface for creating, editing, and managing all projects across every domain in the Backend.AI cluster. In Backend.AI, a *project* is the primary organizational unit within a domain. Users can belong to multiple projects, and each project can have its own resource policies, storage folders, and member configurations.

You can access this page by selecting **Projects** from the administration section in the sidebar menu.

![](../images/project_management_page.png)
<!-- TODO: Capture screenshot of the Project Management page -->

:::note
The Project Management page is available only to users with the superadmin role. Domain admins manage projects within their own domain through separate interfaces.
:::

## Project List

The main view displays a paginated, sortable table of all projects in the system. Each row includes the following information:

- **Project Name**: The display name of the project.
- **Domain**: The domain to which the project belongs.
- **Project ID**: The unique internal identifier for the project.
- **Resource Policy**: The resource policy currently assigned to the project.
- **Active Status**: Whether the project is currently active or inactive.
- **Controls**: Action buttons for editing or managing the project.

![](../images/project_list_table.png)
<!-- TODO: Capture screenshot of the project list table -->

### Sorting and Pagination

You can sort the project list by clicking on any column header. Click once to sort in ascending order, and click again to sort in descending order. The pagination controls at the bottom of the table allow you to navigate between pages when the number of projects exceeds the page size.

### Filtering Projects

The property filter at the top of the table allows you to narrow down the project list based on multiple criteria. You can filter by:

- **Name**: Search by project name.
- **Domain**: Filter projects belonging to a specific domain.
- **Active Status**: Show only active or inactive projects.
- **Resource Policy**: Filter by the assigned resource policy.
- **Project ID**: Search by the unique project identifier.

![](../images/project_filter.png)
<!-- TODO: Capture screenshot of the project filter controls -->

To apply a filter:

1. Click the filter control at the top of the project list.
2. Select the filter property (e.g., Domain, Active Status).
3. Enter or select the filter value.
4. The table updates automatically to show matching projects.

You can combine multiple filters to narrow results further.

## Create a New Project

To create a new project:

1. Click the **+ Create** button at the top of the project list.
2. Fill in the required fields in the creation dialog:
   - **Project Name**: Enter a descriptive name for the project.
   - **Domain**: Select the domain under which the project will be created.
   - **Resource Policy**: Optionally assign a project resource policy. You can configure resource policies on the [Resource Policies](#resource-policies) page.
   - **Description**: Optionally add a description for the project.
3. Click **Create** to save the new project.

![](../images/create_project_dialog.png)
<!-- TODO: Capture screenshot of the project creation dialog -->

:::warning
You cannot create a project with the same name within the same domain. Each project name must be unique within its domain.
:::

## Edit a Project

To modify an existing project:

1. Locate the project in the list.
2. Click the **Settings** (gear icon) button in the **Controls** column.
3. Update the desired fields in the edit dialog.
4. Click **Save** to apply the changes.

![](../images/edit_project_dialog.png)
<!-- TODO: Capture screenshot of the project edit dialog -->

You can update the following fields:

- **Project Name**: Change the display name of the project.
- **Description**: Update the project description.
- **Resource Policy**: Change the assigned project resource policy.
- **Active Status**: Activate or deactivate the project.

:::note
Deactivating a project prevents its members from creating new sessions under that project, but does not terminate existing sessions.
:::

## Bulk Edit Projects

When you need to update multiple projects at once, you can use the bulk edit feature:

1. Select projects by clicking the checkboxes in the leftmost column of each row.
2. Click the **Bulk Edit** button that appears at the top of the list.
3. In the bulk edit dialog, configure the changes you want to apply to all selected projects.
4. Click **Apply** to save the changes.

![](../images/bulk_edit_projects.png)
<!-- TODO: Capture screenshot of the bulk edit dialog -->

This feature is useful for operations such as assigning the same resource policy to multiple projects or deactivating several projects simultaneously.

## Understanding Project Membership

Users are assigned to projects by administrators. A single user can belong to multiple projects and can switch between them when creating sessions or managing storage folders. Project membership determines:

- Which resource policies apply to the user's sessions.
- Which project-level storage folders the user can access.
- Which resource groups are available for session creation.

For managing individual user accounts and their project assignments, refer to the [User Management](#user-management) page.
