# Conversion idioms (antd → Astryx)

Standing recipes for antd patterns whose Astryx equivalent is **not** a
one-to-one component swap. Read this before recording a new PILOT-DECISION that
drops a layout capability — the gap is often in the component you reached for,
not in Astryx.

Each idiom is: the antd pattern → the Astryx composition → why → where it is
already applied.

---

## 1. antd vertical tabs (`tabPosition`/`tabPlacement="left" | "start"`) → Astryx `settings-sidebar` template composition, **not** a horizontal `TabList`

**Status:** ratified 2026-08-08 (supersedes ticket 22 PILOT-DECISION #1).
**Applied in:** `react/src/components/SettingList.tsx` (the shared engine behind
`UserSettingsPage`, `ConfigurationsPage`, `MaintenancePage`, `BrandingPage`).
**Evidence:** `.scratch/astryx-migration/shots/settings-sidebar/{before,after}-*.png`,
capture script `.scratch/astryx-migration/settings-sidebar-shots.mjs`.

### The trap

`astryx component TabList` correctly reports that `TabList` has no
vertical/side orientation. Reading that as "Astryx cannot do left-hand tabs" and
collapsing the surface to horizontal top tabs is wrong: a left tab rail is not a
tab-bar variant in Astryx's vocabulary, it is a **page shell** — and Astryx ships
one, as the `settings-sidebar` page template ("Settings Panels").

**Discover before you drop.** `astryx template --list` /
`astryx search "settings sidebar"` finds the template that the component-level
lookup cannot.

### The composition

`pnpm exec astryx template settings-sidebar` (reference code — follow it):

```tsx
<Layout
  height="auto"                 // 'fill' when the shell owns the viewport
  padding={0}
  start={
    isNarrow ? undefined : (
      <LayoutPanel hasDivider padding={0} width={NAV_PANEL_WIDTH} role="navigation" label={…}>
        <List density="spacious">
          {items.map((item) => (
            <ListItem
              key={item.key}
              label={item.label}
              isSelected={!isNarrow && activeKey === item.key}
              endContent={
                isNarrow
                  ? <Icon icon={ChevronRight} size="sm" color="secondary" />
                  : <Badge label={item.count} variant="neutral" />
              }
              onClick={() => select(item.key)}
            />
          ))}
        </List>
      </LayoutPanel>
    )
  }
  content={<LayoutContent padding={4}>{pane}</LayoutContent>}
/>
```

Mapping from the antd original:

| antd | Astryx |
|---|---|
| `<Tabs tabPlacement="start">` | `Layout` + `start={<LayoutPanel hasDivider>}` + `content={<LayoutContent>}` |
| `items[].label` | `ListItem.label` |
| active tab underline / bg | `ListItem isSelected` (renders `aria-current` + the selected surface) |
| count suffix in the label | `ListItem endContent={<Badge variant="neutral" />}` |
| `tabBarStyle={{ minWidth: N }}` | `LayoutPanel width={N}` (a **fixed** budget — size it to the longest label, see below) |
| `items[].children` | the pane you render into `LayoutContent` |

### Rules that come with it

1. **Frame first.** `LayoutPanel.width` is fixed, unlike antd's `minWidth`
   rail that grew to fit. Budget it in px against the longest label in the
   surface (`SettingList` uses 240 — 200 truncated "Experimental features").
2. **`isSelected`, not a hand-rolled highlight.** It emits `aria-current` on a
   `<ul>` list and paints the selected surface from the theme.
3. **Narrow viewports drill down**, per the template: below the breakpoint drop
   the `start` slot entirely, show the nav list full-width with a
   `ChevronRight` affordance, and give the detail pane a `Toolbar` with a ghost
   back button plus the section title. Suppress the in-pane section heading in
   that mode so it is not stated twice.
4. **Breakpoint source** is `useBAIBreakpoint()` from the theme-shim, *not*
   Astryx `useMediaQuery` — see RESPONSIVE-POLICY §2 (`useMediaQuery` returns
   `false` on first render and flashes).
5. **Do not move tab state into the URL as part of this conversion.** The
   left-rail selection is the same page-internal state the antd `Tabs` held.
   Page-level `?tab=` state (nuqs / `useTabQuerySnapshot` on the surrounding
   `BAICard`) is a separate, untouched contract.
6. The shell nests fine inside a `BAICard` — `Layout` is documented as usable
   "standalone for page-level layouts, or inside a container (Card, Section)
   for content-level layouts".

### Remaining surfaces (Phase 3 carry-over: none)

`git grep -n "tabPosition\|tabPlacement\|tabDirection" -- react packages e2e`
returns only doc/comment hits after this change. Four antd `<Tabs>` call sites
are still un-migrated (`DownloadModal`, `RoleDetailDrawerContent`,
`RuntimeParameterFormSection`, `FairShareItems/UsageBucketChartContent`) but all
are **horizontal** — they convert with the ordinary `TabList`/`BAITabs` mapping,
not this idiom. Nothing is queued for REMAINDER.md on account of vertical tabs.

### When it does *not* apply

A genuine tab bar (peer views of one subject, 2–5 of them, no hierarchy) stays
`BAITabs`/`TabList`. This idiom is for the **navigation rail** shape: a list of
sections that select what fills the pane beside it.
