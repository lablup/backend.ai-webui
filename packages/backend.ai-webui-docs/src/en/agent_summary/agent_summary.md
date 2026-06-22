# Agent Summary

The Agent Summary page gives you a read-only overview of the compute **agents** (agent nodes) available to your project and how their resources are currently allocated. Use it to check how much CPU, memory, and accelerator capacity remains before you create a compute session.

The page appears under the **Metrics** menu group when the server's `hideAgents` configuration is disabled. From 22.09, Backend.AI WebUI can also expose partial agent-node information to non-admin users when the server is configured to allow it.

![](../images/agent_summary.png)
<!-- TODO: Optional re-capture of agent_summary.png — remove dev toolbar at bottom -->

:::note
Depending on the server configuration, the Agent Summary feature may not be available. In that case, please contact the administrator of your system.
:::

## Filtering and Status

The toolbar above the list lets you narrow down which agents are shown:

- **Status toggle**: Switch between **Connected** and **Terminated** agents. The list shows **Connected** agents by default.
- **ID**: Filter the list by agent ID.
- **Schedulable**: Filter by whether the agent can accept new sessions — choose **Enabled** or **Disabled**.
- **Refresh**: Click the **Refresh** button to reload the list with the latest agent data.

## Columns

The agent list displays the following columns:

- **ID**: The unique identifier of the agent. This column is sortable.
- **Architecture**: The CPU architecture of the agent (for example, `x86_64`).
- **Allocation**: The occupied and available capacity for each resource slot on the agent, shown with a utilization progress bar.
   * CPU is shown as the number of cores, memory in GiB, and any accelerators (such as GPU or fGPU) present on the agent are listed as additional slots.
   * The progress bar turns red when utilization exceeds 80%.
- **Resource Group**: The resource group the agent belongs to. This column is sortable.
- **Schedulable**: Whether the agent can accept new sessions. A check icon indicates the agent is schedulable, while a dimmed minus icon indicates it is not. This column is sortable.

You can customize which columns are visible and their order using the column-settings gear at the bottom right of the table. Hidden columns and column order are remembered for your next visit.

:::note
Agents that belong to SFTP-dedicated resource groups are automatically excluded from this list, so storage-only agents do not appear here.
:::

To plan resource allocation before launching a session, review the available capacity here and then continue to the [Session Page](#session-page).
