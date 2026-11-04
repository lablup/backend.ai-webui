# RBACManagementPage

- Route: `/admin/rbac` (menu "RBAC Management"), superadmin only.
- Roles and role presets: role list (`components/RoleNodes`), role form, role detail drawer and the role preset tab.
- RBAC reads stay on `admin*` fields (ADR 0012).
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
- Shared with `ProjectPage`: `helper/roleAssignment` (the "already holds the role" check of a bulk role grant), imported by its `components/ProjectAdminSettingModal`.
