# ResourcePolicyPage

- Route: `/admin/resource-policy` (menu "Resource Policies"), `access: 'admin'`.
- Tabs for keypair, user and project resource policies. Each kind has a legacy list (`*ResourcePolicyList`) and a V2 list (`*ResourcePolicyV2`) in `components/`; the page picks one per tab from the connected manager version (`supportsV2`).
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
