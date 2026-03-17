---
title: Admin Sessions
order: 155
---
# Admin Sessions

The Admin Sessions page provides administrators with a centralized view of sessions that are waiting in the scheduling queue across all users and projects. Unlike the regular Sessions page, which shows only your own sessions, the Admin Sessions page aggregates pending sessions system-wide, giving you full visibility into scheduling bottlenecks and workload distribution.

You can access this page by selecting **Admin Sessions** from the administration section in the sidebar menu.

![](../images/admin_session_page.png)
<!-- TODO: Capture screenshot of the Admin Sessions page -->

:::note
The Admin Sessions page is available only to users with admin or superadmin roles. Regular users do not see this menu item.
:::

## Pending Sessions Tab

The primary view on this page is the **Pending Sessions** tab, which displays all compute sessions currently waiting in the scheduling queue. These are sessions that have been requested but have not yet been assigned to an agent node for execution.

![](../images/admin_pending_sessions.png)
<!-- TODO: Capture screenshot of the pending sessions list -->

Each entry in the pending sessions list includes the following information:

- **Session ID**: The unique identifier for the session.
- **User**: The user who created the session.
- **Project**: The project under which the session was requested.
- **Resource Group**: The resource group targeted by the session.
- **Requested Resources**: The CPU, memory, and GPU resources requested for the session.
- **Created At**: The timestamp when the session was first enqueued.
- **Status**: The current status of the session within the scheduling pipeline.

## Filter by Resource Group

You can filter the pending session list by resource group using the dropdown selector at the top of the page. This is useful when you want to focus on a specific pool of agent nodes to identify scheduling delays or resource contention within that group.

![](../images/admin_session_resource_group_filter.png)
<!-- TODO: Capture screenshot of the resource group filter dropdown -->

To filter by resource group:

1. Click the resource group dropdown at the top of the pending sessions list.
2. Select the resource group you want to inspect.
3. The list updates to show only sessions targeting the selected resource group.

## View Session Details

You can inspect the details of any pending session by clicking on a session row to open the session detail drawer. The drawer provides comprehensive information about the session configuration, including the requested environment image, resource allocation, mount points, and scheduling metadata.

![](../images/admin_session_detail_drawer.png)
<!-- TODO: Capture screenshot of the session detail drawer -->

## View Container Logs

For sessions that have progressed far enough in the scheduling pipeline, you can view container logs directly from the Admin Sessions page. This is helpful for diagnosing why a session may be stuck in a pending state or for reviewing preparation-phase output.

To view container logs:

1. Locate the session in the pending sessions list.
2. Click the log icon in the **Controls** column.
3. A log viewer dialog opens, displaying the available container logs.

![](../images/admin_session_container_logs.png)
<!-- TODO: Capture screenshot of the container log viewer -->

## Pagination

When the number of pending sessions is large, the list is paginated. You can navigate between pages using the pagination controls at the bottom of the list. This ensures the page remains responsive even when many sessions are queued.

## Common Use Cases

The Admin Sessions page is particularly useful in the following scenarios:

- **Monitoring scheduling bottlenecks**: When users report that their sessions are not starting, you can check the pending queue to see how many sessions are waiting and identify resource contention.
- **Prioritizing workloads**: By reviewing which sessions are pending and for how long, you can make informed decisions about resource allocation or adjusting scheduling weights. For fair-share scheduling configuration, refer to the [Scheduler](#scheduler) page.
- **Diagnosing resource shortages**: If many sessions are pending in a specific resource group, it may indicate that additional agent nodes are needed. You can verify agent node status on the [Resources](#resources) page.
- **Auditing user activity**: Administrators can review pending sessions across all users to ensure fair access to compute resources.

:::warning
Sessions that remain in the pending state for an extended period may eventually be canceled if a pending timeout is configured for the resource group. You can configure the pending timeout in the resource group settings on the [Resources](#resources) page.
:::
