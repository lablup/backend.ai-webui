# ProjectAdminDeploymentsPage

- Route: `/project/:projectName/admin/deployments` (menu "Deployments" in the project admin group), project admins of that project, plus superadmin members by URL (`access: 'projectAdmin'`).
- A project admin's view of every deployment in the project; a row opens `DeploymentDetailPage` under `/project/:projectName/admin/deployments/:deploymentId`.
- Its member-facing twin is `DeploymentListPage`.
