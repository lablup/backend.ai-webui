# p3-w3a — convert the remaining pages and residual app components

**Target:** to-astryx (phase 3, wave 3, agent A — final conversion wave)
**Base:** `92d98a7cc` (`chore(astryx): regenerate remainder inventory after phase-3 wave 2`)
**Status:** done

Scope handed over: the **9 `app · pages`** files, the **18 `app · components`**
files, and `react/src/helper/index.tsx` from `app · other`, as reported by
`node scripts/migration-gates/antd-remainder-report.mjs --json`.

Outcome: **`app · pages` is now zero.** Every one of the 9 pages converted.
Of the 18 components, 2 were already antd-free (report false positives — see
§"Measurement bug" below), 2 converted, and 14 are documented exclusions or
another agent's file.

---

## Triage table

### `app · pages` — 9/9 converted

| File | antd removed | Notes |
|---|---|---|
| `AdminUsersPage.tsx` | `CardTabListType` (`antd/es/card`) | → `BAICardTabItem`, newly exported from BUI's own barrel. The deep-subpath type import is gone (P15). |
| `AstryxStylexProbePage.tsx` | `Button` | The `#antd-btn` side-by-side reference button is DELETED. See **W3A-1**. |
| `DiagnosticsPage.tsx` | `Collapse`, `Dropdown`, `Empty`, `Skeleton`, `Switch`, `Typography`, `message` | `CollapsibleGroup`+`Collapsible` / `DropdownMenu` / `EmptyState` / `BAISkeletonAstryx` / `Switch` / app-shim `message`. See **W3A-2**, **W3A-3**, **W3A-4**. |
| `ProjectPage.tsx` | `Tooltip` | Wrapper dropped entirely: `BAIButton` forwards `title` to Astryx's own `tooltip` **and** uses it as the icon-only accessible name. |
| `ReservoirArtifactDetailPage.tsx` | `Button`, `Typography`, `Descriptions`, `Tooltip` | `Button` / `Heading`+`Text`+`Link` / `MetadataList`+`MetadataListItem` / six `Tooltip` wrappers folded into `title`. See **W3A-5**, **W3A-6**. |
| `ReservoirPage.tsx` | `Col`, `Row`, `Statistic`, `Card`, `Button`, `Tooltip` | `Grid` (R1 recipe) / lab `Stat` / `Card` / `Button` / `IconButton`. See **W3A-7**, **W3A-8**. |
| `SchedulerPage.tsx` | `Button`, `Result`, `Skeleton`, `Tooltip` | `Button` / `EmptyState` / `BAISkeletonAstryx` / `Tooltip`. See **W3A-9**. |
| `SessionLauncherPage.tsx` | `Checkbox`, `Input`, `InputNumber`, `Radio`, `Select`, `Space`, `Steps`, `Switch`, `StepsProps` | The whole control set moves to the shared `astryxFormControls` adapters + `InputGroup` + lab `Stepper`. See **W3A-10** … **W3A-15**. |
| `StatisticsPage.tsx` | `Skeleton` | `BAISkeletonAstryx` inside a padded box. See **W3A-16**. |

### `app · components` — 2 converted, 14 not mine / parked

