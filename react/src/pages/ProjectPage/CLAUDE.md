# ProjectPage

- Route: `/admin/project` (menu "Projects"), superadmin only.
- Admin list of projects with create / edit, activation status and project-admin settings (`components/ProjectAdminSettingModal`).
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
