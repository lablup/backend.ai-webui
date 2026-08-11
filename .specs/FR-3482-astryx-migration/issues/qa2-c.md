# QA round 2 — partition C (table-page layout rhythm, drawer headers)

Scope: every page containing a table, plus the shared drawer shell.
Out of scope (siblings): BAICard/BAITabs internals and tab theming (A),
select components / BAIFetchKeyButton internals (B), `Chat/*` (D).

Base: `to-astryx` @ `0a6899059`.
Evidence: `.scratch/astryx-migration/shots/qa2-c/` (light + dark, before/after),
harnesses `qa2c-audit.mjs`, `qa2c-probe.mjs`, `qa2c-bleed.mjs`,
`qa2c-parent.mjs`, `qa2c-drawers.mjs`, `qa2c-gap-drift.mjs`, `qa2c-sxs.mjs`.

---

## 1. Root cause of the table-page rhythm regression

The recurring "arrangement spacing has collapsed" report is **one bug**, in one
shared component, reproducing identically on all 15 table pages.

Astryx's `Table` bleeds out to its container's padding edges so rows can run
edge-to-edge inside a `Card`. Two different scopings:

| axis | classes | scope | intent |
|---|---|---|---|
| inline | `xojxgvx` / `x1fcf3bl` / `xx6qvi6` | **unconditional** | rows always span the card's full width |
| block | `xkibk3` / `xlayyun` | **`:first-child` / `:last-child`** | a table that IS the card's only content sits flush against the card's top/bottom edges |

```css
.xkibk3:first-child { margin-top:    calc(-1 * var(--container-padding-block-start,0px)) }
.xlayyun:last-child { margin-bottom: calc(-1 * var(--container-padding-block-end,0px)) }
```

The block scoping is correct by design. What defeated it is `BAITableAstryx`'s
own DOM: it wraps Astryx's `<Table>` in a dim layer (the loading-state opacity
wrapper) and renders the pagination bar as a **sibling** of that layer. Astryx's
`Table` then renders `<div style="display:contents"><div class="astryx-table-scroll-wrapper">`
inside it — so the scroll wrapper ends up the **only** child of the dim layer and
matches **both** `:first-child` and `:last-child`, no matter where the table
actually sits on the page.

Measured on the Data page before the fix (`qa2c-probe.mjs`):

```
filter row  y=245..277
table       y=265..554     <- margin-top: -24px, so it starts 12px ABOVE the filter row's bottom
pagination  y=538..566     <- margin-bottom: -24px, so it starts 16px ABOVE the table's bottom
```

The wrapper comment in `BAITableAstryx.tsx` shows the previous wave saw the
bottom half of this ("a bottom bar inside it overlaps the last row") and added
the dim wrapper to fix it — which is what made the wrapper an only child and
turned one overlap into two.

### PILOT-DECISION 1 — zero the BLOCK-axis container bleed, keep the INLINE bleed

Astryx's own escape hatch for a nested container is to zero the
`--container-padding-*` custom properties (exactly what `Section`'s
`nestedStyles.inner` does). Applied on the dim layer, block axis only:

```css
.bai-table-astryx-dim-layer {
  --container-padding-block-start: 0px;
  --container-padding-block-end: 0px;
}
```

- **Block axis zeroed.** On every table page in this app the table has a
  filter/action row above it and a pagination bar below it, so the correct
  vertical bleed is always zero. The rhythm falls back to the parent stack's
  gap — which is what the antd `BAITable` did.
- **Inline axis kept.** It is unconditional Astryx behaviour, not a scoping
  accident, and the full-bleed row treatment was already accepted earlier in
  the migration. Fighting it would be an antd-parity shim (MIGRATION-SPEC §0).

Rejected alternative: removing the dim layer so `:first-child`/`:last-child`
resolve against the real layout parent. The dim layer needs a box to carry
`opacity`, `display:contents` cannot, and the first/last-ness would then depend
on each page's markup — a fragile, per-page contract instead of one predictable
rule.

### PILOT-DECISION 2 — table → pagination gap is 12px, not 8px

Legacy `BAITable`'s root was

