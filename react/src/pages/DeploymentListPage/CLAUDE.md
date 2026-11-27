# DeploymentListPage

- Route: `/project/:projectName/deployments` (menu "Deployments"), any logged-in project member.
- The current project's model deployments, with create / edit (`DeploymentSettingModal`) and the revision detail drawer.
- Its project-admin twin is `ProjectAdminDeploymentsPage`; a row opens `DeploymentDetailPage`.
- `components/WebMCPDeploymentTools` (the WebMCP read tools, ADR 0025) is shared with `DeploymentDetailPage`.
