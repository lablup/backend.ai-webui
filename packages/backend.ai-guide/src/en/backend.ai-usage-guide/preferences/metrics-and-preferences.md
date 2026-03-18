---
title: Metrics
order: 88
---
# Metrics and Preferences

Backend.AI provides a **Statistics** page where you can review your resource usage history and session activity. This page helps you understand how your compute resources have been utilized over time and assists with capacity planning.

## Resource Usage Statistics

The Statistics page displays aggregated metrics about your resource consumption, including:

- **CPU usage** -- Total CPU hours consumed across your sessions
- **Memory usage** -- Peak and average memory consumption
- **AI accelerator usage** -- GPU hours and accelerator utilization over time
- **Session count** -- Number of sessions created during the selected time period

![](../../../images/statistics_page.png)
<!-- TODO: Capture screenshot of Statistics page -->

These metrics are useful for tracking resource consumption patterns and identifying opportunities to optimize your usage.

:::note
Superadmins can view aggregated statistics across all users and projects. Regular users can only view their own usage data.
:::

## Session History

You can review your completed sessions to analyze past workloads. The **Finished** tab on the **Sessions** page shows a list of terminated sessions along with their resource allocation, elapsed time, and termination reason.

This historical data helps you:

- Identify sessions that were terminated due to idle checks
- Review resource allocation for completed training jobs
- Track your session usage over time

## User Preferences

Backend.AI allows you to customize various aspects of the interface through the **User Settings** page. You can access User Settings from the sidebar menu or by clicking the user icon in the header.

Common preference settings include:

- **Desktop notification**: Enable or disable browser notifications for session events
- **Session launcher style**: Choose between the NEO (step-by-step) launcher and the classic dialog-style launcher
- **Language**: Set your preferred interface language
- **Theme**: Switch between light and dark themes

:::tip
Adjusting your User Settings can improve your workflow efficiency. For example, enabling desktop notifications ensures you are alerted when a batch session completes or when a session is about to be terminated by an idle check.
:::

## Related Pages

- [Sessions](../workload/sessions/session-management.md) -- Managing compute sessions
- [How to Manage Existing Sessions](../workload/sessions/how-to-existing-sessions.md) -- Monitoring running sessions and resource usage
