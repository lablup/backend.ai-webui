# MaintenancePage

- Route: `/admin/maintenance` (menu "Maintenance").
- Superadmin maintenance tasks (`components/MaintenanceSettingList`) and the data retention policy (`components/AdminRetentionPolicy`).
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
