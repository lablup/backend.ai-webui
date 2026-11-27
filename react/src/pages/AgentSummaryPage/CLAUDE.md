# AgentSummaryPage

- Route: `/project/:projectName/agent-summary` (menu "Agent Summary"), any logged-in project member; the menu item shows only when config `hideAgents` is false (default true), the route itself is not gated.
- Read-only summary of agent nodes and their resource usage for users who cannot open the admin Resources page (`components/AgentSummaryList`).
