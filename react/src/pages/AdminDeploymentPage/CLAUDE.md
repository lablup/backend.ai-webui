# AdminDeploymentPage

- Route: `/admin/deployments` (menu "Deployments" in the admin group, superadmin only; breadcrumb "Serving"), a tabbed admin page.
- Tabs: deployments (`components/AdminDeployment`), deployment presets (`components/AdminDeploymentPreset`), model cards (`components/AdminModelCard`), Prometheus presets and runtime variant presets.
- Creating or editing a deployment preset navigates to `AdminDeploymentPresetSettingPage`; a deployment row opens `DeploymentDetailPage` under `/admin/deployments/:deploymentId`.
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