| File | Verdict | Reason · unpark condition |
|---|---|---|
| `FolderExplorerHeader.tsx` | **converted** | `Typography.Title` was only passed as `EditableVFolderName`'s `component` prop. Closes the W2A-13 cross-partition note: now `variant="title" level={3}`, and the inert `ellipsis`/`inputProps` go with it. |
| `ImageEnvironmentSelectFormItems.tsx` | **converted** | `Select.Option`/`Select.OptGroup`/`RefSelectProps`. See **W3A-17**, **W3A-18**. |
| `Chat/ChatInput.tsx` | **already clean** | FALSE POSITIVE in the report (its `@ant-design/x` import is already `import type`). No change needed. |
| `VFolderTextFileEditorModal.tsx` | **already clean** | FALSE POSITIVE — the only match is the string `from 'antd/es/upload'` inside a P15 explanatory COMMENT. No change needed. |
| `BAIFormItem.tsx` | skipped | **PARKED.** antd `Form` engine + `FormItemProps` + `antd/es/form/context`. Unparks when the self-hosted form engine (`form-engine/engine.ts`, ticket 34) is un-parked. |
| `InputNumberWithSlider.tsx` | skipped | **PARKED** with `SessionFormItems`. Same unpark condition as the form engine. |
| `DefaultProviders.tsx` | skipped | `App` / `ConfigProvider` / `theme` provider layer — final-switch material. Unparks with the ConfigProvider retirement (`BAIConfigProvider`, the last `BUI · components` entry). |
| `MainLayout/MainLayout.tsx` | skipped | Same `ConfigProvider` layer. `App` alone could move to `../app-shim`, but the file keeps antd for `ConfigProvider` either way, so the gate does not move; deferred to the ConfigProvider retirement so both leave together. |
| `ThemeAdminProvider.tsx`, `ThemeSecondaryProvider.tsx`, `ReverseThemeProvider.tsx`, `ThemeAccentColorPicker.tsx`, `BrandingSettingItems/FontFamilySettingItem.tsx`, `BrandingSettingItems/ThemeColorPicker.tsx` | skipped | **theme-ALGORITHM producers** (`theme.getDesignToken` / `ConfigProvider` theme layer), skip-listed since ticket 09. Unparks when the theme shim stops deriving antd design tokens. |
| `LightDarkColorPicker.tsx` | skipped | antd `ColorPicker` is **MAPPING verdict NONE** — genuinely absent from Astryx core *and* lab. Unparks on a self-build or a third-party picker decision. |
| `Chat/ChatMessage.tsx`, `Chat/ChatSender.tsx` | skipped | `@ant-design/x` **carrier package** (REMAINDER bucket 3). Not closable by conversion. |
| `TOTPActivateModal.tsx` | skipped | Sibling agent **W3-B**'s file. |

### `app · other`

| File | Verdict | Notes |
|---|---|---|
| `helper/index.tsx` | **converted (type-only)** | `import { AttachmentsProps } from '@ant-design/x'` → `import type`. The carrier package stays (it is bucket 3), but the import is now erased at build time, moving the file out of the RENDER bucket. |
| `form-engine/index.ts`, `hooks/reactPaginationQueryOptions.tsx`, `index.tsx` | out of scope | Not in the handover list. |

**Skip count: 14**, every one a pre-existing documented exclusion, a carrier
package, or another agent's file. Nothing new was parked by this ticket.

---

## PILOT-DECISIONs

