# EnvironmentPage

- Route: `/admin/environment` (menu "Environments"), `access: 'admin'`.
- Admin tabs for container images (`ImageList`, shared), resource presets (`components/ResourcePresetList`) and container registries (`components/ContainerRegistryList`).
- Deleting a resource preset is irreversible and uses typed confirmation (`.claude/rules/destructive-confirmation.md`).
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
