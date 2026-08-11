# p3-w2a — convert app components (partition A) to Astryx

**Target:** to-astryx (phase 3, wave 2, agent A)
**Base:** `3622a87a5` (`chore(astryx): regenerate remainder inventory after phase-3 wave 1`)
**Status:** done

Partition A is 47 files under `react/src/components/**` (the list the orchestrator
handed over). Every antd VALUE import in them is gone except the four documented
exclusions; four type-only antd imports were removed as well (§6 of MAPPING —
"a type-only antd import is still an antd import").

---

## Converted / skipped

| File | antd removed | Notes |
|---|---|---|
| `AgentSelect.tsx` | `Select`, `SelectProps` | Rebuilt on `BAIComplexSelect` (P26-*). See **W2A-1**. |
| `AllocationHistory.tsx` | `Alert`, `Select`, `Skeleton` | `Banner` / `Selector` (`isLabelHidden` under the `Form.Item` label) / `BAISkeletonAstryx`. `popupMatchSelectWidth` dropped (no destination). |
| `AllocationHistoryStatistics.tsx` | `Card` | `BAICardAstryx`. See **W2A-2**. |
| `AssignRoleModal.tsx` | `Tooltip`, `Typography` | `Tooltip content=`, `Text`. `style={{color:'inherit'}}` → `color="inherit"`; `{color: colorTextSecondary}` → `color="secondary"`. |
| `AutoScalingRuleEditorModal.tsx` | `AutoComplete`, `InputNumber`, `Radio`, `Select`, `Skeleton`, `Typography`, `DefaultOptionType` | See **W2A-3**, **W2A-4**, **W2A-5**. |
| `AutoScalingRuleEditorModalLegacy.tsx` | `AutoComplete`, `Input`, `InputNumber`, `Radio`, `Select`, `Space`, `Typography` | `Space.Compact` → `InputGroup`; see **W2A-3**, **W2A-6**. |
| `AutoScalingRuleListLegacy.tsx` | `Button`, `Tag`, `Tooltip`, `Typography` | `IconButton variant="ghost"` with real i18n labels (P8); `Badge`; `Tooltip content`. |
| `AutoScalingRuleListNodes.tsx` | `Tag`, `Tooltip`, `Typography` | `Badge` / `Tooltip content` / `Text`. Tooltip children wrapped in a `<span>` (Astryx needs an element trigger). |
| `BAICodeEditor.tsx` | `Skeleton` | `BAISkeletonAstryx`. |
| `BAIFormItem.tsx` | — | **SKIPPED (exclusion).** antd `Form` engine + `FormItemProps` + `antd/es/form/context` — the parked form decision. |
| `BAIGeneralNotificationItem.tsx` | `Button`, `Card`, `List`, `Typography` | See **W2A-7**. |
| `BAIJSONViewerModal.tsx` | `Alert` | `Banner status="warning"`, `showIcon` dropped. |
| `BAIMultiStepNotificationItem.tsx` | `Button`, `List`, `Typography` | See **W2A-7**; `Button type="link" size="small"` → `Link` (size dropped). |
| `BAINotificationBackgroundProgress.tsx` | `Progress` | See **W2A-8**. |
| `BAINotificationButton.tsx` | `Badge`, `Button`, `Tooltip`, `ButtonProps` | `IconButton variant="ghost"` + `BAIBadgeCountAstryx hasDot variant="error"` (the §3.8 NONE branch, already self-built in wave 1). Props no longer extend antd's (P1 grep: the only consumer passes `data-testid`). |
| `BAIPanelItem.tsx` | `Progress`, `ProgressProps`, `Typography` | See **W2A-9**. `BAIPanelItem.css` deleted (P6). |
| `BAIProgress.tsx` | `ProgressProps`, `Typography` | Never rendered an antd `Progress` — the bar is two hand-built boxes; `ProgressProps` only supplied three field types, now restated. |
| `BAIRadioGroup.tsx` | `RadioGroupProps` (type) | Restated the three borrowed props + the antd change-event shape locally. 20 call sites at zero diff. |
| `BAITabs.tsx` | `TabsProps` (type) | Same tactic; 6 call sites at zero diff. |
| `BAIVirtualFolderNodeNotificationItem.tsx` / `…V2.tsx` | `Card`, `List`, `Typography` | Nested `List.Item` dropped (it sat INSIDE the one `BAINotificationItem` already renders); `Card size="small"` → `Card padding={4}`; `Typography.Link` → `Link`; `Typography.Text copyable` → `BAIText`. |
| `BrandingSettingItems/FontFamilySettingItem.tsx` | — | **SKIPPED (exclusion).** theme-ALGORITHM producer (`theme.getDesignToken`), skip-listed since ticket 09. |
| `BrandingSettingItems/ThemeColorPicker.tsx` | — | **SKIPPED (exclusion).** Same, plus three type-only theme-internal imports. |
| `Chat/ChatInput.tsx`, `Chat/ChatMessage.tsx` | — | Already antd-free (wave-1 ticket 23). |
| `Chat/ChatSender.tsx` | `GetRef`, `UploadProps` (types) | Re-derived from `@ant-design/x`'s own `AttachmentsProps`; `GetRef` → `React.ComponentRef`. `@ant-design/x` itself is the documented carrier and stays. |
| `ComputeSessionNodeItems/AppLauncherModal.tsx` | `Input`, `InputNumber`, `ModalProps` | `AstryxFormNumberInput` in the bound item, raw `TextInput` in the unbound one, `BAIModalProps`. |
| `…/ContainerCommitModal.tsx`, `…/TensorboardPathModal.tsx` | `Input` | `AstryxFormTextInput`. |
| `…/EditableSessionName.tsx` | `Input` | See **W2A-10**. |
| `…/SessionActionButtons.tsx` | `ButtonProps` (type) | antd `size` union restated locally; both consumers at zero diff. |
| `…/SessionStatusDetailModal.tsx`, `…/TerminateSessionModal.tsx` | `ModalProps` (type) | → `BAIModalProps` (the render was already `BAIModal`). |
| `ConfigurableResourceCard.tsx` | `Button`, `Dropdown`, `MenuProps`, `Skeleton` | `DropdownMenu` with a native `section`; see **W2A-11**. |
| `CopyableCodeText.tsx` | `Typography` | `BAIText copyable code` (the repo's Astryx-native home for both affordances). |
| `DatePickerISO.tsx` | `DatePicker`, `PickerProps`, `GetRef` | See **W2A-12**. |
| `DefaultProviders.tsx` | — | **SKIPPED (exclusion).** `ConfigProvider`/`App`/`theme` provider layer — final-switch material. |
| `DiagnosticResultList.tsx` | `Alert`, `Skeleton`, `Typography`, `antd/lib/typography/Paragraph` | `Banner` / `BAISkeletonAstryx` / `Text as="p" display="block"`. |
| `DomainStoragePermissionTable.tsx` | `Typography` | `Text maxLines={1}` (antd `ellipsis={{tooltip}}` — Astryx tooltips truncated text by default). |
| `DownloadModal.tsx` | `Alert`, `Select`, `Button`, `Descriptions`, `Divider`, `Tooltip`, `Tabs`, `Typography` | `MetadataList` (+ `bordered` dropped), `Selector`, `Button variant="secondary"`, `Banner`, `Divider`, `Tooltip content`, `BAITabs`. |
| `EditableVFolderName.tsx` | `Input`, `GetProps`, `Typography`, `InputProps` | Rebuilt following `EditableVFolderNameV2`; see **W2A-13**. |
| `EnvVarFormList.tsx` | `AutoComplete`, `Input`, `InputRef` | See **W2A-3**, **W2A-14**. |
| `FairShareItems/DomainFairShareTable.tsx` / `ProjectFairShareTable.tsx` / `ResourceGroupFairShareTable.tsx` | `Divider`, `Typography` | `Divider orientation="vertical"` (antd `type="vertical" style={{margin:0}}`), `Text color="secondary"`. |
| `FairShareItems/FairShareList.tsx` | `Alert`, `Skeleton`, `Steps`, `Tooltip`, `Typography`, `StepsProps` | See **W2A-15**. `FairShareList.css` deleted (P6). |
| `FairShareItems/FairShareWeightSettingModal.tsx` | `Alert`, `Input`, `InputNumber`, `Skeleton` | `Banner` / `AstryxFormTextInput` / `AstryxFormNumberInput` / `BAISkeletonAstryx`. |
| `FairShareItems/ResourceGroupFairShareSettingModal.tsx` | `Col`, `Input`, `InputNumber`, `Row` | See **W2A-16**, **W2A-17**. |

**Skip count: 4** (`BAIFormItem`, `DefaultProviders`, the two `BrandingSettingItems`)
— every one of them a pre-existing, documented exclusion, unchanged by this ticket.

---

## PILOT-DECISIONs

| # | Decision |
|---|---|
| **W2A-1** | `AgentSelect` is rebuilt on `BAIComplexSelect`, not `Selector`: MAPPING §3.1 routes a Relay-backed, server-searched, rich-row select to `ComplexSelector`. The OUTER value contract stays plain `string`/`string[]` (`labelInValue` lives strictly between this wrapper and `BAIComplexSelect`), so `ResourceAllocationFormItems` — another partition's file, inside `Form.Item name="agent"` — is at zero diff. The per-option resource figures move from the antd ReactNode `label` to `extra` (P26-3), and `labelRender` becomes an accepted NO-OP: it existed only to force the trigger to show the agent id, which is now the option's string `label` anyway. |
| **W2A-2** | antd `Card type="inner"` → `BAICardAstryx`. The inner variant differed from the outer by a tinted header strip, a 14px title and 16px body padding; Astryx has no header strip to tint, so the two carried-over metrics are `Heading level={4}` (the 14px rung) and `padding={4}`. The tint is DROPPED rather than rebuilt as a CSS block fighting `astryx-card`. |
| **W2A-3** | **antd `AutoComplete` → `TextInput` at all three call sites** (`AutoScalingRuleEditorModal`, `…Legacy`, `EnvVarFormList`). MAPPING §3.15 is explicit that free-text `AutoComplete` does NOT map to `Typeahead` (which commits `T \| null` and cannot keep a typed string), and free text is genuinely required: `METRIC_NAMES_MAP.INFERENCE_FRAMEWORK` is an EMPTY list, and env var names are arbitrary by definition. Rebuilding `TextInput` + `Popover` is out of scope, so the known names move into the **placeholder** — discoverability survives with no new i18n key and no new component. The client-side `onSearch` filter goes with the dropdown. |
| **W2A-4** | The preset `Select`'s per-option `description` line is dropped (P26-3 — Astryx `SelectorOptionData` carries `value`/`label`/`icon` only; rich option rows need the ComplexSelector track, which a static preset list does not warrant). The antd `<OptGroup>`-shaped `{label, options}` grouping survives as Astryx's native `{type:'section', title, options}`. |
| **W2A-5** | antd `InputNumber prefix` (the ±/+/− sign on Step Size) has no `NumberInput` destination — `startIcon` takes an icon COMPONENT, not text (MAPPING §3.17). The sign moves beside the field as its own `Text`, the shape the threshold rows in the same form already use. The field's `name`/`rules` move to a `noStyle` inner `Form.Item` (antd's own pattern for a decorated control); errors still surface on the outer item through `NoStyleItemContext`. |
| **W2A-6** | The legacy comparator `Select` passed a ReactNode option label plus `optionLabelProp="selectedLabel"`. Astryx option labels are STRINGS and there is no `optionLabelProp`, so the two-part row collapses to one string, `"<label> (<value>)"`, which carries both halves. The threshold `Input suffix` ("%") becomes a placeholder suffix rather than a second `InputGroup` addon box. |
| **W2A-7** | antd `List.Item` at the notification-drawer item roots → a plain block plus `BAINotificationListItem.css` (16px block padding + the row hairline, `:not(:last-child)`). Astryx `ListItem` is a fixed label/description/start/end row and cannot hold a multi-row notification body. **The CSS is deliberately self-contained** so it stays correct whether the surrounding `WEBUINotificationDrawer` (partition **W2-C**) is still antd's `List` or already Astryx's — the two changes can land in either order. Per-component CSS justification: two metrics, both previously supplied by an antd component that is going away (P6/P17). |
| **W2A-8** | `Progress size="small" showInfo={false}` → `ProgressBar`. `strokeColor={colorTextDisabled}` for a rejected task → `variant="neutral"` (P5, closed enum); `size="small"` has no destination. `label` is required and antd shipped none (P8) — the existing `general.InProgress` string names it in all 22 locales rather than adding a key that would need 22 translations. |
| **W2A-9** | antd `Progress steps={12} size={[5,12]}` (a 12-pill segmented bar) → `ProgressBar`, a continuous track. §3.11 grades `steps` NONE and `strokeColor` NONE. **No live call site passes `percent`** (grepped: `StorageStatusPanelCard`, `BulkCreateUserFromCSVModal`, `SessionCountDashboardItem` pass only title/value/unit/color/style), so the segmented look has no render to regress. `BAIPanelItem.css` existed only for `.ant-progress-steps-item` and dies with it. |
| **W2A-10** | The inline session-rename field keeps a LOCAL `Form.Item` adapter rather than the shared `AstryxFormTextInput`: it needs `size="lg"` and an Escape-to-cancel `onKeyDown`, and widening the shared surface for one editor is not worth the blast radius. The antd `suffix={<CornerDownLeftIcon/>}` "press Enter" hint is DROPPED — §3.6 gives `suffix` no `TextInput` destination and `InputGroup` welds a bordered addon box that reads as a button, not as a faint hint. |
| **W2A-11** | `ConfigurableResourceCard`'s `Dropdown menu.selectable` + `defaultSelectedKeys` check mark on the active panel is DROPPED. `DropdownMenu` action items carry no selected state (only `DropdownMenuRadioGroup`, a compound-children form a three-entry menu does not warrant), and the card BELOW the button already shows which panel is active — the check was a second, weaker channel. antd's `{type:'group', children}` becomes Astryx's native `{type:'section', title, items}`. |
| **W2A-12** | `DatePickerISO` → `DateTimeInput` (§3.13, which CORRECTS ticket 04's "no Date family"). The wrapper already existed to be the dayjs↔string boundary, so it is now also the dayjs↔`ISODateTimeString` boundary; the public surface (`disabled`, `showTime`, `localFormat`, `disabledDate(dayjs)`) is unchanged so `SessionLauncherPage` stays at zero diff. `showTime` becomes an accepted NO-OP (`DateTimeInput` always renders the time portion); `disabledDate` is translated into `dateConstraints` (native `Date` re-wrapped in dayjs — antd's "true disables" semantics are identical); the antd `ref`/`GetRef` handle is dropped (§6.2, no consumer holds it). |
| **W2A-13** | `EditableVFolderName` is rebuilt from `EditableVFolderNameV2` line for line so the eventual deletion of V1 is a pure removal. Its **legacy antd-shaped props are ACCEPTED, not removed** — `component`, `level`, `ellipsis`, `inputProps`, `editable={{triggerType}}` — because the only JSX consumer, `FolderExplorerHeader`, belongs to partition **W2-B**. `component`/`level` select `variant="title"`; `ellipsis`/`inputProps` are inert. W2-B can adopt `variant="title"` on its own schedule without a cross-partition merge conflict. |
| **W2A-14** | `EnvVarFormList` loses the antd `InputRef.focus()` that jumped the caret into the row just added. Astryx uses a `handleRef` convention rather than `ref` + `InputRef` (§6.2) and `AstryxFormTextInput` exposes no ref slot — the same call wave 1 made for the select stack (P26-8). |
| **W2A-15** | antd `Steps type="panel"` → lab `Stepper` + `Step` (§2 verdict LAB; the canary is already in the graph for `Drawer`). `Step.label`/`description` are required STRINGS, so each antd `title` — a `BAIFlex` of "<section name>" + a truncated "(<selected value>)" — splits into exactly those two slots (P2), dropping the hand-built ellipsis/tooltip because `Step` truncates its own description. Also dropped: `type="panel"`'s arrow-chevron skin (no counterpart — `Stepper` draws a progress track), the per-item `icon={<Ban/>}` on unreachable steps (`isDisabled` already says it and `Step` owns its indicator), and `styles.itemTitle`. antd's two callbacks (`Steps.onChange` + per-item `onClick`) collapse into `onStepClick`, which runs both. |
| **W2A-16** | antd `Row gutter={[24,16]}` + `Col span={12}` (fixed 2-up over antd's 24-column grid, no breakpoint props) → Astryx `Grid columns={2}`. The gutter resolves to spacing steps **by value, not by name** (P9): 24px = step 6 across, 16px = step 4 down. The `Col` wrappers' `alignSelf:'start'` becomes the grid's own `align="start"`. |
| **W2A-17** | **Bug found and fixed by the screenshot, not by the harness** (recorded so it is not re-introduced): with `Grid columns={2}` the right-hand column overflowed the dialog and its field was clipped at the modal edge. CSS grid items default to `min-width: auto`, so a `width: 100%` Astryx field pushes its track past the container. Fixed with `width="100%"` on the `Grid` plus `style={{ minWidth: 0 }}` on every `Form.Item` that is a direct grid child. Every `Row`/`Col` → `Grid` conversion in later waves needs the same treatment. Evidence: `shots/p3-w2a/{light,dark}-rg-setting-modal.png` (after) vs the clipped first capture. |

---

## Cross-partition notes (for the orchestrator)

1. **`WEBUINotificationDrawer` (W2-C)** — my three notification items no longer
   render `List.Item`. If W2-C converts the surrounding antd `List` to Astryx's
   `List`, do **not** pass `hasDividers`: the item root already draws its own
   hairline (W2A-7), and both would double up.
2. **`FolderExplorerHeader` (W2-B)** — `EditableVFolderName` still accepts the
   legacy antd-shaped props, so nothing is forced. When W2-B removes
   `component={Typography.Title}`, switch to `variant="title" level={3}`.
3. **`ResourceAllocationFormItems` / `SessionLauncherPage`** — untouched.
   `AgentSelect` and `DatePickerISO` keep their antd-shaped surfaces on purpose.

## Pre-existing finding NOT fixed here (out of partition)

**The `Downloads` modal renders on DARK surfaces in LIGHT mode.**
`WebUIHeader` wraps `UserDropdownMenu` in `<MediaTheme mode="dark">` (a wave-1
decision, so the dropdown panel reads correctly on the orange accent band).
`DownloadModal` is rendered *by* `UserDropdownMenu`, so its `BAIModal` inherits
that `color-scheme: dark` context. Probe (`p3-w2a-modal-probe.mjs`): an
untouched `BAIModal` opened from page content reports
`background rgb(255,255,255)` in light mode, so the dialog stack itself is fine
— only the header-hosted one flips. The fix belongs in `UserDropdownMenu` /
`WebUIHeader` (render the modal outside the `MediaTheme` band), both outside
partition A. Evidence: `shots/p3-w2a/{light,dark}-download-modal.png`,
`shots/p3-w2a/probe-createfolder-light.png`.

---

## Live proof

Dev server on `:5850` against the shared cluster
(`.scratch/astryx-migration/p3-w2a-shots.mjs` route sweep,
`p3-w2a-launcher.mjs`, `p3-w2a-modals.mjs`, `p3-w2a-fairshare.mjs`,
`p3-w2a-fairshare2.mjs`, `p3-w2a-modal-probe.mjs`). Light **and** dark pass on
every route. Measurements in `shots/p3-w2a/measure-*.json`.

```
loggedIn true
statistics            banner 1  selector 1  cards 4       (AllocationHistory + GraphCard)
scheduler-fairshare   stepper 1 steps 4  banner 2 table 1 (lab Stepper live)
  -> domain step      rows 2  steps 4  dividers 4         (DomainFairShareTable)
  -> weight modal     dialogs 1  spinbuttons 1            (FairShareWeightSettingModal)
  -> gear modal       dialogs 1  spinbuttons 5  "Days" x6 (RG setting modal, NumberInput units)
diagnostics           banner 1  text 13                   (DiagnosticResultList)
session launcher      step 2 renders; +2 env var rows     (EnvVarFormList)
sessions / deployments / data / dashboard   render, no errors
notification drawer   opens in both themes                (BAINotificationButton)
download modal        BAITabs 2 + MetadataList + Selector  (DownloadModal)
pageErrors []   (every route, both themes, all five scripts)
```

Screenshots: `shots/p3-w2a/{light,dark}-*.png` (20 route shots + launcher,
env vars, fair-share domain, three modals, and the theme probe).

### Surfaces not reachable on this cluster (not failures of the conversion)

- **`AgentSelect`** — `SessionLauncherPage` gates it on
  `!hideAgents && baiClient.supports('agent-select')`, which this manager does
  not report, so `ResourceAllocationFormItems` never mounts it. Covered by tsc +
  the `BAIComplexSelect` harness only.
- **`DatePickerISO`** — behind the launcher's BATCH session type, whose schedule
  toggle did not appear on this cluster.
- **`AutoScalingRuleListNodes` / `…Legacy` / both editor modals** — the
  deployment list is empty here (`no deployments on this cluster`).
- **`BAIGeneralNotificationItem` / `BAIMultiStepNotificationItem` /
  `BAIVirtualFolderNodeNotificationItem[V2]`** — the drawer opened in both
  themes but the account had **no notifications**, so the item rows themselves
  did not render.
- **`AppLauncherModal`, `ContainerCommitModal`, `TensorboardPathModal`,
  `SessionStatusDetailModal`, `TerminateSessionModal`, `EditableSessionName`,
  `SessionActionButtons`** — need a running session; none on this cluster.
- **`DomainStoragePermissionTable`** — behind a storage host detail drawer whose
  backend does not support the panel here ("This storage backend does not
  support quota").

### Console warnings observed (NOT from this change)

- Google-Fonts stylesheet blocked by CSP (pre-existing, every route).
- `RelayResponseNormalizer` `Group` / `UserGroup` `__typename` conflict — the
  same backend globally-unique-id violation wave 1 recorded.

---

## Gate delta

Both numbers measured with `node scripts/migration-gates/antd-import-graph.mjs`,
the "before" run against a checkout of the base tree.

| Gate | Before (`3622a87a5`) | After |
|---|---|---|
| `antd-import-graph.mjs` files | 968 | 968 |
| direct antd | 256 | **215** (−41) |
| transitively antd-reachable | 446 | 483 (+37) |
| antd-free | 266 (27.5%) | **270 (27.9%)** (+4) |

Read the transitive rise as the expected P15 shape, not a regression: 41 files
left the *direct* bucket, and 37 of them landed in the *transitive* one because
they still import `backend.ai-ui`, whose barrel reaches antd through the
surviving hubs (`locale/index.ts` 637, `theme-shim` 625, `app-shim` 579,
`BAIButton` 577, `form-engine` 576, `BAISelect` 575, `BAICard` 572, …). Those
hubs are partition **W2-D**'s job; retiring them is what converts this ticket's
37 files from "transitively reachable" to "antd-free" for free.

The four exclusions (`BAIFormItem`, `DefaultProviders`, the two
`BrandingSettingItems`) are what keeps partition A's own direct-antd count at 4
rather than 0.

`bash scripts/verify.sh` → `=== ALL PASS ===`.
`react` vitest 62 files / 1164 tests pass; `backend.ai-ui` vitest 22 files /
446 tests pass (1 skipped).
