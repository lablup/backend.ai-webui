# 0033 — Scoped and merged app config hooks

## Summary

> Unfamiliar terms are collected in the [Glossary](#glossary) at the end.

- `react/src/hooks/useAppConfig.ts` exposes two hooks, plus a write-only `useScopedAppConfigSetter`. `useScopedAppConfig(scope, configName)` reads and writes one scope's [raw document](#glossary). `useMyAppConfig(configName, subKey)` reads the [merged view](#glossary) and never writes.
- A write is one upsert. `setKey` builds the whole document from the copy in the Relay store and lets the upsert response update that copy. A write reads the document from the network first only when Relay has already collected the stored copy.
- Every `userConfig` reader reads the USER raw document, so a write shows on screen from the upsert response alone. Only `domainConfig` and `publicConfigByDomain` readers use the merged view, and a `domainConfig` write refetches the merged `domainConfig` view.
- The write base is the document read when the screen mounted. A change that the CLI, another admin, or another tab of the same account makes after that mount is overwritten by the next write.

## Context

- **Upsert replaces**: `scopedAtomicBulkUpsertAppConfigFragments` stores the `config` it receives as the whole document of `(configName, scope)`; the manager does no JSON merge. A client that changes one key must send every other key too.
- **Per-scope setters**: Before this decision, each setter read the raw document from the network before its upsert, and some callers refetched the merged view afterwards, so one change cost two or three requests.
- **Read permissions**: `scopedAppConfigFragmentsByNames` answers PUBLIC and the caller's own USER scope for every role. It answers the DOMAIN scope only for a superadmin; a domain admin and a regular user are denied `READ` on `app_config_fragment`.
- **Merged view has no id**: `myAppConfigs` returns `AppConfig { configName config }` with no `id`, so Relay cannot match it to the fragment an upsert returns. The merged view keeps its old value until the client fetches it again.
- **Merged view includes PUBLIC**: `myAppConfigs` merges the public, domain, and own-user fragments the caller can see (`VisibleAppConfigFragmentTarget` in the manager), so it returns `publicConfigByDomain` as well.

## Diagram

```mermaid
flowchart LR
  subgraph manager["Manager"]
    raw["scopedAppConfigFragmentsByNames<br/>one scope, with id"]
    merged["myAppConfigs<br/>merged, no id"]
    upsert["scopedAtomicBulkUpsertAppConfigFragments"]
  end
  subgraph store["Relay store"]
    rawRec["AppConfigFragment record"]
    mergedRec["myAppConfigs result"]
  end
  raw -- "read once per mount, store-and-network" --> rawRec
  rawRec -- "doc" --> scoped["useScopedAppConfig"]
  scoped -- "setKey: whole document with one sub-key changed" --> upsert
  upsert -- "response with the same id" --> rawRec
  upsert -- "first write: updater links the created fragment" --> rawRec
  upsert -. "domainConfig write: network-only refetch, not awaited" .-> merged
  merged -- "one config name per request" --> mergedRec
  mergedRec -- "read only" --> my["useMyAppConfig"]
```

## Decision

### 1. Three hooks in `useAppConfig.ts`

| Hook                                          | Reads                                                                               | Writes                   | Fetch policy                                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------- |
| `useScopedAppConfig(scope, configName)`       | `scopedAppConfigFragmentsByNames` for one scope and one config name, once per mount | `setKey(subKey, update)` | `store-and-network`, plus one `network-only` read on a mount the store served |
| `useScopedAppConfigSetter(scope, configName)` | nothing at render                                                                   | the same `setKey`        | none                                                                          |
| `useMyAppConfig(configName, subKey?)`         | `myAppConfigs` for one config name per request                                      | none                     | `store-or-network`                                                            |

- **Scope type**: `AppConfigScope` is `{ scopeType: 'PUBLIC' }`, `{ scopeType: 'DOMAIN'; scopeId? }` or `{ scopeType: 'USER'; scopeId? }`. A missing `scopeId` becomes the signed-in user's domain id (`useCurrentDomain().id`, DOMAIN) or user id (USER).
- **Return shape**: `useScopedAppConfig` returns `{ doc, setKey }`. `doc` is the raw document, or `undefined` when the scope holds no fragment for that name.
- **Read once per mount**: `useLazyLoadQuery` does not fetch a query that another mounted reader still retains, such as `MainLayout`'s `userConfig` read. A `useScopedAppConfig` mount whose document the store already held therefore reads it once with `network-only` from an effect; a mount that found the document missing does not, because `useLazyLoadQuery` fetched it.
- **Setter without a read**: A screen that only writes (`BrandingSettingList`, `UserSettingsGeneralPane`) calls `useScopedAppConfigSetter`, so it does not suspend on a read it never shows.
- **Merged view per name**: `useMyAppConfig` asks `myAppConfigs` for its one config name, so the `domainConfig` readers reuse the `myAppConfigs(["domainConfig"])` result the sign-in query (`loginSessionAuth.ts`) stored.
- **Domain slice**: `publicConfigByDomain` holds one slice per domain, so callers pass the domain name as the first path segment, both to `setKey([domainName, key], …)` and to `useMyAppConfig('publicConfigByDomain', [domainName, key])`.

### 2. One upsert per write

- **Write base**: `setKey` waits for a read of the same document still in flight, reads the document from the Relay store, applies the sub-key change with `applySubKey`, and sends the result as one `scopedAtomicBulkUpsertAppConfigFragments`. When Relay has already collected the record, it reads the document from the network instead.
- **Store update**: The upsert selects `{ id configName config }`, so the response updates the returned record. The mutation's `updater` points the read at the returned fragment, which covers a first write and a write after the fragment was purged, and the next write builds on it.
- **Ordering**: `serializeWrite` queues the writes to one document (`scopeType`, `scopeId`, and `configName`), so a write starts after the previous one settles and builds on its response.
- **Value update**: `update` is the next value, or a function of the current value at `subKey`. `undefined` removes the key.

### 3. Who reads which view

| Config name            | Readers and writers                                                                                | Hook                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `userConfig`           | `MainLayout` (`themeFamily`), `useDashboardBoards`, `FolderCreateModal`, `useRecentSessionHistory` | `useScopedAppConfig({ scopeType: 'USER' }, 'userConfig')`                   |
| `userConfig`           | `UserSettingsGeneralPane` (writes only)                                                            | `useScopedAppConfigSetter({ scopeType: 'USER' }, 'userConfig')`             |
| `domainConfig`         | `AnnouncementBanner`, `useDashboardBoards` (templates)                                             | `useMyAppConfig('domainConfig', …)`                                         |
| `domainConfig`         | `AnnouncementEditModal`, `WebUISettingsPage` (superadmin only)                                     | `useScopedAppConfig({ scopeType: 'DOMAIN' }, 'domainConfig')`               |
| `publicConfigByDomain` | `useDashboardBoards` (templates)                                                                   | `useMyAppConfig('publicConfigByDomain', …)`                                 |
| `publicConfigByDomain` | `WebUISettingsPage` (superadmin only)                                                              | `useScopedAppConfig({ scopeType: 'PUBLIC' }, 'publicConfigByDomain')`       |
| `publicConfigByDomain` | `BrandingSettingList` (superadmin only, writes only)                                               | `useScopedAppConfigSetter({ scopeType: 'PUBLIC' }, 'publicConfigByDomain')` |

- **Merged refetch**: A `domainConfig` write starts a `network-only` read of the merged `domainConfig` view after its upsert lands, because every user reads `domainConfig` through it. The write does not wait for that read, and a failed read leaves the merged view stale without failing the write. A `publicConfigByDomain` write does not refetch; the Branding page and System Settings reload the page after they apply.
- **Draft follows the refresh**: `WebUISettingList` seeds its draft from the saved documents. When the mount's refresh changes them and the draft still equals the previous saved value, the draft takes the refreshed value instead of showing it as an edit.

## Rejected alternatives

- **Re-read before each write**: Each setter reads the raw document from the network before its upsert. A change another tab made a moment ago survives. Rejected because every change costs an extra request, and System Settings will save on every change (#10941).
- **Merged view for `userConfig`**: `userConfig` readers keep `useMyAppConfig` and each write refetches the merged view. DOMAIN-scope `userConfig` defaults keep applying. Rejected because every write then costs a second request, and nothing in the WebUI writes DOMAIN-scope `userConfig`; ADR 0026 keeps the dashboard out of it.
- **`my*` mutation for USER**: The own-user write goes through `myAtomicBulkUpsertAppConfigFragments`. Rejected because the scoped mutation accepts the caller's own USER scope, so one mutation serves every scope.

## Consequences

- **Request count**: A change costs one upsert; a `domainConfig` change costs one more request for the merged refetch. A screen reads each raw document once per mount.
- **Lost concurrent edits**: The next write overwrites a change that the CLI, another admin, or another tab of the same account made after the screen mounted. Reloading the screen picks the change up.
- **Defaults from DOMAIN-scope `userConfig`**: A `userConfig` value written at DOMAIN scope no longer reaches the screens, because they read the USER raw document.
- **Superadmin-only raw reads**: For anyone but a superadmin, the manager denies a DOMAIN-scope read and `useLazyLoadQuery` raises the error to the nearest error boundary, so only superadmin routes (`access: 'superadmin'`) and superadmin-gated components may call it.

## Sources

- #11146 — this decision, decided on 2026-11-12.
- #10941 — System Settings saves on every change, the next step (PR #11090).
- Manager `1b01ca06e6`: `models/app_config_fragment/upserters.py` (whole-document upsert), `models/app_config_fragment/scopes.py` (`VisibleAppConfigFragmentTarget`).

Related: [ADR 0026](0026-dashboard-boards-in-manager-app-config.md), [ADR 0028](0028-webui-settings-in-the-app-config-settings-key.md).

## Glossary

| Term         | Meaning                                                                                                                                                                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| raw document | The `config` of one app config fragment, stored at one scope (PUBLIC, one domain, or one user) for one config name.                                                                                                                                   |
| merged view  | The document `myAppConfigs` returns, which the manager builds by deep-merging every fragment of one config name the caller can see, in the order of the rank the manager's app config allow list gives each scope (PUBLIC 100, DOMAIN 200, USER 300). |
