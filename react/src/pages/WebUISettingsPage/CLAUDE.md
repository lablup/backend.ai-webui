# WebUISettingsPage

- Route: `/admin/system-settings` (menu "System Settings"), superadmin-only (`access: 'superadmin'`); `menuBlocklist` / `menuInactivelist` can never hide it.
- Edits the WebUI settings stored under the app config `settings` key (ADR 0028): the PUBLIC document read before sign-in and the DOMAIN document read at sign-in, through `components/WebUISettingList`.
- The definition table `WEBUI_SETTING_DEFINITIONS` (`react/src/helper/webuiSettings.ts`) decides each row's scope, type and group; add a setting there, with its copy in `components/WebUISettingLabels.ts`, not on this page.
- Saves are read-modify-write on the raw scope document and change only `settings`; keys outside the table (the announcement) are carried over. Apply and Reset reload the page.
