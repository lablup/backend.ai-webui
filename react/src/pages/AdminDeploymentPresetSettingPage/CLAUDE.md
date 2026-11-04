# AdminDeploymentPresetSettingPage

- Routes: `/admin/deployments/deployment-presets/new` and `/admin/deployments/deployment-presets/:presetId/edit`, superadmin only.
- Full-page form that creates or edits a deployment revision preset; the form itself is `components/AdminDeploymentPresetSettingPageContent`.
- The form types (`AdminDeploymentPresetFormTypes`) are also imported by `DeploymentDetailPage`'s `components/DeploymentAddRevisionModal`, and stay in `react/src/components`.
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
