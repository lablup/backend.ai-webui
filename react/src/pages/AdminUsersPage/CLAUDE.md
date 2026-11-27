# AdminUsersPage

- Route: `/admin/users` (menu "Users"; legacy `/credential`), `access: 'admin'`.
- Tabs for user management (`components/AdminUserManagement`) and credentials / keypairs (`components/AdminUserCredentialList`), with the tab kept in the URL.
- Deleting or purging users is irreversible and must use `BAIDeleteConfirmModal` with typed confirmation (`.claude/rules/destructive-confirmation.md`).
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