| # | Decision |
|---|---|
| **W3A-1** | **The probe page's antd reference button is deleted, not converted.** `AstryxStylexProbePage` rendered `<AntdButton id="antd-btn">` purely to eyeball Astryx against antd while both stacks shipped. Its own docstring lists the five things it proves (StyleX beating `@layer astryx-base`, token resolution both ways, `stylex.props()` on plain elements, the `cssInjectionTarget` sentinel) and none of them reference the antd button; neither does `scripts/verify.sh` nor any e2e locator (grepped). Converting it to an Astryx Button would have produced a third identical Astryx button next to the two the probe already has. |
| **W3A-2** | antd `Collapse items=[…] defaultActiveKey={[all]}` → `CollapsibleGroup type="multiple" hasDividers` + one `Collapsible` per item. `hasDividers` supplies the row hairlines antd's panel chrome drew; the OUTER box border is dropped (Astryx collapsibles are flat, and the list already sits inside a `BAICard`). **The open state must go on the GROUP**: a child's `defaultIsOpen` is ignored once the group coordinates it — measured, every section rendered collapsed — so `defaultActiveKey` becomes the group's `defaultValue`. |
| **W3A-3** | antd `Switch` + a sibling `Typography.Text` caption → ONE Astryx `Switch`. `label` is required and rendered by the control (`labelPosition="end"` is the default), so the separate text node is not merely redundant: under antd the Switch and that Text were unassociated siblings, i.e. the toggle had **no** accessible name. `size="small"` → `size="sm"`. |
| **W3A-4** | antd `Dropdown menu={{items}}` wrapping an icon-only child button → `DropdownMenu`, which owns its own trigger, so `trigger={['click']}` (the Astryx default) and the per-item `key` (antd's menu model) both disappear. The trigger gains a real accessible name (`button.More`) that the bare `⋮` icon button never had. |
| **W3A-5** | antd `Descriptions column={2} bordered` → `MetadataList columns={2}`; `bordered` has no destination (Astryx renders label/value pairs, not a table grid) and is DROPPED. **`Descriptions.Item span={2}` has no counterpart either**, so the two full-width fields — Last updated and Description — move OUT of the 2-column list into their own `columns="single"` list directly below it. That keeps them full width without a span mechanism and keeps the short fields paired, which is what `span` was expressing. |
| **W3A-6** | **Six `Tooltip` wrappers on the artifact-detail page collapse into `title`.** Every wrapped child is `BAIButton`-shaped (`BAIArtifactRevisionDownloadButton`, `ImportArtifactRevisionToFolderButton`, `BAIArtifactRevisionDeleteButton`), and wave 2's `BAIButton` forwards `title` to Astryx's own `tooltip` AND resolves it as the icon-only accessible name. The delete button was already passing `title`, so it carried the same string twice. Same call at `ProjectPage`. |
| **W3A-7** | antd `Statistic` → lab `Stat`. `Stat` has no `prefix` slot and no per-value color, so the `Brain` glyph moves INTO the ReactNode `value` beside the number, and the `colorPrimary` tint on both the number and the card border is DROPPED (P19 theme-defaults-first — `Stat` already gives the value display emphasis, and `border: 1px solid ${token.colorPrimary}` was hand-painted antd-era chrome). |
| **W3A-8** | `hoverable` + `cursor: 'pointer'` on the Reservoir stat card are DROPPED, not translated. The click handler that justified them (`handleStatisticCardClick`) is commented out in the source, so the affordance was advertising an interaction the card does not have. The single `Col xs={12} sm={8} lg={6} xl={4}` becomes `Grid columns={{minWidth: 200, max: 6}} gap={4}` per RESPONSIVE-POLICY R1 (widest step `xl={4}` = 6-up from 1200px → 1200/6 = 200; gutter 16 → gap step 4), with the W2A-17 `width="100%"` + `minWidth: 0` treatment. |
| **W3A-9** | antd `Result status="warning"` → `EmptyState`, the same route `BAIErrorBoundary` already took: `subTitle` → `description`, `extra` → `actions`, and the status illustration becomes an explicit lucide `TriangleAlertIcon`. |
| **W3A-10** | **The session-type chooser uses RAW `RadioList`/`RadioListItem`, not the shared `AstryxFormRadioList`.** The antd label was two parts — a mode name plus a one-sentence description — and `RadioListItem` has exactly that pair (`label` + `description`). The shared adapter exposes only `endContent`, and routed through it the sentences **overlapped their own labels in both orientations** (measured: `shots/p3-w3a/light-launcher-batch.png`, before). `description` is the slot the shape asks for and it stacks the sentence under the mode name. The adapter is left alone on purpose — every other converted radio group in the app is label-only, and widening it is agent W3-B's file. `Text type="code"` on the mode name is dropped: `label`/`description` are plain STRINGS (P2), and a prose mode name was never code. |
| **W3A-11** | antd `Input.TextArea autoSize` → `AstryxFormTextArea`. `autoSize` has no destination — Astryx `TextArea` takes a fixed `rows` — so the Startup Command field keeps the component default height instead of growing with the command. |
| **W3A-12** | antd `Space.Compact` welding the timeout number field to its unit select → `InputGroup`. Two consequences: (a) `InputGroup.label` is REQUIRED and renders visibly, so it needs `isLabelHidden` when `BAIFormItem` already draws the label — without it the page printed "Batch Job Timeout Duration" twice (measured); (b) Astryx wants a label on BOTH halves, and there is **no localized "Unit" string in any of the 22 catalogues**, so the unit selector reuses the group's own label rather than adding a key that needs 22 translations (P8, the W2A-8 precedent). `tabIndex={-1}` on that select is DROPPED — it took the control out of the tab order, so a keyboard user could never reach it. |
| **W3A-13** | **antd `InputNumber stringMode` survives as `Form.Item getValueFromEvent`.** The two HPC fields are spread straight into the session's `environ` dict (`useStartSession`), where a numeric value would be an invalid env value; antd kept them strings via `stringMode`, and Astryx's `NumberInput` emits `number \| null`. Stringifying at the item boundary preserves the wire contract without a bespoke adapter. Related: the timeout field's cross-field revalidation stays on the child's own `onChange`, because the form engine **composes** a child's trigger handler after its own (`originTriggerFunc` in `form-engine/Field.tsx`) rather than replacing it. |
| **W3A-14** | antd `Switch checkedChildren="ON" unCheckedChildren="OFF"` → `AstryxFormSwitch`; the in-track ON/OFF text has no destination and is DROPPED. The adjacent `Text` already names what the toggle controls and the thumb position carries the state. |
| **W3A-15** | antd `Steps` → lab `Stepper` + `Step` (MAPPING §2 LAB; same call as W2A-15 and ticket 23 — the canary is a real dependency and already in the graph for Drawer/Tour). `current`→`activeStep`, `onChange`→`onStepClick`. **The per-item `status: 'process' \| 'wait'` mapping is DROPPED**: lab derives completed/active/upcoming from `activeStep`, and its `status` is a SEMANTIC enum (accent/success/warning/error) layered on top — `process`/`wait` said nothing `activeStep` does not already say. `size="small"` has no counterpart; `density="compact"` is the nearest axis. `Stepper.label` names the sequence for assistive tech (antd had none) and reuses the page's own `StartNewSession` string. The comment claiming lab "is not yet a dependency of this branch" is deleted — it was stale as of wave 2. |
| **W3A-16** | The `Skeleton` padding on `StatisticsPage` moves to a wrapper box. `BAISkeletonAstryx` forwards `style` to EVERY line in `paragraph` mode, so one shared `style={{padding}}` would repeat the inset per row rather than inset the block once. |
| **W3A-17** | **`Select.Option` / `Select.OptGroup` get first-party carriers instead of an options-array rewrite.** `BAISelect` already accepts antd's children option API and flattens it by reading PROPS — `collect()` never inspects the element TYPE — so `BAISelectOptionItem` / `BAISelectOptionGroup` (render-null markers, new in BUI) are a complete replacement. That matters here because `ImageEnvironmentSelectFormItems`'s option rows are rich JSX (image icon + `TextHighlighter` + metadata `Badge`s) that survive verbatim through `renderOption`; rewriting 400 lines of them into an `options` array would have been a much larger change for the same render. Two other files (`DownloadModal`, `ResourcePresetSelect`) already moved to arrays and are unaffected. |
| **W3A-18** | antd `RefSelectProps` is restated as `{ focus: () => void }`. `BAISelect` accepts `ref` and never attaches it (P26-8 — Astryx `Selector` exposes no imperative handle), so the `envSelectRef.current?.focus()` that jumps the caret on a search prefill has already been a no-op since wave 2; the optional chaining keeps it harmless and the declarations keep compiling without antd. |

---

## Defects found by the screenshots, not by the harness

Four, all fixed in this ticket. Recorded so they are not re-introduced.

1. **`BAICard` printed a JSX tab label TWICE** (`SchedulerPage` read
   *"Fair Share Setting Fair Share Setting ⓘ"*). Astryx `Tab` is
   `label` (a required STRING that doubles as the accessible name) plus
   `endContent`; wave 2's `BAICard` flattened a node label into `label` **and**
   also passed the whole node as `endContent`, so the text rendered on both
   paths. Only the call site knows where a rich label splits, so
   `BAICardTabItem` gains an explicit `endContent` and the fallback guess is
   gone. `SchedulerPage` is the only tabList in the repo passing a JSX label
   (grepped), so nothing else changes.
   Evidence: `shots/p3-w3a/dark-scheduler.png` (before) vs
   `shots/p3-w3a/{light,dark}-scheduler-tab.png` (after).
2. **`CollapsibleGroup` ignores a child's `defaultIsOpen`** — see W3A-2. All
   four Diagnostics sections rendered collapsed where antd had them open.
   Evidence: `shots/p3-w3a/light-diagnostics.png` (before) vs
   `{light,dark}-diagnostics-open.png` (after, `aria-expanded="true"` × 4).
3. **`InputGroup.label` renders visibly** and duplicated the `BAIFormItem`
   label — see W3A-12.
4. **A horizontal `RadioList` overlapped its own descriptions** when they were
   routed through `endContent` — see W3A-10.

## Measurement bug in `antd-remainder-report.mjs` (NOT fixed here)

`classifyAntdImports()`'s regex is

```js
/import\s+([\s\S]*?)\s+from\s+['"](antd(?:\/[^'"]*)?|…|@ant-design\/[^'"]*|…)['"]/g
```

`[\s\S]*?` is lazy but unbounded, so the "clause" it captures can start at an
**earlier** `import` keyword and run through intervening statements — including
their own `from '…'`. Two consequences, both live on this branch:

- `react/src/components/Chat/ChatInput.tsx` is reported RENDER although its only
  `@ant-design/x` import is already `import type` (the match begins at the
  preceding `import ChatSender, {`, whose bare binding reads as a value).
- `react/src/components/VFolderTextFileEditorModal.tsx` is reported RENDER on the
  strength of the string `from 'antd/es/upload'` inside an explanatory
  **comment**; the file has no antd import at all.

Both inflate the `app · components` count by 1 each. `react/src/helper/index.tsx`
is a third instance — its import genuinely converted to `import type` in this
ticket, but the report still lists it for the same reason.

Suggested fix (left to W3-B / the orchestrator, who own infra triage, so two
agents do not edit the same gate script): forbid the clause from crossing a
quote, e.g. `([^'";]*?)` instead of `([\s\S]*?)`. An import clause never
contains a quote or a semicolon, so that bounds the match to one statement while
still spanning newlines.

**Real remaining `app · components` count is 14, not 16.**

---

## Cross-partition notes (for the orchestrator)

1. **`packages/backend.ai-ui/src/components/BAICard.tsx` is touched** (the
   `endContent` tab fix above) and **`BAISelect.tsx`** (the two option
   carriers), plus `components/index.ts` for three new exports. If W3-B's
   defect sweep also lands in `BAICard`, expect a small conflict there.
2. **`astryxFormControls.tsx` is NOT touched** — W3A-10 deliberately routes
   around it so W3-B's consolidation lands clean. If that consolidation adds a
   `description` passthrough to `AstryxFormRadioList`, the local
   `SessionTypeRadioList` in `SessionLauncherPage` can be folded back into it.
3. **`SessionLauncherPage` still shows ~230 `.ant-*` DOM nodes.** They are all
   `.ant-form-item` / `.ant-row` / `.ant-col` from the PARKED form engine, not
   from any control. Every control on the page is Astryx.

---

## Live proof

Dev server on `127.0.0.1:5890` against the shared cluster; scripts
`.scratch/astryx-migration/p3-w3a-shots.mjs` (route sweep + interactions),
`p3-w3a-fixes.mjs` (the four defects above), `p3-w3a-hpc.mjs` (the HPC grid and
the W2A-17 overflow check), `p3-w3a-routes.mjs` (nav discovery).
Light **and** dark pass on every route.

```
loggedIn true    projectPrefix /project/<…>
statistics        tabbed BAICard 5 cards            (BAISkeletonAstryx fallback)
scheduler         stepper 1, tab label rendered ONCE (BAICard endContent fix)
diagnostics       switch 2  collapsible 13  menu 11 items
  -> open state   aria-expanded=true x4              (CollapsibleGroup defaultValue)
admin-users       tab list + table                   (BAICardTabItem)
admin-project     table                              (BAIButton title -> tooltip)
reservoir         lab Stat 1  Grid 1  Card 2  table 1
session-launcher  radio 2  stepper 1  cards 8
  -> batch step   textarea 1  checkbox 13  spinbutton 8
  -> step 2       spinbutton 8  switch 3
  -> HPC manual   2-up NumberInput grid, gridOverflow []   (W2A-17 clean)
astryx-probe      #astryx-btn-override 1  #antd-btn 0
pageErrors []   (every route, both themes, all four scripts)
```

Screenshots: `shots/p3-w3a/{light,dark}-*.png` (16 route shots + the diagnostics
menu / filtered / open states, the launcher batch + step-2 + HPC auto/manual
states, and the scheduler tab). Measurements in
`shots/p3-w3a/measure-p3-w3a*.json`.

### Surfaces not reachable on this cluster (not failures of the conversion)

- **`SchedulerPage`'s `EmptyState` fallback** — it only renders when the
  fair-share query throws; the cluster answers normally, so the branch is
  covered by tsc only.
- **`DiagnosticsPage`'s `EmptyState`** — "show only failed items" still matched
  a failing section (storage volume at 95%), so the empty branch did not paint.
- **`ReservoirArtifactDetailPage`** — the artifact list is empty on this
  cluster, so the detail route has no artifact to open. Covered by tsc and by
  the identical `MetadataList` / `title`-tooltip patterns proven on the pages
  that do render.
- **`ReservoirPage`'s activate/deactivate `IconButton`** — needs a selected
  artifact; none exist here.

### Console warnings observed (NOT from this change)

- Google-Fonts stylesheet blocked by CSP (pre-existing, every route).
- `RelayResponseNormalizer` `Group` / `UserGroup` `__typename` conflict — the
  same backend globally-unique-id violation waves 1 and 2 recorded.

---

## Gate delta

`node scripts/migration-gates/antd-import-graph.mjs`, before measured on the
base tree.

| Gate | Before (`92d98a7cc`) | After |
|---|---|---|
| files scanned | 972 | 972 |
| direct antd | 71 | **60** (−11) |
| transitively antd-reachable | 620 | 631 (+11) |
| antd-free | 281 (28.9%) | 281 (28.9%) |

| Remainder bucket | Before | After |
|---|---|---|
| RENDER total | 61 | **50** (−11) |
| — `app · pages` | 9 | **0** |
| — `app · components` | 18 | 16 reported / **14 real** (see the measurement bug) |
| — `app · other` | 4 | 4 reported / **3 real** |
| TYPE-ONLY | 10 | 10 |

The flat antd-free count is the expected P15 shape, not a stall: all 11 files
left the *direct* bucket and landed in the *transitive* one, because they still
import `backend.ai-ui`, whose barrel reaches antd through the surviving
infrastructure hubs (`locale/index.ts` 652, `theme-shim` 613, `app-shim` 579,
`form-engine` 576, `BAIConfigProvider` 573). Retiring those hubs is what
converts this ticket's 11 files — and wave 2's 37 — to antd-free for free.

`bash scripts/verify.sh` → `=== ALL PASS ===`.
`react` vitest 62 files / 1164 tests pass; `backend.ai-ui` vitest 22 files /
446 tests pass (1 skipped).
