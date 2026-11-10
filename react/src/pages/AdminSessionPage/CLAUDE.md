# AdminSessionPage

- Route: `/admin/session` (menu "Sessions" in the admin group), `access: 'admin'`.
- Tabbed host for the admin session list (`components/AdminComputeSessionList`, lazy-loaded) and the pending-session queue (`components/PendingSessionNodeList`).
- The session list shows compute sessions across users and projects, with status filters, resource summary and terminate actions. Its user-facing twin is `ComputeSessionListPage`; the shared table code (`SessionNodes`) stays in `react/src/components`.
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
