# 0025 — WebUI settings in the app config settings key

## Summary

> Unfamiliar terms are collected in the [Glossary](#glossary) at the end.

- Administrators change the 53 WebUI settings that lived only in `config.toml` on the System Settings page (`/admin/system-settings`). The values are stored in the manager's [app config](#glossary) documents.
- Each [scope](#glossary) document carries one flat key, `settings`. The 10 keys needed before sign-in live in `publicConfigByDomain.<domain>.settings`; the 43 used after sign-in live in `domainConfig.settings`.
- The two documents hold different keys. Only a key the document carries, with the right type, overrides the `config.toml` value; with no document, or a document that cannot be read, the file value is used.
- `config.toml` stays the default for every setting. Values needed before the documents can be read, and values the webserver enforces as well, stay in the file only.
- The scope and type of each key are set by the [definition table](#glossary) `WEBUI_SETTING_DEFINITIONS` in `react/src/helper/webuiSettings.ts`. The page, the merge and the save all read that table.

## Context

- **What existed**: WebUI settings such as hidden menus, session resource caps and login page options lived only in `config.toml`. Changing one meant editing the deployment file and redeploying, and every domain a webserver served used the same values.
- **What app config is**: the manager's store of per-scope JSON documents. The webui already keeps the theme (`publicConfigByDomain.<domain>.appearance`) and the announcement (`domainConfig.announcement`) there. The PUBLIC document is read anonymously before sign-in over REST (`POST /func/v2/app-config/public/get`).
- **Why a decision is needed**: the settings move from a deployment file to manager documents, and the person who changes them moves from whoever deploys to an administrator. Without a fixed document shape, key names, relation to the file and list of file-only keys, every feature would add its own sub-key.

## Diagram

### Order in which a value is decided

```mermaid
flowchart LR
  toml["config.toml"]
  pub["publicConfigByDomain.&lt;domain&gt;.settings"]
  dom["domainConfig.settings"]
  state["loginConfigState (Jotai)"]
  client["backendaiclient._config"]
  toml -- "every key, parsed by refreshConfigFromToml" --> state
  pub -- "10 public keys, before sign-in" --> state
  dom -- "43 domain keys, at sign-in" --> state
  state -- "applyConfigToClient" --> client
```

### Saving

```mermaid
flowchart LR
  page["WebUISettingList<br/>draft: keys that differ from the file"]
  dset["domainConfig.settings"]
  pset["publicConfigByDomain.&lt;domain&gt;.settings<br/>superadmin only"]
  page -- "domain keys of the draft" --> dset
  page -- "public keys of the draft" --> pset
```

## Decision

### 1. One flat `settings` key per scope

| Scope  | Document path                            | Read         | Keys                                                                                                                                                                                                                        |
| ------ | ---------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PUBLIC | `publicConfigByDomain.<domain>.settings` | before login | `autoLogout`, `allowChangeSigninMode`, `allowAnonymousChangePassword`, `allowSignupWithoutConfirmation`, `enableInteractiveLoginAccountSwitch`, `singleSignOnVendors`, `ssoRealmName`, `debug`, `pluginLogin`, `pluginPage` |
| DOMAIN | `domainConfig.settings`                  | at sign-in   | the other 43 keys of the definition table                                                                                                                                                                                   |

- **Document shape**: the value of `settings` is a `WebUISettingsDocument` (`Record<string, unknown>`), with no section or group level inside it. The page groups come only from the definition table's `group` field.
- **Key names**: a key is named as in `config.toml`. The exceptions are `menuBlocklist`/`menuInactivelist` (the file's `menu.blocklist`/`inactivelist`), `fasttrackEndpoint` (the file's `pipeline.frontendEndpoint`) and `pluginLogin`/`pluginPage` (the file's `plugin.login`/`page`). A comma-joined string in the file is an array of strings.
- **Public scope criterion**: only the keys the login page uses, and keys applied once before sign-in (`debug`, and `pluginPage`, loaded once at boot), are PUBLIC.
- **Domain lookup**: the `<domain>` of the PUBLIC document is `general.apiDomainName` in `config.toml` (`resolvePublicConfigTarget`).
- **Write scope**: a save changes the `settings` sub-key only, never the whole document. The write hooks (`useUpdateDomainAppConfig`, `useUpdatePublicDomainAppConfig`) re-read the manager's raw document and change `settings` alone ([read-modify-write](#glossary)).

### 2. Merge rules

- **File first, then each document**: the state starts from the `config.toml` values, and `applyWebUISettings(state, doc, scope)` overrides only that scope's keys. Keys of another scope, keys missing from the definition table, and values that fail `isValidWebUISettingValue` are ignored, so the PUBLIC and DOMAIN documents never overlap.
- **Option-limited lists**: a `stringList` definition with `options` drops values outside the list, both when merging and when saving (`restrictToOptions`).
- **No seeding**: a save writes only the keys that differ from the file value (`buildWebUISettingsDocument`). When none differ, the `settings` sub-key is removed. An untouched key keeps following the file.
- **Read failures**: a document that cannot be read leaves a warning and the file values. The DOMAIN document rides in the sign-in query (`loginSessionAuthMyUserQuery`, `myAppConfigs … @catch(to: NULL)`, read by `readDomainWebUISettings`); the PUBLIC one comes from `fetchPublicDomainConfigOnce`.
- **Merge points**: the PUBLIC document is merged at boot (`initializeConfigOnce`) and when another webserver's config is taken in (`loadConfigFromWebServer`), which looks the document up under that webserver's `apiEndpoint` and merges onto the bundled `config.toml`. The DOMAIN document is merged at sign-in (`connectViaGQL`).
- **One store**: the merged values live only in `loginConfigState`. A value read outside React, such as `debug`, is read with `jotaiStore.get(loginConfigState)`; there is no `globalThis` copy. `refreshConfigFromToml`, which parses the file, has no side effects.

### 3. Keys that stay in `config.toml` only

| Key                                   | Why                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apiEndpoint`, `apiDomainName`        | They are the address and domain the documents are looked up with.                                                                                 |
| `connectionMode`                      | A webserver deployment is fixed to SESSION, and Electron has no domain to look the PUBLIC document up with.                                       |
| `signupSupport`                       | The webserver's `service.enable-signup` blocks sign-up requests on its own; changing the webui alone shows the button and the request is refused. |
| `loginAttemptLimit`, `loginBlockTime` | The browser-side login attempt limit in `LoginView`.                                                                                              |
| `[wsproxy]`, `[server]`, `[license]`  | Values for the Electron local proxy, the boot, and the About modal.                                                                               |

- **Unread keys**: the 10 file keys no code reads (`apiEndpointText`, `allowProjectResourceMonitor`, `alwaysEnqueueComputeSession`, `force2FA`, `directoryBasedUsage`, `enableImportFromHuggingFace`, `environments.allowlist`, `wsproxy.proxyBaseURL`, `wsproxy.proxyListenIP`, `pipeline.endpoint`) are not moved to the documents; #10664 removes them.

### 4. Definition table

- **Entry shape**: an entry (`WebUISettingDefinition`) has `key`, `scope`, `type` (`boolean`, `number`, `string`, `stringList`), `group`, `field` (`keyof LoginConfigState`), and the optional `options` and `unit`.
- **Single source**: the page (`WebUISettingList`), the merge (`applyWebUISettings`) and the save (`buildWebUISettingsDocument`) read only this table.
- **Adding a setting**: a new setting adds a `LoginConfigState` field, its file parsing in `refreshConfigFromToml`, its `_config` copy in `applyConfigToClient`, one table entry, and its copy in `WebUISettingLabels.ts`, together.

### 5. Who may edit, and safeguards

- **Who sees what**: the page and its menu item are superadmin-only (`access: 'superadmin'`). A superadmin sees and saves both scopes. A domain admin page is outside this decision.
- **Who may write**: whether a save succeeds is the manager's RBAC call; only a superadmin may write the PUBLIC document. A refused save lists the settings that were not saved.
- **Reset**: the toolbar's Reset removes the `settings` sub-key of the scopes on screen. It cannot be undone, so it runs only after the button's name (`button.Reset`) is typed into a `BAIDeleteConfirmModal`.
- **Self-hiding**: `system-settings` in `menuBlocklist`/`menuInactivelist` is ignored (`useWebUIMenuItems`); hiding this page would leave no screen to undo it from.

## Rejected alternatives

- **One sub-key per feature** (`session`, `appLauncher` and six more): the document would mirror the page groups. Rejected: regrouping the page would mean migrating saved documents, and finding one key would require knowing its group.
- **The `config.toml` section layout as is**: file and document would map mechanically. Rejected: sections organise hand edits of the file, and one section can span both scopes.
- **A new single document such as `siteConfig`**: one document with no scope split. Rejected: values needed before sign-in must sit in the anonymously readable PUBLIC document, per-domain values in the DOMAIN document.
- **Every key in the documents, no file**: settings in one place. Rejected: the keys in section 3 are needed before the documents can be read, or the webserver enforces the same value.
- **Seed the documents from the file at first sign-in**: the page would show every value from the documents from the start. Rejected: after seeding, a change to the deployment file would no longer take effect.

## Consequences

- **Per-domain values**: administrators change settings per domain without a redeploy, and domains served by the same webserver can differ.
- **Public means readable**: PUBLIC keys are read anonymously, so no secret goes there.
- **Reload to apply**: a value takes effect on the next page load; Apply and Reset reload the page after saving.
- **Checked table**: a definition's `field` is typed `keyof LoginConfigState`, but its default casts the `key`, so `tsc` does not catch a typo. `webuiSettings.test.ts` checks that every `field` exists on the state.

## Sources

- #10436 — the issue that moves `config.toml` into app config. The layout was decided in issue comments 6278871655 (2026-10-20) and 6280664195 (2026-10-28).
- #10438 — the implementation PR.
- #10664 — removes the unread `config.toml` keys. BA-8735 — removes the same keys from the webserver template.

## Glossary

| Term              | Meaning                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| app config        | JSON configuration documents the manager stores per scope (PUBLIC, DOMAIN, USER). Read over GraphQL after sign-in; the PUBLIC document also over REST before sign-in. |
| scope             | The range a document belongs to. The PUBLIC document is read anonymously before sign-in; the DOMAIN document is read after a user of that domain signs in.            |
| definition table  | `WEBUI_SETTING_DEFINITIONS`: an array that gives each setting key its scope, type, page group and `LoginConfigState` field.                                           |
| read-modify-write | Re-reading the raw document, changing one part, and saving the whole document, so the document's other sub-keys are kept.                                             |
