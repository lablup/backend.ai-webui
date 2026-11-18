# DiagnosticsPage

- Route: `/admin/diagnostics` (menu "Diagnostics"), superadmin only.
- Collapsible checks of the deployment: endpoint, web server config, storage proxies, Content-Security-Policy and the app config fixture (with its one-button repair), one section each in `components/`.
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
