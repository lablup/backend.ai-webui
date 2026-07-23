---
name: tab-url-state
description: >
  Decides whether a tab's filter/order/pagination belongs in the URL and
  applies one of the two sanctioned patterns: page-like tabs (full URL state
  + `queryMapRef` save/restore) or widget tabs on a detail page (tab key
  only). Use when adding or editing tabs (BAICard `tabList`, BAITabs) whose
  content contains a filterable/paginated table, or when wiring
  `onTabChange`. Related: FR-3267.
---

# Per-Tab URL State Policy

Two distinct situations look identical in JSX (`tabList` on a card) but demand
opposite URL-state treatment. Decide first, then apply the matching pattern.

## The Decision

Ask: **is each tab acting as a page, or is the tabbed card one widget among
several on a page?**

| Situation | Example | URL persists |
|---|---|---|
| **A. Page-like tabs** — the page IS the tab set; one card fills the page and each tab is a destination users deep-link to | `AdminComputeSessionListPage` (session types), `AdminUsersPage` (users / credentials) | tab key **+ filter/order/pagination** (`filter`, `order`, `current`, `pageSize`) |
| **B. Widget tabs** — a detail page with multiple cards, one of which happens to have tabs | `DeploymentDetailPage` → `DeploymentRevisionCard` (`revisionTab`) | **tab key only** — nothing else |

Heuristic: if the route menu/sidebar leads to this tab set, or a user would
share "the credentials page" as a link, it's A. If the tabbed card sits next
to sibling cards (basic info, replicas, auto-scaling…), it's B — a tab there
has no claim to page-level query keys.

The decision is about page structure only — which component renders the tabs
(`BAITabs` or `BAICard tabList`) is orthogonal.

## Pattern A — Page-like tabs: URL state + `queryMapRef` save/restore

Each tab persists its own filter/order/pagination to the URL so direct access
and reload reproduce the view. But sibling tabs share one query string, so tab
switching must (1) not leave the previous tab's keys lingering in the URL and
(2) restore the target tab's last-known state.

Pattern A has **two implementations**. Pick by who declares the tab panels'
URL state (not by file count — a host with an inline content component in the
same file is still A-ii if the panels own their state):

- **A-i — the tab component itself declares the state**: tabs and table live
  in one component that owns the `useQueryStates` schema. Snapshot the
  *parsed* state per tab. Canonical: `AdminComputeSessionListPage.tsx`.
- **A-ii — each tab panel declares its own URL state**: tabs render
  self-contained child components with their own `useQueryStates` /
  pagination hooks. The host must NOT absorb the children's state — snapshot
  the *raw query string* per tab and restore it on switch; children stay
  untouched and independent. Canonical: `AdminUsersPage.tsx`.

### A-i — single component: parsed-state snapshot

```tsx
const [queryParams, setQueryParams] = useQueryStates(
  {
    order: parseAsStringLiteral(availableSorterValues),
    filter: parseAsString.withDefault(''),
    type: parseAsStringLiteral(typeFilterValues).withDefault('all'), // tab key
  },
  { history: 'replace' },
);

const {
  baiPaginationOption,
  tablePaginationOption,
  setTablePaginationOption,
} = useBAIPaginationOptionStateOnSearchParam({ current: 1, pageSize: 10 });

// Snapshot each tab's live state so it can be restored after switching away.
const queryMapRef = useRef({
  [queryParams.type]: { queryParams, tablePaginationOption },
});

useEffect(() => {
  queryMapRef.current[queryParams.type] = {
    queryParams,
    tablePaginationOption,
  };
}, [queryParams, tablePaginationOption]);

<BAITabs
  activeKey={queryParams.type}
  onChange={(key) => {
    const storedQuery = queryMapRef.current[key] || {
      queryParams: {/* per-tab defaults */},
    };
    setQueryParams(null); // reset all keys first, then layer stored state (see Gotchas)
    setQueryParams({ ...storedQuery.queryParams, type: key });
    // pagination is a SEPARATE nuqs group — setQueryParams(null) does not touch
    // it, so the unvisited-tab fallback must reset current AND pageSize.
    setTablePaginationOption(
      storedQuery.tablePaginationOption || { current: 1, pageSize: 10 },
    );
    setSelectedRows([]);
  }}
/>
```

