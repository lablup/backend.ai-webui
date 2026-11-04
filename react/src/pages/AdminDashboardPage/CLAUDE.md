# AdminDashboardPage

- Route: `/admin/dashboard` (no sider menu item; reached by URL only), superadmin only.
- Board of admin panels: session counts, agent stats, active agents, recently created sessions, total resources within a resource group.
- Shares those panels with `DashboardPage`; `TotalResourceWithinResourceGroup` is also rendered by `ComputeSessionListPage`'s `components/ConfigurableResourceCard`.
- Still reads the ambient current project, so it is excluded from the ADR 0001 project-agnostic ESLint block.
- Shares `ActiveAgents`, `AgentStats`, `RecentlyCreatedSession`, `SessionCountDashboardItem` and `TotalResourceWithinResourceGroup` with `DashboardPage`; they stay in `react/src/components` until ADR 0024 section 3 moves them.
