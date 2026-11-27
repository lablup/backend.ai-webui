# InformationPage

- Route: `/admin/information` (menu "Information"), superadmin only.
- Read-only system information: manager and API versions, security checks, component versions (Docker, PostgreSQL, ETCD, Redis) and the enterprise license (`baiClient.enterprise.getLicense()`).
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
