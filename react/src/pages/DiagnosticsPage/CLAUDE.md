# DiagnosticsPage

- Route: `/admin/diagnostics` (menu "Diagnostics"), superadmin only.
- Collapsible checks of the deployment: endpoint, web server config, storage proxies and Content-Security-Policy, one section each in `components/`.
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
