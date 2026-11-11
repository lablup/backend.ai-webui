# DeploymentDetailPage

- Serves three routes: `/project/:projectName/deployments/:deploymentId`, `/project/:projectName/admin/deployments/:deploymentId` and `/admin/deployments/:deploymentId`; respectively any project member, project admins of that project, plus superadmin members by URL (`access: 'projectAdmin'`), and superadmin only.
- Detail of one model deployment: basic info, current revision, replicas, auto-scaling rules and access tokens, each a card in `components/`.
- Because it serves several URL spaces it is the sanctioned page-level reader of the ambient project (ADR 0001) and is excluded from the project-agnostic ESLint block.
- `DeploymentRevisionDetailDrawer` is used by other deployment pages and stays in `react/src/components`.
