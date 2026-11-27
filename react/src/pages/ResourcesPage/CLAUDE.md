# ResourcesPage

- Route: `/admin/agent` (menu "Resources"), superadmin only.
- Admin tabs for agent nodes (`AgentList`), resource groups (`components/ResourceGroupList`) and storage proxies (`components/StorageProxyList`). `AgentList` is imported by other components and stays in `react/src/components`.
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
