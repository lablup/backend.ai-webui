# 0026 — Dashboard refresh bar and per-card settings

## Summary

> Unfamiliar terms are collected in the [Glossary](#glossary) at the end.

- The [dashboard bar](#glossary) of a dashboard page holds only the board tabs and one auto-refresh control. The bar decides only when the cards read again, not what they read.
- The page decides the range a card reads. The regular user page reads the user's own data in the header project, the project admin page reads the project in the URL path, and the superadmin page reads the whole current domain. A superadmin does not pick a domain either ([ADR 0012](0012-scoped-search-fields-in-place-of-admin-fields.md)). The one exception is the audit log card on the superadmin page, which reads the cluster-wide `adminAuditLogsV2`.
- Resource group and period are [card settings](#glossary). Only a card whose values depend on the resource group or the period has settings. The user edits the saved default in edit mode, and in view mode can change a card's value for a while with the picker in the card header. The bar has no global filter that only some cards follow.
- A page has one auto-refresh. The bar's refresh control sends a tick at each interval (1 minute by default), and a tick makes every card on screen read again together. No card has its own minimum interval. Pressing the control makes every card read again at once. A card has no refresh button of its own.
- A card shows counts over time only as counts the manager computed. A total for the whole period is the sum of the bucket counts the card read. A card that reads a field giving values only per project or per resource group shows them as separate rows, and the client does not add values across projects or resource groups.
- A card the viewer has no permission to read is hidden. When data the client already has tells, the catalog leaves the card out; otherwise the error code in the response tells. No separate request checks permissions. A card whose range a card setting narrowed, and a custom panel, are not hidden and show a notice inside the card.

## Context

- **Card scope**: Before #10580, each dashboard card decided its own range. The "My Sessions" card counted every session in the project for an admin, and the screen did not show which range it used (#9839, #7843).
- **Global filters ignored**: When global resource group, period, and project pickers sat above the board, most cards followed only some of them. The session count card ignored the period, and the help text had to explain the difference. The 2026-10-26 meeting decided to remove the global pickers and move them into card settings.
- **Board model**: [ADR 0025](0025-dashboard-boards-in-manager-app-config.md) stores a board as a `DashboardModel`. One card is a `PersistedPanelV2` of the board.
- **Denied fields**: For a V2 field the viewer cannot read, the manager answers HTTP 200 with only that field set to `null`, and puts `path: [<field>]` and `extensions.code` in `errors[]` (`user_auth_forbidden` for an admin-only field, `permission_access_forbidden` outside the RBAC scope). The other fields of the same request are read (checked on staging with a project admin account, 2026-11-03). Without `@catch`, Relay reads that field as a plain `null`, and the card shows 0 or an empty list.
- **Manager bug**: The 26.10.0a3 manager ignores `after` when one `DateTimeFilter` carries both `after` and `before`.

## Diagram

### Flow of values

```mermaid
flowchart LR
  board["Open board<br/>vars.refresh, panels[].settings"]
  hook["useDashboardFilters<br/>resolveDashboardScope"]
  bar["DashboardFilterBar<br/>board tabs, BAIFetchKeyButton"]
  sched["RefreshScheduler<br/>DashboardRefreshProvider"]
  content["DashboardPanelContent<br/>one card"]
  tan["TanStack query"]
  board -- "vars.refresh" --> hook
  hook -- "refresh, setRefresh" --> bar
  bar -- "interval change" --> board
  bar -- "tick() at each interval, refreshAll() on click" --> sched
  hook -- "scope, header project and resource group" --> content
  board -- "panel.settings" --> content
  sched -- "fetchKey of every visible card" --> content
  sched -- "refetchQueries(queryKey)" --> tan
```

### Refresh tick

```mermaid
sequenceDiagram
  participant C as BAIFetchKeyButton
  participant T as RefreshScheduler
  participant A as Card A on screen
  participant B as Card B off screen
  Note over C: interval 1m
  C->>T: 1m passed, onChange isAuto true, tick()
  T->>A: fetchKey updated
  T--xB: off screen, skipped
  Note over B: visible again after scrolling
  T->>B: last refresh older than 1m, fetchKey updated
  C->>T: user presses, onChange isAuto false, refreshAll()
  T->>A: fetchKey updated
  T->>B: fetchKey updated
```

## Decision

### 1. The bar holds only the board tabs and the refresh control

- **Bar layout**: `DashboardFilterBar` (`react/src/components/DashboardPanels/DashboardFilterBar.tsx`) draws one row with the board tabs (`DashboardBoardTabs` on the `projectAdmin` and `admin` pages) on the left, and one `BAIFetchKeyButton` followed by the edit toggle (`DashboardEditToggleButton`, a secondary button the same size as the refresh control) on the right. This is the only edit entry point on all three pages, and the breadcrumb has none. The `project` page has no tabs, so it shows only the refresh control and the edit toggle.
- **Refresh control**: The bar passes `autoUpdateDelay` and `onChangeAutoUpdateDelay` to `BAIFetchKeyButton`, which opens the interval dropdown. The choices are off, 5 seconds, 10 seconds, 15 seconds, 30 seconds, 1 minute, 5 minutes, and 10 minutes (`REFRESH_OPTIONS`, `refreshScheduler.ts`), and the default is 1 minute. The chosen interval is saved in the open board's `vars.refresh`.
- **No pickers**: The bar has no project, resource group, or period control. It has no domain control either.
- **No URL state**: The bar does not write its value to the URL query. The only value left is the refresh interval, so there is no reason to share it in a link.

### 2. The page decides the range

- **Resolver**: `resolveDashboardScope` (`dashboardScope.ts`) decides the `DashboardScope` (`types.ts`) from `{ page, urlProjectId, currentDomain }`.

| kind       | page           | field                                                   |
| ---------- | -------------- | ------------------------------------------------------- |
| `mine`     | `project`      | `projectId`: the page's project (the header project)    |
| `projects` | `projectAdmin` | `projectIds`: the one project in the URL path, `domain` |
| `projects` | `admin`        | `projectIds: 'all'`, `domain`: the current domain       |

- **Current domain**: `useDashboardFilters` passes the `{ id, name }` of `useCurrentDomain()` as `domain`.
- **Audit log exception**: On the superadmin page, a card that reads audit logs reads the cluster-wide `adminAuditLogsV2` instead of the current domain's scoped query. Audit logs read with the domain entity scope miss the session, folder, and deployment records inside that domain (checked on a 26.10 manager). This is an exception to the scoped field rule of [ADR 0012](0012-scoped-search-fields-in-place-of-admin-fields.md), and it applies to this card only. On a multi-domain cluster, only this card also counts other domains' records.
- **Board vars**: A board's `vars` (`DashboardBoardVars`) is `{ refresh }` only. `sanitizeBoardVars` drops the `project`, `rg`, and `range` left in older boards, and changes a `refresh` that is not in `REFRESH_OPTIONS` to `1m`. A board that already chose an interval keeps it.

### 3. Resource group and period are card settings

- **Declared settings**: `PanelDefinition.settings` lists the settings a card reads (`resourceGroup`, `range`). The values are saved in the board panel's `PersistedPanelV2.settings` (`{ resourceGroups?: string[]; range?: string }`). A card has only one resource group, saved as a one-item `resourceGroups` array. `sanitizeBoard` drops settings the card definition does not list, and keeps only the first of several resource groups left in an older board.
- **Saved default in edit mode**: The edit-mode side panel shows a settings button and the current value only for the cards on the board that list settings, and the button opens `PanelSettingsModal`. The value chosen there is the card's default saved in the board. A card that lists no settings has no control.
- **Header pickers in view mode**: A card that lists settings also draws a resource group picker and a period picker next to the title in its header in view mode (`PanelSettingsHeaderControls`). On hover, each picker shows a tooltip naming what it picks (resource group, period). A value chosen in the header is not saved and lives only in memory (`panelSettingOverridesAtom`). It survives auto-refresh, and it returns to the saved default when the user leaves the page or reloads it. When it differs from the saved value, the picker is highlighted, and the revert button beside it restores the saved value.
- **Resource group choices**: `PanelSettingsModal` and the header picker pick one resource group with `BAIScopedResourceGroupSelect`. The choices come from the page's project (`scope: { project }`), or on the superadmin page from the current domain (`scope: { domain }`), without SFTP-only resource groups.
- **Defaults**: When the resource group setting is empty, a fixed card reads the header's current resource group, and a custom panel reads every resource group. The period setting defaults to the last 24 hours (`DEFAULT_RANGE`, `panelSettings.ts`), and the choices are the last 1 hour, 24 hours, and 7 days.
- **Card state**: `DashboardPanelContent` resolves the value chosen in the header, or else the saved setting, and passes it as `vars` (`DashboardVars`): `range`, `timeRange` fixed at the card's last refresh time, `resourceGroup` (the setting or the header resource group), `currentProjectId`, and `currentResourceGroup`.
- **Single resource group cards**: A card that reads a field taking only one resource group reads only the one resource group that `cardResourceGroup(settings.resourceGroups, currentResourceGroup)` decides. It does not split requests per resource group.
- **Custom panels**: When the data source can narrow by resource group (`ResourceConfig.supportsResourceGroup`), a custom panel also has a resource group setting. Sessions add `scaling_group == ...` to the minilang filter, and deployments use `resourceGroup: { in }`. Folder panels have no setting.

### 4. The period filter is an AND of two bounds

- **Window**: `rangeToDateTimeFilter(range, now)` turns a period into an `{ after, before }` window. `before` is exclusive. A card passes its last refresh time as `now`, so the query variables do not change between refreshes.
- **ANDed bounds**: The window is not passed as one `DateTimeFilter`. `withinWindow(field, window)` passes it as `AND: [{ field: { after } }, { field: { before } }]`. Buckets do the same.

### 5. A page has one refresh

- **Scheduler**: `DashboardRefreshProvider` creates one `RefreshScheduler` (`refreshScheduler.ts`) per page. The scheduler has no timer.
- **Ticks**: When `BAIFetchKeyButton` calls `onChange(key, { isAuto: true })` at an interval, the bar calls `tick()`. When the user presses the button (`isAuto: false`), the bar calls `refreshAll()`. The button pauses the interval in a hidden tab.
- **Subscribers**: A card registers with the scheduler through `useDashboardFetchKey('panel:<id>')`, a page query that cards still read through `useDashboardFetchKey('page-query')`, and a TanStack query through `useDashboardRefreshQuery(queryKey)`.
- **One cadence**: `tick()` makes every subscriber on screen read again. A card definition has no refresh interval, so the whole dashboard reads again together. `refreshAll()` makes every subscriber read again at once, including those off screen.
- **Off-screen cards**: When `useBoardItemVisibility` tells the scheduler a card is off screen, `tick()` skips it. When the card is visible again, the scheduler makes it read again at once if its last refresh is older than the current interval (`setIntervalMs`, passed by the bar). A value up to 500ms early also counts as past. When the interval is off, the card does not read again.
- **No card buttons**: The headers of cards and custom panels have no refresh button (`PanelFrame`). A card component also used outside the dashboard hides its button with `hideRefreshButton`.
- **No suspense flash**: `useDashboardFetchKey` changes the fetch key inside a `useTransition` transition, and the cards and the page read their queries again with that key. While the new query suspends, the screen keeps showing the previous value.
- **In-flight refresh**: A subscriber whose transition has not finished is `isPending` and tells the scheduler through `setPending`. While any subscriber is in flight, the bar's refresh button shows loading and does not start the next interval, and `tick()` skips the subscribers in flight.
- **Observed as mounted**: `useBoardItemVisibility` uses a `MutationObserver` to observe each `[data-board-item-id]` element as the board attaches it. The board draws its items only after it measures its width, so one lookup at the first render is not enough.

### 6. The manager counts over time, and totals add those counts

- **Count aliases**: A card that draws values such as counts per status reads the `count` of connections with different filters in one request, as [count aliases](#glossary).
- **Buckets**: A card that draws counts over time reads one count alias per consecutive interval among the eight or fewer that `planBuckets(range, now)` (`timeRange.ts`) makes. A relative period gets intervals aligned to unit boundaries (10 minutes for 1 hour, 4 hours for 24 hours, a day for 7 days), plus one first interval cut to fit `now`. So 1 hour and 24 hours get 7 intervals, and 7 days gets 8 intervals of one day each, with one fewer only when `now` falls exactly on a boundary. A custom period is split into equal lengths.
- **Totals from buckets**: A total for the whole period (such as the success and failure counts of audit logs) adds the bucket counts the same card read. The buckets split the window with no gap and no overlap, so the sum equals the window's count, and the card reads no separate alias for the total.
- **Usage buckets**: The usage trend card draws the intervals the manager's `usageBuckets` returns as they are.
- **Rows, not sums**: A card that reads a field giving values only per project or per resource group draws one row per project or resource group. The client does not add the values of the responses it received per project or resource group.

### 7. One card across roles

- **One UI, scope as input**: A card that appears on several pages (regular user, project admin, superadmin) is one component. Its layout, statistic format, charts, tables, settings, and empty state are the same, and only the `DashboardScope` the page decides differs. A regular user reads their own data, a project admin reads the project in the URL path, and a superadmin reads the current domain and superadmin-only data. The card takes the scope as input and picks the matching fields, and no role gets a separate component.

### 8. Cards the viewer cannot read are hidden

- **Catalog first**: The catalog leaves out the cards that the role decides (`catalogFor`). `requires.role: 'projectAdmin'` accepts a superadmin, a domain admin, and an RBAC admin of the page project (`useIsCurrentProjectAdmin`, the same value the route guard uses). It is passed as `PanelCatalogContext.isProjectAdmin`.
- **Runtime detection**: Every root field of a card query carries `@catch(to: RESULT)`. `isPermissionDenied(errors)` in `panelPermission.tsx` checks whether `extensions.code` is `permission_access_forbidden` or `user_auth_forbidden`. For an object `RelayEnvironment` threw because the whole request failed, it counts a denial when `error_code` is one of the same codes or `statusCode` is 403. A 401 means the session ended, so it does not count as a denial.
- **Primary and secondary**: A card reads its primary data field with `readPrimary`. On a denial it throws `PermissionDeniedError`, and other errors are `null` as before. It reads secondary fields (extra counts, previous-period counts, buckets) with `readSecondary`, and draws a denied value, and the totals, deltas, and donut totals built from it, as "-" instead of 0.
- **Hide through the board**: `PanelPermissionBoundary` inside the card catches the denial and reports it to `DeniedPanelsContext` in an effect. `useDeniedPanels` (`DashboardPanelBoard`) holds the denied panel ids per page scope key (`dashboardScopeKey`: the page and the project, or the domain on the superadmin page), and `useDashboardBoard` removes those panels from the board items so the board flows again with no empty slot. The panels stay in the saved board and in `activeKeys`, and `applyLayout` keeps the places of panels it does not draw. The edit-mode side panel marks such a card with "You do not have permission to view this".
- **Reset**: The denied list empties when the scope changes, and when the user presses the refresh control (`refreshAll`). A permission granted in between shows at the next manual refresh. An auto tick does not empty the list. `useBAILogger` logs the same panel of the same scope only once.
- **Notice instead of hiding**: A card whose range a card setting or header picker narrowed (resource group, period, and so on) is not hidden and draws a notice such as "You do not have permission for this resource group" in its body. The header pickers and the revert button stay, so the user can undo the chosen value. A custom panel (`kind: 'preset'`) is not hidden either and draws a notice.

## Rejected alternatives

- **Global filter bar**: Project, resource group, and period pickers sit above the board, and every card follows them. The board's range shows in one row. This is rejected because a card showing the current state cannot follow the period, and a card unrelated to resource groups cannot follow the resource group, so cards silently ignore some of the bar's values, and the user cannot tell which card follows which value.
- **Per-card refresh**: Each card has a refresh button. A user can make one card read again. This is rejected because several refresh controls on one screen make it unclear what reads what again, and they overlap the page's refresh.
- **Per-card minimum**: Each card definition has a minimum refresh interval (`refresh.min`), and a tick makes only the cards whose interval passed read again. Slow-changing data is requested less. This is rejected (2026-10-29) because cards on the same screen show values from different times, and the user cannot tell which cards the bar's interval makes read again.
- **Edit-mode-only settings**: Card setting controls exist only in edit mode. Cards in view mode get simpler. This is rejected because a user who wants a quick look at another resource group or period has to enter edit mode and change the board's saved value, and in view mode nothing shows which resource group and period a card reads.
- **Domain-scoped audit log**: The audit log card on the superadmin page also reads with the current domain scope. Its range matches the neighbouring cards. This is rejected because domain-scoped audit logs miss the domain's session, folder, and deployment records, so the card cannot show most of the real activity.
- **Domain picker**: The superadmin bar has a domain multi-select. This is rejected because [ADR 0012](0012-scoped-search-fields-in-place-of-admin-fields.md) set every role's reads to the current domain's `scoped*` fields.
- **Scheduler timer**: The scheduler ticks with its own timer, and the button only picks the interval. This is rejected because `BAIFetchKeyButton` runs its own timer once an interval is chosen, so there would be two timers, and the button's countdown would drift from the actual refresh.
- **Permission pre-check**: Before drawing cards, a request such as `myAtomicBulkScopePermissions` asks for each card's permission. A denied card is never drawn, even briefly. This is rejected because it adds requests per card, and the client would have to maintain a separate table pairing the fields a card reads with permission entities. The error code in the response tells the same fact with no extra request.
- **Show zero or an error state**: A denied card stays and shows 0 or "unexpected error". This is rejected because 0 is a false value, and an error state makes something the user cannot fix look broken.
- **Client-side sums**: The browser adds the values received per project. This is rejected because the client cannot know which projects were left out for lack of permission, so the total is wrong, and the number of requests grows with the number of projects.

## Consequences

- **Visible card scope**: A card that lists settings shows, even in view mode, the resource group and period it reads in its header pickers. The edit-mode side panel shows the saved default.
- **Superadmin audit log range**: On a multi-domain cluster, the audit log card on the superadmin page also counts other domains' records, while the neighbouring cards count only the current domain.
- **No shareable filter links**: A link carries only the page and the project. Card settings are saved in the board, so the same account sees the same values on any device.
- **Unmigrated cards**: The existing cards at the time this decision landed do not read `scope` and `vars`; they use the page query and the header values. No fixed card lists settings yet.
- **Hidden card flash**: A denial is known only after the response arrives, so a card to be hidden shows as a skeleton during the first load and then disappears. The same happens after a manual refresh.
- **Cards blocked on aggregation**: A card for which the manager gives no group-by or time series values is not built and stays a backend request.

## Sources

- #10422 (epic), #10582, #9839, #7843, the 2026-10-26 meeting, the 2026-10-29 decision (one refresh cadence for every card, 1 minute by default, one resource group per card), the 2026-10-30 decision (card header pickers in view mode, `adminAuditLogsV2` for the superadmin audit log), and the 2026-11-03 decision (hide cards the viewer cannot read, show a notice on cards narrowed by settings and on custom panels).
- The role-based dashboard proposal in #10422 (period and refresh, storage and migration).
- Related: [ADR 0012](0012-scoped-search-fields-in-place-of-admin-fields.md), [ADR 0025](0025-dashboard-boards-in-manager-app-config.md).

## Glossary

| Term          | Meaning                                                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dashboard bar | The row above the dashboard board. It holds the board tabs and the auto-refresh control, and `DashboardFilterBar` draws it.                                               |
| card setting  | The resource group and period values one card saves in the board. It is `PersistedPanelV2.settings`, and a card has only the settings its definition lists in `settings`. |
| board         | One saved dashboard sheet that holds the card layout and settings. It is a `DashboardModel`, defined by [ADR 0025](0025-dashboard-boards-in-manager-app-config.md).       |
| fetch key     | The string passed to the `fetchKey` option of Relay `useLazyLoadQuery`. When the value changes, the query reads from the server again.                                    |
| count alias   | Calling the same connection field several times in one GraphQL request with different filters, and reading only each result's `count` under its own name.                 |