```tsx
<BAIFlex direction="column" align="stretch" gap={'sm'}>   // sizeSM = 12px
  <Table … />
  <BAIFlex justify="end" gap={'xs'}> <Pagination/> … </BAIFlex>
</BAIFlex>
```

so the measured legacy table→pagination gap is **12px**. `BAITableAstryx` used
`marginTop: token.marginXS` (8px). Changed to `token.marginSM` (12px).

### Result

`gapAbove` = row above the table → table; `gapBelow` = table → pagination bar.

| page | route | before (above/below) | after | legacy target |
|---|---|---|---|---|
| Data (vfolder) | `project/:p/data` | −12 / −16 | **12 / 12** | 12 (`BAIFlex column gap="sm"`) |
| Sessions | `project/:p/session` | −12 / −16 | **12 / 12** | 12 |
| Deployments | `project/:p/deployments` | −12 / −16 | **12 / 12** | 12 |
| My Environments | `project/:p/my-environment` | −12 / −16 | **12 / 12** | 12 |
| Agent Summary | `project/:p/agent-summary` | −12 / −16 | **12 / 12** | 12 |
| Users / Credentials | `admin/users` | −12 / −16 | **12 / 12** | 12 |
| Environments (images/presets/registries) | `admin/environment` | −12 / −16 | **12 / 12** | 12 |
| Resource Policies | `admin/resource-policy` | −12 / −16 | **12 / 12** | 12 |
| Resources / Agents | `admin/agent` | −12 / −16 | **12 / 12** | 12 |
| Scheduler / Fair Share | `admin/scheduler` | −16 / −16 | **8 / 12** | 8 above (`FairShareList` `gap="xs"`, unchanged from legacy) / 12 |
| Storage (admin data) | `admin/data` | −12 / −16 | **12 / 12** | 12 |
| Projects | `admin/project` | −12 / −16 | **12 / 12** | 12 |
| Reservoir | `admin/reservoir` | −12 / −16 | **12 / 12** | 12 |
| RBAC Management | `admin/rbac` | −12 / −16 | **12 / 12** | 12 |
| Admin Deployments | `admin/deployments` | −12 / −16 | **12 / 12** | 12 |

Fix level: **shared component only** — no per-page edits were needed, because
no per-page layout deviation survived the audit (see §3).

---

## 2. Drawer headers

lab `Drawer` has **no title bar**. Its only affordance is `hasCloseButton`,
which paints a ghost icon button **absolutely positioned** in the top-trailing
corner, floating over whatever the content renders first. Every converted
drawer therefore hand-rolled its own `HStack justify="between"` title row inside
the body — so the page's own action buttons sat under (or overlapping) that
floating button, and each drawer's header differed.

Legacy arrangement, read off antd 6.5.0 `DrawerPanel` + its style module and
confirmed by rendering it (`/tmp/drawerprobe.txt`):

```
.ant-drawer-header        display:flex; align-items:center;
                          padding: `padding` `paddingLG`  (16px 24px);
                          border-bottom: `lineWidth` solid `colorSplit`
  .ant-drawer-header-title  flex:1; display:flex; align-items:center
    button.ant-drawer-close   margin-inline-end: `marginXS` (8px)
    .ant-drawer-title         flex:1; font-weight:600; font-size:`fontSizeLG`
  .ant-drawer-extra         flex:none
.ant-drawer-body          flex:1; padding: `paddingLG` (24px); overflow:auto
```

i.e. **`[X] Title …………… [extra]`**, a divider, then a padded scrollable body.

### PILOT-DECISION 3 — the close button is at the START, not the far edge

The brief described legacy as "close X at the far edge". It is not.
`closablePlacement` defaults to `'start'` in antd, and nothing in this repo
overrides it — the only drawer-level config is
`ConfigProvider drawer={{ mask: { blur: false } }}` in `DefaultProviders.tsx`,
and no call site passes `closable`. Rendering antd's `Drawer` with
`title` + `extra` produces `[ant-drawer-header-title[close, title]][ant-drawer-extra]`.
Matched the measured legacy, not the description.

### PILOT-DECISION 4 — one shared shell, `react/src/components/astryx-bui/BAIDrawerAstryx.tsx`

