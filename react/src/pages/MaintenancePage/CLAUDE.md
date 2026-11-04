# MaintenancePage

- Route: `/admin/maintenance` (menu "Maintenance").
- Superadmin maintenance tasks (`components/MaintenanceSettingList`), the data retention policy (`components/AdminRetentionPolicy`) and client IP masking policies (`components/AdminClientIpMaskingPolicyList`).
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
