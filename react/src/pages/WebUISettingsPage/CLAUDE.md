# WebUISettingsPage

- Route: `/admin/system-settings` (menu "System Settings"), superadmin-only (`access: 'superadmin'`); `menuBlocklist` / `menuInactivelist` can never hide it.
- Edits the WebUI settings stored under the app config `settings` key (ADR 0028): the PUBLIC document read before sign-in and the DOMAIN document read at sign-in, through `components/WebUISettingList`.
- The definition table `WEBUI_SETTING_DEFINITIONS` (`react/src/helper/webuiSettings.ts`) decides each row's scope, type and group; add a setting there, with its copy in `components/WebUISettingLabels.ts`, not on this page.
- "JSON Config" (`components/SettingsJsonModal`, shape and validation in `helper/settingsJson.ts`) shows the settings as `{public, domain}` JSON — saved values, else the defaults — and imports / exports that file; Apply only loads it into the draft, the page's Apply saves it. There is no config.toml import: a webserver renders its config.toml from a template, so there is no file to carry over.
- Saves are read-modify-write on the raw scope document and change only `settings`; keys outside the table (the announcement) are carried over. Apply and Reset reload the page.
- The Configurations tab (`?tab=configurations`, `components/ConfigurationsSettingList` and its two modals) replaced the old `/admin/settings` page, which now redirects here; the `settings` menu key still governs that tab.
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.
