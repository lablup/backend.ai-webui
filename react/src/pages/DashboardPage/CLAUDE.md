# DashboardPage

- Route: `/project/:projectName/dashboard` (menu "Dashboard"), any logged-in project member; preloaded by `react/src/preload.ts`.
- User dashboard board whose panels can be edited, added and rearranged (edit mode toggle in `react/src/components/DashboardEditToggleButton`, shared with the panel framework).
- The panel framework `react/src/components/DashboardPanels/` is not page-only: `hooks/useBAISetting.tsx` and the session monitor import it.
- Shares `ActiveAgents`, `AgentStats`, `RecentlyCreatedSession`, `SessionCountDashboardItem` and `TotalResourceWithinResourceGroup` with `AdminDashboardPage`; `TotalResourceWithinResourceGroup` is also rendered by `ComputeSessionListPage`'s `components/ConfigurableResourceCard`.