A single wrapper over lab `Drawer` that reproduces the arrangement above, with
`hasCloseButton={false}` so there is exactly one close affordance. Props are
antd's spellings (`open` / `title` / `extra` / `size` / `onClose`) plus
`hasBodyPadding` for the call sites that passed `styles={{ body: { padding: 0 } }}`,
and `headerClassName` for the Electron drag handle. It lives in
`react/src/components/astryx-bui/` rather than in `backend.ai-ui` because BUI
does not depend on `@astryxdesign/lab`.

Migrated (8 drawers, all of them): `SessionDetailDrawer`, `AgentDetailDrawer`,
`StorageHostDetailDrawer`, `DeploymentRevisionDetailDrawer`, `RoleDetailDrawer`,
`ModelCardDrawer`, `BAIHelpDrawer`, `WEBUINotificationDrawer`.

Two per-drawer workarounds disappear with it:

- `WEBUINotificationDrawer` reserved 32px of inline-end padding on its header
  row so the floating close button would not swallow the More menu's hit box
  (measured in a previous wave). The floating button is gone, so the reserve is.
- `BAIHelpDrawer` / `WEBUINotificationDrawer` re-implemented antd's
  `styles.body.padding` overrides inline; they now pass `hasBodyPadding={false}`.

### Measured result (`qa2c-drawers.mjs`)

| drawer | before | after |
|---|---|---|
| Notification | no header; close floating `abs` at (1560,8) over the content | header 16px 24px, 1px divider, 1 close, close-before-title, extra 24px from the trailing edge |
| Agent detail | same | same ✓ |
| Storage host | same | same ✓ |
| Role detail | same | same ✓ |

All four report `closeCount: 1`, `closeBeforeTitle: true`,
`extraAtTrailingEdge: 24`, `padding: "16px 24px"`, `borderBottom: "1px"` —
identical geometry across drawers of three different widths (280 / 800 / 900).

---

## 3. Audit findings that are NOT mine to fix

Recorded here so they are not lost.

1. **`gap="lg"` → `gap={5}` / `gap="xl"` → `gap={6}` mis-mappings.** The two
   ladders are not ordinally aligned: `BAIFlex gap` resolves through the antd
   size ladder (`lg`=24, `xl`=32), Astryx `Stack gap={N}` resolves through
   `--spacing-N` = N×4. Mapping by rung position instead of by pixel value
   shifts spacing. `qa2c-gap-drift.mjs` flags 100 files with a changed gap
   histogram; the confirmed value-shifts are in **modals**, not table pages —
   `SharedFolderPermissionInfoModal(.V2)` (24→20) and `InviteFolderSettingModal`
   (32→24, plus two 0-gap columns that became 16). Correct table:
   `xxs→1 xs→2 sm→3 ms→4 md→5 lg→6 xl→8` (`xxl`=48 has no step; `gap` maxes at 10=40px).
2. **Table-page vertical stacks themselves are clean.** `qa2c-sxs.mjs` over
   every `BAITable`-bearing surface shows the page-level column gaps were
   carried over correctly (e.g. `VFolderNodeListPage` `gap="md"`(20)→`gap={5}`(20),
   `gap="sm"`(12)→`gap={3}`(12)). No per-page layout regression found.
3. **`BAICard tabList` → raw `Card padding={6}` + `TabList` + `VStack gap={4}`**
   on `EnvironmentPage`, `ResourcesPage`, `MyEnvironmentPage`, `AgentSummaryPage`.
   This introduces a 16px gap between the tab bar and the content where the
   legacy card header/body boundary was. **Sibling A's tab/card scope** — left
   untouched to avoid a cherry-pick conflict.
4. **`.astryx-card` computes `padding: 23px`**, not 24. Astryx's Card subtracts
   its border width from the padding. BAICard internals = sibling A.
5. **`/admin/diagnostics` (error logs)** renders no `BAITableAstryx` on its
   default tab, so it is not in the table above. `ErrorLogList`'s own stack
   (`BAIFlex column gap="xs"`) is unchanged from `origin/main`, and the shared
   fix applies to it whenever its tab is selected.
