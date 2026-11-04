# AdminVFolderNodeListPage

- Route: `/admin/data` (menu "Data" in the admin group), superadmin only.
- Admin list of storage folders across users and projects, with the active / trash split, create, move-to-trash, restore and delete-forever.
- Its user-facing twin is `VFolderNodeListPage`; both read the trash split through `helper/vfolderStatus`.
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