Net effect: the URL always reflects only the *active* tab's state and reload
reproduces it exactly; `queryMapRef` remembers the other tabs for the session.

### A-ii — host + self-contained child tabs: raw query-string snapshot

When each tab is its own component with its own URL state, the host only
manages the `tab` key and swaps the whole query string on switch. Do NOT hoist
the children's params into the host or drill props — the children keep
working independently, and only one is mounted at a time.

The division of labor: children manage their typed keys with nuqs (as
always); the host calls `useTabQuerySnapshot(tabParser)` from
`react/src/hooks`, which owns the whole A-ii mechanism — it derives the tab by
parsing `location.search`, snapshots each tab's raw query string, and returns
the `onTabChange` that restores it on switch. The host must NOT read the tab
with `useQueryState`: nuqs applies externally-caused URL changes (navigate,
Link, history.pushState) inside a React transition, and when the incoming
tab's content suspends under the shared Suspense boundary, that transition can
stay uncommitted indefinitely — the URL changes but the tab UI never switches.
Deriving the tab from `location.search` keeps the switch an urgent update: the
tab flips immediately and the boundary shows its fallback while the new
content loads. (The whole-string restore is below nuqs's declared-keys
abstraction anyway — the host cannot declare keys it doesn't know.) That
rationale lives in the hook body — don't re-inline the mechanism in pages.

```tsx
// Module-level. nuqs parsers are still the validation vocabulary; only the
// nuqs *hook* is off-limits in the host.
const tabParser = parseAsStringLiteral(['users', 'credentials']).withDefault(
  'users',
);

const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);

<BAICard activeTabKey={currentTab} onTabChange={onTabChange} tabList={tabItems}>
  {currentTab === 'users' && <AdminUserManagement />}
  {currentTab === 'credentials' && <AdminUserCredentialList />}
</BAICard>
```

Because the host swaps the *entire* query string per tab, sibling children may
keep their generic key names (`filter`, `order`, `current`, `pageSize`) — no
collision is possible: a stored snapshot is only ever applied together with
its own tab key, and only that tab's component is mounted to read it.

## Pattern B — Widget tabs on a detail page: tab key ONLY

A tabbed card among sibling cards is not a page. Persist just the active tab
key with its **own descriptive URL key** — never `tab`, `filter`, `current`,
or `pageSize`. Canonical implementation: `DeploymentRevisionCard.tsx`.

```tsx
const [activeRevisionTab, setActiveRevisionTab] = useQueryState('revisionTab', {
  ...parseAsStringLiteral([
    'currentRevision',
    'revisionHistory',
    'auditLog',
  ] as const).withDefault('currentRevision'),
  history: 'replace' as const,
  scroll: false,
});

<BAICard
  activeTabKey={activeRevisionTab}
  onTabChange={(key) => void setActiveRevisionTab(key)}
  tabList={[...]}
/>
```

Any filter/order/pagination *inside* those tabs stays in local state:
`useState` for filters, `useBAIPaginationOptionState` (the non-SearchParam
variant in `react/src/hooks/reactPaginationQueryOptions.tsx` — plain
`useState`, never writes to the URL) for tables. Reload resets them — that is
the intended UX; the deep-linkable unit is the detail page + which tab is
open, not page 3 of a sub-table.

The URL key must be scoped to the card (`revisionTab`, not `tab`) because a
detail page can grow a second tabbed card later, and because the page-level
route may already use `tab`.

## Anti-patterns

```tsx
// ❌ Full query-string replacement on tab switch.
//    Wipes every other URL key — the departing tab's filter/pagination is
//    gone from the URL, so reload-after-returning always resets to defaults.
onTabChange={(key) =>
  navigate({ pathname: '/credential', search: `?tab=${key}` })
}

// ❌ "Fixing" the wipe by merely PRESERVING the query string on tab switch.
//    Sibling children using the same generic keys (`filter`, `order`,
//    `current`, `pageSize`) then read/write each other's state. The fix is
//    Pattern A's snapshot/restore (swap, don't preserve) — not per-widget
//    key prefixes.

// ❌ Hoisting the children's URL state into the host page and drilling
//    queryParams / onChange / pagination props down. Self-contained child
//    tabs stay independent — the host manages only the tab key and the raw
//    query-string snapshot (Pattern A-ii). Prop-drilling the schema couples
//    every child to the host, duplicates parsers/types, and bloats the host
//    for zero behavioral gain.

// ❌ Pattern B card persisting table filter/pagination to the URL, even with
//    card-scoped prefixed keys. A widget's page number is not shareable
//    state, and it pollutes the detail page's URL with keys that outlive the
//    card. Existing prefixed examples (`rFilter`/… in
//    DeploymentReplicasCard.tsx, `rvFilter`/… in
//    DeploymentRevisionHistoryTab.tsx) predate this policy — don't copy them
//    into new code.
```

## Gotchas

- **A-i: `setQueryParams(null)` then `setQueryParams({...stored})` is two
  calls on purpose** — reset-all, then merge (nuqs semantics: see the
  `react-url-state` skill's gotchas). Skipping the reset leaks keys the
  target tab doesn't declare.
- **A-i: pagination is a separate nuqs group, so `setQueryParams(null)` does
  NOT reset it.** The unvisited-tab pagination fallback must reset **both**
  `current` and `pageSize` (`{ current: 1, pageSize: <default> }`). A bare
  `{ current: 1 }` leaves the departing tab's `pageSize` in place, so a
  never-visited tab inherits it — a per-tab-state leak.
- **A-ii: the stored snapshot already contains its own `tab` key** (it was
  captured while that tab was active), so restoring it is a plain
  `navigate({ search: stored })`; only the never-visited fallback needs an
  explicit tab-only string, built via `new URLSearchParams({ tab: key })` so
  the value is properly encoded.
- **A-ii: the host never touches nuqs hooks for the tab key.** Not the setter
  (it merges — writing `tab` preserves every other key, leaking the departing
  tab's state into the next tab) and not a read-only `useQueryState` either
  (nuqs applies navigate-caused URL changes in a transition that can hang on
  the incoming tab's Suspense). `useTabQuerySnapshot` handles both sides;
  use it instead of re-inlining reads or navigate swaps.
- **The in-memory view can lie.** With the full-replace anti-pattern, Relay's
  in-memory query ref makes the old tab *look* preserved when you switch back
  — the loss only manifests on refresh. Test with a reload, not just tab
  round-trips.
- **`queryMapRef` is per-session, by design.** Only the active tab's state is
  in the URL; a shared/reloaded URL restores that one tab and other tabs
  start from defaults. Don't "fix" this by writing all tabs' state to the URL.
- **Row selection is not part of the snapshot.** Clear `selectedRows` on
  every tab change; restoring a selection against a re-fetched page is a
  correctness trap.
- **Pattern B needs `scroll: false`.** Without it nuqs may scroll to top on
  tab change, which is jarring for a card in the middle of a detail page.

## Verification Checklist

- [ ] Classified the tab set as A (page-like) or B (widget) before writing code.
- [ ] Pattern A: picked A-i (single component) vs A-ii (host + self-contained children) by who owns the table state; no unconditional `navigate({ search: '?tab=...' })` full-replace (A-ii's never-visited-tab fallback is the one sanctioned use).
- [ ] A-i: `onTabChange` resets (`setQueryParams(null)`) before restoring. A-ii: host snapshots `location.search` per tab and restores it; children unchanged, no prop drilling.
- [ ] Pattern B: only a card-scoped tab key in the URL (`history: 'replace'`, `scroll: false`); filters/pagination local.
- [ ] Reload test on each tab: Pattern A reproduces filter/order/page; Pattern B reproduces only the open tab.
- [ ] No two sibling tabs read/write the same URL key through separate `useQueryStates` declarations.

## Related

- `react-url-state` skill — nuqs fundamentals (`parseAs*`, `history: 'replace'`, `setQueryParams(null)` reset/merge semantics, `useDeferredValue` pairing).
- `react-relay-table` skill — wiring the table itself.
- `.claude/rules/use-bai-card.md` — the layout axis of the same tabbed cards (body padding, header `extra`); orthogonal to URL state.
- Canonical files: `react/src/pages/AdminComputeSessionListPage.tsx` (A-i), `react/src/pages/AdminUsersPage.tsx` (A-ii), `react/src/components/DeploymentRevisionCard.tsx` (B).
- FR-3267 — the issue that established this policy and tracks migration of the remaining pages.
