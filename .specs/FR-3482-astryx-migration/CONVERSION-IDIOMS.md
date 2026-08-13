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

---

## 2. antd computed column (`render: (row) => …` with no `dataIndex`) → `render: (_value, row) => …`, **not** an engine that hands back the record

**Status:** ratified 2026-08-09 (user direction, amends `approved-2`).
**Applied in:** `ImageList.tsx`, `CustomizedImageList.tsx`,
`AdminUserCredentialList.tsx`; `BAIArtifactTable.tsx` already had it.
**Notes:** `.scratch/astryx-migration/issues/approved-2-render-contract.md`.

### The trap

A column with no `dataIndex` renders blank (or throws) after the flip. rc-table's
`getPathValue` returns the **whole record** when the path is empty, so under antd
`render: (row) => …` on a computed column works and the app is full of it. The
tempting fix is to teach `BAITableAstryx.readDataIndex` the same trick, so every
call site recovers untouched.

Don't. Reproducing a quirk of the engine being retired inside the engine
replacing it carries the old engine's accidents forward permanently, and makes
`render`'s declared signature lie about its own first argument.

### The contract

`render(value, record, index)`, and nothing more. `value` is what `dataIndex`
points at; no `dataIndex` means no value, so `value` is `undefined` and the
record comes from the **second** argument.

```tsx
// ❌ antd/rc-table idiom — `row` is undefined under BAITableAstryx
{ key: 'fullImagePath', render: (row) => <Foo>{compute(row)}</Foo> }

// ✅ Astryx-native
{ key: 'fullImagePath', render: (_value, row) => <Foo>{compute(row)}</Foo> }
```

### Finding the call sites

Grepping for the `(row)` spelling misses the ones that named the parameter
`record` / `item` / anything else — that is how the Credentials `Allocation`
column was missed on the first pass. Scan structurally instead: a
**single-parameter `render` on a column object literal with no `dataIndex`**
(`.scratch/astryx-migration/scan-render.py` does exactly this over `react/src` +
`packages/backend.ai-ui/src`).

### When it does *not* apply

A column that *has* a `dataIndex` is already correct — its `render` receives the
field value first, as it always did. Nothing to change.

---

## 3. An Astryx slot prop typed `string` is usually a **type**-level constraint, not a structural one — check the render before declaring a capability lost

**Status:** ratified 2026-08-13 (user direction, after the same mistake twice in one day).
**Applied in:** `VFolderNodeDescriptionV2.tsx` (FR-3517, `MetadataListItem.label`),
`ResourceAllocationFormItems.tsx` (FR-3531, `SegmentedControlItem.label`).

### The trap

`astryx component <Name>` prints `label | string`, so a composition that needs a
node there — a copy button beside a metadata label, a help tooltip after a
segment label — looks impossible, and gets written up as "Astryx forces this".
It twice produced a PR body claiming a structural constraint that does not exist.

Most of these props are rendered straight through as JSX children:

```tsx
// @astryxdesign/core/src/MetadataList/MetadataListItem.tsx:158
{label}
// @astryxdesign/core/src/SegmentedControl/SegmentedControlItem.tsx:254
{!isLabelHidden && <span>{label}</span>}
```

Nothing coerces them, so a `ReactNode` renders correctly today.

### The check that decides it

Read the component source in `react/node_modules/@astryxdesign/core/src/`, and
ask **where the prop actually lands**:

| Where the prop goes | ReactNode? |
|---|---|
| Only `{prop}` as a JSX child | **Safe.** |
| Also into an attribute (`aria-label={prop}`, `title=`, `alt=`, `placeholder=`) **conditionally** | Safe **only** on the branch that renders it as a child. `SegmentedControlItem` uses `aria-label={isLabelHidden ? label : undefined}` — safe because the call site does not set `isLabelHidden`. Assert that condition, don't assume it. |
| Into an attribute **unconditionally** | **Unsafe** — React stringifies it. `Layout*`, `Breadcrumbs`, `Pagination`, `Outline`, `ContextMenu`, `CommandPalette` all do `aria-label={label}`. |

Measured 2026-08-13 over `@astryxdesign/core@0.3.0`: **72** `string`-typed
`label`/`title`/`description`/… props are rendered as children, **39** of them
with no attribute path at all. So the answer is "check", not "no".

### How to pass it

Not a cast at every call site. Put it behind one wrapper, per
`.claude/rules/component-props-extension.md`:

```tsx
export interface BAIFooProps extends Omit<FooProps, 'label'> {
  label?: ReactNode;
}
```

and cast once inside. The wrapper header carries the one-line reason (the prop
is typed `string` but rendered as a child), not the investigation.

### Two things to verify after using it

1. **The accessible name.** The element's name now comes from its rendered
   content, so anything you add joins it. Check with a role-based query
   (`getByRole('radio', { name: '…' })`) that the name is still what it was.
2. **Sorting / comparison code.** A `string` label may be fed to `localeCompare`
   or used as a React key somewhere upstream. Grep before widening.

### Upstream

These props want to be `ReactNode` in Astryx itself wherever there is no
attribute path. Worth reporting rather than carrying wrappers forever.
