# BrandingPage

- Route: `/admin/branding` (menu "Branding"), superadmin only; the menu item hides during theme preview.
- Admin settings for the WebUI theme and branding (`components/BrandingSettingList`), including the JSON config preview / apply flow.
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
