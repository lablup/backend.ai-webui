# Phase 3 · wave 2 · ticket W2-D — BUI components + fragments → Astryx

In-place frontier rewrites of 60 `backend.ai-ui` modules: the display/input
primitives wave 1 did not reach, the `fragments/*` Relay components, the
FileExplorer tree, and `Table/BAINameActionCell`. Every component keeps its
**antd-shaped public prop surface** (frontier rule) so no consumer file
changes; only the internals move to Astryx, and every antd *type* import is
replaced by a locally-declared equivalent so the modules drop out of the antd
import graph (P15).

**Excluded and untouched, as briefed:** `BAIConfigProvider` (final-switch
material — it is the antd `ConfigProvider` mount point itself), and the antd
form ENGINE (`Form` / `Form.Item` / `FormInstance` via `../form-engine`, which
stays PARKED). Form-hosting modals in this slice had their non-form antd
imports converted while the engine was left alone.

---

## Conversion table

| # | Module | Astryx target | Contract kept? | Dropped / changed |
|---|---|---|---|---|
| 1 | `BAIButton` | `Button` / `IconButton` | ✅ antd-shaped (+ `color`, `variant`) | `ghost`, `shape`, `htmlType`, `iconPosition` (no call sites); `type="dashed"` → secondary (D3) |
| 2 | `BAIBackButton` | `IconButton` | ✅ | — (gains an accessible name, D2) |
| 3 | `BAICard` | `Card` + `VStack`/`HStack` + `TabList` + `Divider` | ✅ antd `Card`-shaped | `styles.{header,body}` (D5), `tabList[].disabled`, `bordered`→Astryx `variant` |
| 4 | `BAICheckbox` | `CheckboxInput` | ✅ | the whole hand-painted error CSS → native `status` (D7) |
| 5 | `BAIUncontrolledInput` | `TextInput` / `NumberInput` | ✅ | the ⏎ suffix hint (D9); `.css` deleted |
| 6 | `BAIBulkEditFormItem` | `TextInput` + `Link` | ✅ | placeholder chevron + `variant="filled"` (D10) |
| 7 | `BAIDynamicStepInputNumber` | `NumberInput` + `InputGroup` + ladder controls | ✅ | `onStep` → explicit controls (D11); `addonAfter` → `units` |
| 8 | `BAIDynamicUnitInputNumber` | `InputGroup` + `NumberInput` + `Selector` + ladder controls | ✅ | `onStep`, `stringMode`, the raw `input` listener (D11–D13) |
| 9 | `BAIDynamicUnitInputNumberWithSlider` | `Slider` | ✅ | `extraMarks` JSX labels flatten (D14); `warn` track tint inert (D15) |
| 10 | `BAIFetchKeyButton` | `ButtonGroup` + `DropdownMenu` + `DropdownMenuRadioGroup` | ✅ | the faked check-mark column → native `menuitemradio` (D16) |
| 11 | `BAISelect` | `Selector` / `MultiSelector` | ✅ antd `Select`-shaped | `searchAction`, `endReached`, `popupRender`, `notFoundContent`, `suffixIcon`, `maxTagCount`, … accepted-and-inert (D17–D21) |
| 12 | `BAIAllowedHostNamesSelect` | `BAISelect` | ✅ | `Select.Option` children → `options` |
| 13 | `BAISelectionLabel` | `HStack` + `Text` + `IconButton` | ✅ | the bare `<svg role="button">` becomes a real button (D22) |
| 14 | `BAIQuestionIconWithTooltip` | `Tooltip` + `Text color="placeholder"` | ✅ (`title`, `placement`) | the rest of antd `TooltipProps` (D23) |
| 15 | `BAIResourceNumberWithIcon` | `Tooltip` | ✅ | `ResourceTypeIcon.tooltipProps` re-typed to its 2 used keys (D24) |
| 16 | `BAIProgressWithLabel` | `Text` | ✅ | `ProgressProps` → the one used key (`showInfo`) |
| 17 | `BAINumberWithUnit` | `Text` | ✅ | — |
| 18 | `BAINotificationItem` | `Text` + `<div>` | ✅ | `List.Item` → plain div (D25) |
| 19 | `BAITagList` | `Badge` + `Popover` + `Tooltip` + `Link` | ✅ | click-triggered overflow always uses a `Link` trigger (D26) |
| 20 | `BooleanTag` | `Badge` | ✅ | — (hue via the repo-global lookup) |
| 21 | `ResourceStatistics` | `EmptyState` | ✅ | `Empty.PRESENTED_IMAGE_SIMPLE` (D27) |
| 22 | `Table/BAINameActionCell` | `DropdownMenu` + `Popover` confirm | ✅ | `PopconfirmProps` → `BAIPopconfirmConfig` (D28); menu `danger` rows (D29) |
| 23 | `fragments/BAIActivateArtifactsModal` | `BAIModal` + `Text` | ✅ | — |
| 24 | `fragments/BAIDeactivateArtifactsModal` | `BAIModal` + `Text` | ✅ | — |
| 25 | `fragments/BAIDeleteArtifactRevisionsModal` | `BAIModal` + `BAIAlert` + `Tooltip` | ✅ | — |
| 26 | `fragments/BAIImportArtifactModal` | `BAIModal` + `BAIAlert` + `Tooltip` | ✅ | — |
| 27 | `fragments/BAIArtifactDescriptions` | `MetadataList` + `MetadataListItem` | ✅ | `bordered`, `column`, per-item `span` (D30) |
| 28 | `fragments/BAIArtifactRevisionTable` | `Badge` | ✅ | — |
| 29 | `fragments/BAIArtifactTable` | `BAIButton` + `Text` + `Link` | ✅ | antd v6 `color`+`variant` pair (D31); **row-render bug fixed** (D32) |
| 30 | `fragments/BAIAgentTable` | `Text` | ✅ | — |
| 31 | `fragments/BAIModelDeploymentNodes` | `Text` / `BAIText` / `Tooltip` / `Link` | ✅ | — |
| 32 | `fragments/BAIRouteNodes` | `Tooltip` | ✅ | — |
| 33 | `fragments/BAIRuntimeVariantPresetTable` | `Tooltip` | ✅ | — |
| 34 | `fragments/BAIProjectTable` | `Badge` | ✅ | — |
| 35 | `fragments/BAIDeploymentTagChips` | `Badge` | ✅ | — |
| 36 | `fragments/BAIDeploymentOwnerInfo` | `Tooltip` + `Text`/`BAIText` | ✅ | — |
| 37 | `fragments/BAIDomainSelect` | `BAISelect` | ✅ | — |
| 38 | `fragments/BAIHuggingFaceRegistrySettingModal` | `InputGroup` + `Link` + form adapter | ✅ | `Input.Password addonAfter` (D33) |
| 39 | `fragments/BAIProjectSettingModal` | form adapters + `BAICheckbox` | ✅ | — |
| 40 | `fragments/BAIPullingArtifactRevisionAlert` | `BAIAlert` + `BAIButton` | ✅ | — |
| 41 | `fragments/BAIImageNodeSimpleTagV2` | `Badge` + `Divider` + `Text` | ✅ | the copy control's `colorLink` tint (D34) |
| 42 | `fragments/BAISessionAgentIds` | `Popover` + `Link` + `Text` | ✅ | antd `Popover title` folded into `content` (D35) |
| 43–44 | `fragments/BAISessionClusterMode[V2]` | `Text` + `Badge` | ✅ | — |
| 45–46 | `fragments/BAISessionTypeTag[V2]` | `Badge` | ✅ | local colour maps → the repo-global lookup (D1) |
| 47–48 | `fragments/BAIVFolderDeleteButton[V2]` | `BAIButton` | ✅ | — |
| 49 | `fragments/BAIVFolderMountConfigInput` | `TextInput` + `Badge` + `Skeleton` + `Tooltip` | ✅ | — |
| 50 | `unsafe/UNSAFELazyUserEmailView` | `BAIText` | ✅ | `GetProps<Typography.Text>` → `BAITextProps` |
| 51 | `FileExplorer/hooks.ts` | — | ✅ | `RcFile` restated locally (D36) |
| 52 | `FileExplorer/BAIFileExplorer` | `Breadcrumbs` + `Skeleton` + `Text` | ✅ | breadcrumb menu rows become real menu items (D37) |
| 53 | `FileExplorer/DragAndDrop` | `FileInput mode="dropzone"` | ✅ | `directory` picking via the dialog (D38) |
| 54 | `FileExplorer/ExplorerActionControls` | `DropdownMenu` + hidden file inputs + `Tooltip` | ✅ | `Grid.useBreakpoint` → `useBAIBreakpoint` (D39); `popupRender` surface (D40) |
| 55 | `FileExplorer/FileItemControls` | `DropdownMenu` | ✅ | the disabled-edit tooltip → the row label (D41) |
| 56 | `FileExplorer/EditableFileName` | `IconButton` + `Text` + form adapter | ⚠️ `component` prop removed | `Typography.Text editable` rebuilt (D42–D44) |
| 57 | `FileExplorer/BAIDirectoryPickerModal` | `BAIText` + `BAIButton` | ✅ | — |
| 58 | `FileExplorer/CreateDirectoryModal` | `BAIModal` + form adapter | ✅ | the standing "swap to BAIModal" TODO is done |
| 59 | `FileExplorer/CreateFileModal` | form adapter | ✅ | — |
| 60 | `FileExplorer/DeleteSelectedItemsModal` | `BAIModalProps` | ✅ | — |
| — | `provider/BAIConfigProvider` | **EXCLUDED** | — | final-switch material, untouched |

### New shared modules (4)

| File | Why |
|---|---|
| `helper/astryxLabel.ts` | Astryx contract 1: `label` is a required **string**. Flattens a `ReactNode` into a name by walking string/number leaves. Casting `node as string` compiles and poisons `aria-label` with `[object Object]` (P2), so the flattening is done once, properly. |
| `helper/astryxPlacement.ts` | MAPPING §4: antd's compound `placement` **splits into two props** everywhere in Astryx (`placement` + `alignment`), and the axis vocabulary changes (`top→above`, `left→start`). One 12-value table instead of one per wrapper. |
| `components/astryxFormControls.tsx` | The BUI counterpart of the host's ticket-10 adapters. Reconciles all three universal contracts (`label` required + `isLabelHidden`, value-not-event `onChange`, non-nullable `value`) once instead of at every field. |
| `components/astryxNumberStepper.tsx` (+ `.css`) | `onStep` is NONE in Astryx (MAPPING §3.17). Owns the explicit ladder controls and the native-spinner suppression the two dynamic-step inputs need. |

---

## PILOT-DECISIONs

**D1 — local colour maps are deleted in favour of the repo-global lookup.**
`BAISessionTypeTag[V2]` each carried their own `{INTERACTIVE:'geekblue', …}`
map. Both now route through `STATUS_BADGE_VARIANT.sessionType`
(`helper/astryxTagVariant`, ticket 13), which applies `geekblue → blue` by its
own policy class 2. **No conversion in this ticket passes a hex or a resolved
token to a Badge/Token** — that is the silent-drop-to-neutral failure mode
D10 of wave 1 documented.

**D2 — `BAIBackButton` gains a real accessible name.** The antd original was an
icon-only `<button>` with no `aria-label`, no `title` and no text: a screen
reader announced nothing. Astryx requires `label`, so it now carries the
translated "Back" and the same string as its tooltip.

**D3 — `type="dashed"` (5 sites) becomes `variant="secondary"`.** MAPPING §3.3
prescribes exactly this and asks for the decision to be recorded. The dashed
border was antd's "add another one of these" affordance; Astryx's closed
variant enum cannot express a border style (P5), and all five sites sit next to
a `+` icon carrying the same meaning.

**D4 — icon-only buttons fall back to a generic accessible name, and the real
copy is QUEUED.** 46 of `BAIButton`'s 168 call sites are icon-only and only 7
carry an `aria-label`/`title`, so ~39 icon-only buttons have **no accessible
name at all** under antd. Astryx makes `label` required and SKILL.md is explicit
that "a wrapper can only supply a placeholder", so the resolution order is
`children` text → `aria-label` → `title` → `general.button.Action`. The
placeholder is deliberately visible to an accessibility audit rather than
silently empty. The same policy is used by `BAICheckbox`,
`BAIUncontrolledInput` and `BAISelect` (`general.Select`). **Naming those ~39
controls is per-surface copywriting (P8) and belongs in REMAINDER.md, not
here.**

**D5 — `BAICard styles={{header, body}}` is accepted and ignored.** 34 call
sites pass it; **30 are exactly `styles={{ body: { paddingTop: 0 } }}`**, the
`use-bai-card.md` convention that removes antd's body top padding. Astryx
`Card` has ONE `padding` step for the whole surface — header and body share the
padded box — so the flush-body look is *structural* here and the override has
nothing to remove. This is the call the pilot's `BAICardAstryx` already ratified
("`styles.body.paddingTop: 0` is a no-op"). The 4 remaining sites lose a
per-card padding nudge rather than double-padding the body.

**D6 — the `BAICard` header divider inverts polarity, and `title` becomes an
`<h3>`.** antd's `BAICard` *hid* `.ant-card-head`'s bottom border unless
`showDivider`/`tabList`; Astryx `Card` draws no header rule at all, so nothing
is drawn by default and `showDivider` opts IN via an explicit `Divider`.
`tabList` keeps its implicit rule through `TabList hasDivider`. Separately,
`title` now renders through `Heading level={3}` (the pilot's ratified choice),
so **card titles join the document heading outline** — worth knowing when
auditing page heading structure. JSX titles still render verbatim.

**D7 — `BAICheckbox`'s reason for existing becomes a native prop, and its CSS is
deleted.** The wrapper existed because antd's `Checkbox` reads only
`isFormItemInput` from `FormItemInputContext` and leaves a field error
unpainted; it re-read the status and painted `.ant-checkbox` itself. Astryx
`CheckboxInput` has a first-class `status={{type:'error'}}`, so the context read
stays (that IS the substance) and `BAICheckbox.css` is **deleted** rather than
left compiling against selectors Astryx never emits (P6).

**D8 — the antd form binding was CHECKED, not assumed.** Both live
`BAICheckbox` sites sit inside `Form.Item valuePropName="checked"` on the PARKED
engine. That injects `checked={value}` (accepted here, mapped onto Astryx's
`value`) and reads the new value back through rc-field-form's
`defaultGetValueFromEvent`, which returns the first argument verbatim when it is
not event-like — and Astryx's `onChange(checked, e)` passes a boolean first. The
same reasoning underwrites every `astryxFormControls` adapter.

**D9 — "uncontrolled" becomes local state, and the ⏎ hint is dropped.**
`TextInput.value` is required and non-nullable with no `defaultValue`
(contract 3 / P4), so `BAIUncontrolledInput` holds the draft in `useState` and
reseeds it with a render-phase state adjustment (the pattern
`BAIFetchKeyButton` already uses) in place of the `key={defaultValue}` remount.
The observable contract is identical — `onCommit` still fires only on Enter or
blur. The focus-only ⏎ suffix goes: Astryx `TextInput` has no suffix slot, and
`InputGroup` (MAPPING §3.6's route) welds a *permanent* adjacent box.
`BAIUncontrolledInput.css` is deleted with it.

**D10 — `BAIBulkEditFormItem`'s placeholder rows lose their chevron and filled
variant.** Those rows are not inputs: they are read-only affordances that swap
the row into edit mode on click/focus, so antd's `variant="filled"` + `suffix`
chevron was a costume for a control the user cannot type into. Astryx has
neither (P5). The affordance is unchanged; `onChange` is a no-op because the
value *is* the label.

**D11 — `onStep` has no Astryx counterpart, so the ladder gets explicit
controls.** This is the single largest behavioural rebuild in the ticket.
MAPPING §3.17 lists `onStep` as NONE. The substance of
`BAIDynamicStepInputNumber` / `BAIDynamicUnitInputNumber` is a **non-linear**
step ladder (`1, 2, 4, 8, …` plus a unit carry), which antd drove through
`onStep` with `step={0}` to disable its own arithmetic. Astryx's `NumberInput`
is a native `<input type="number">` whose browser spinner steps **linearly** and
reports nothing — leaving it in place would have silently replaced the ladder
(a P10-class regression `tsc` cannot see). The native spinner is therefore
suppressed in CSS and two `IconButton`s drive the ported ladder arithmetic.

**D12 — `stringMode` is dropped, and nothing is lost.** It existed so antd's
`InputNumber` could hold big values without float error; the component already
parses/serialises the string itself, and the numeric half is a size in a chosen
unit, never near `Number.MAX_SAFE_INTEGER`.

**D13 — the raw `input`-event listener is deleted.** It watched for a user
typing `"512m"` INTO the number field. A native `<input type="number">` rejects
the trailing letter at the DOM level, so the listener could never fire; the unit
is chosen in the adjacent `Selector`.

**D14 — `extraMarks` keeps its antd shape and is translated inside.** antd
`SliderMarks` is a `{[position]: node | {label, style}}` MAP; Astryx wants a
`{value, label}[]` ARRAY with **string** labels. The one live consumer
(`ResourceAllocationFormItems`) passes a JSX `<RemainingMark />`, so the prop
type stays antd-shaped (restated locally) and each label is flattened —
degrading to its text, or to an unlabelled tick. Casting `as string` would have
printed `[object Object]` on the rail (P2).

**D15 — the slider's per-mark colour and warning-track tint are dropped, and
`warn` is now inert.** Astryx `Slider` exposes no slot styling at all (P5). The
mark colour was already the secondary text colour Astryx paints marks in; the
warning tint is a real loss, but `warn` **has no live consumer** in the repo and
the code that drew the matching warning arrow was already commented out.

**D16 — `BAIFetchKeyButton`'s hand-rolled check mark is deleted for native
radio semantics.** antd's `Dropdown menu={{items}}` has no single-choice
concept, so the active interval was faked with a `<Check>` icon plus a
`visibility: hidden` copy on every other row to keep them aligned.
`DropdownMenuRadioGroup` + `DropdownMenuRadioItem` emits `role="menuitemradio"`
with `aria-checked` and draws the selected state itself — strictly better than
the original, which announced nothing. MAPPING §5.3 makes exactly this call.

**D17 — `BAISelect` keeps BOTH antd option APIs.** `options` *and*
`<Select.Option>`/`<Select.OptGroup>` children are supported: the element tree
is flattened into Astryx's option model, groups become `{type:'section'}`
entries, and each option's JSX body is preserved for `renderOption`. Two call
sites (`ImageEnvironmentSelectFormItems`) use the children form; dropping it
would have pulled a file this ticket does not own into the change set.

**D17b — BUG FOUND LIVE: antd's `options` array is NOT flat.** An entry that
carries its own `options` array is a **group** (`{label, options}`) — the
array-form twin of `<Select.OptGroup>`, which `ProjectSelect` (the header
project picker, present on every page) uses whenever the user belongs to more
than one domain. The first conversion treated every entry as a leaf, so each
group got `value === undefined`, every group collapsed onto the SAME empty React
key, and the options inside them were dropped. Caught in the live sweep as
`Encountered two children with the same key ""` — 77 occurrences across
`/summary`, `/data` and `/admin/project`. Group entries now become Astryx
`{type: 'section'}` and the leaf lookup flattens through them. **`tsc`,
ESLint, both vitest suites and the 463-story Storybook smoke were all green
while this was broken** — only the live console caught it.

**D18 — ReactNode option labels survive via `renderOption`.**
`SelectorOptionData.label` is a plain string, but real call sites pass JSX
(`StorageSelect`'s usage badge, `BAIVFolderPathPicker`'s path rows). Each option
is SPLIT: flattened text becomes `label` (the accessible name *and* the search
key), the node is looked up by value in `renderOption`.

**D19 — `BAISelect`'s popup slots are rebuilt on the option model.** Astryx has
no arbitrary popup-body hook, so a string `header`/`footer` becomes a
`{type:'section'}` / a divider + disabled row — both native and
keyboard-correct. `popupRender` itself is accepted and inert.

**D20 — `searchAction`, `endReached`, `atBottomStateChange` and `bottomLoading`
are accepted and inert.** Astryx's `Selector` filters client-side and emits no
`onSearch`/scroll events; MAPPING §3.1 is explicit that a scroll- or
server-driven source is a `ComplexSelector`/`Typeahead` rebuild, not a
`Selector` prop. Measured live usage: `searchAction` ×1 (over a static
in-memory list, where client-side filtering is equivalent), `endReached` ×1,
`atBottomStateChange` ×0 — every paginated consumer already moved to
`BAIComplexSelect` in wave 1 (p3-c retired all 19 legacy wrappers). The props
stay in the signature so the **12 components that `extend BAISelectProps`**
keep compiling.

**D21 — `mode="tags"` routes to `MultiSelector`, losing free entry.** MAPPING
§3.1 sends tags mode to `Tokenizer`. `BAISelect` has ONE live `tags` site —
`BAIProjectSettingModal`'s "Allowed Resource Groups", whose options are the
server's resource-group list, so a hand-typed name was never valid there.
Genuine free-entry sites already moved to `AstryxFormTagsInput` (P3C-7).

**D22 — the clear-selection ✕ becomes a real button** (inherited from ticket
08 and restated because it lands in BUI here). It was a bare
`<svg role="button" tabIndex={0}>` with no hover surface and no focus ring,
named by a wrapping antd `Tooltip`. As an `IconButton variant="ghost" size="sm"`
it owns its label, tooltip and focus ring; the hit box grows from the 16px glyph
to the `sm` control box — accepted, the a11y affordance is the point.

**D23 — the question glyph's tint moves to `Text color="placeholder"`.** antd
painted it `token.colorTextTertiary`; Astryx has no arbitrary colour slot (P5)
and `placeholder` is the nearest member of its closed `TextColor` enum, so the
icon now follows the theme in both modes instead of a resolved hex. The rest of
antd's `TooltipProps` (`color`, `overlayStyle`, `getPopupContainer`, `trigger`,
…) describes antd's overlay DOM, which Astryx replaces with CSS anchor
positioning; no call site passes any of them (measured: `title` ×63,
`placement` ×3, `style` ×2, `iconProps` ×2).

**D24 — `ResourceTypeIcon.tooltipProps` is re-typed to its two used keys.**
Keeping antd's full `TooltipProps` was the only thing holding the module in the
antd import graph, and the wide type advertised knobs Astryx cannot honour.

**D25 — `List.Item` becomes a plain `<div>`, not Astryx's `ListItem`.** Astryx's
item is a structured ROW (`label`/`description`/`startContent`/`endContent`) — a
different anatomy from the stacked title/description/action/footer block
`BAINotificationItem` composes. antd's `List.Item` rendered a bare
`<div class="ant-list-item">` here anyway: notification items are rendered by
the notification STACK, never inside a `<List>`.

**D26 — a click-triggered `BAITagList` overflow always uses a `Link` trigger.**
Astryx `Popover` requires its trigger subtree to contain a `<button>` /
`[role="button"]` — it wires the click/keydown handlers and the ARIA triple onto
that element, and a `Badge` is not one. The `text` variant's default is `hover`
(a `Badge` in a `Tooltip`, unchanged), so no default rendering changes; the
click affordance becomes keyboard-reachable, which the antd chip was not.

**D27 — `Empty.PRESENTED_IMAGE_SIMPLE` is dropped.** Astryx has no preset
illustration set (`EmptyState.icon` takes a node you choose), and the *simple*
preset was antd's "no illustration, just the frame" option — which is exactly
what `EmptyState` renders with no `icon`. `description` becomes the required
`title`.

**D28 — `PopconfirmProps` becomes a locally-declared `BAIPopconfirmConfig`.**
MAPPING §2 grades `Popconfirm` as **NONE** ("compose `Popover` + buttons, or
escalate to `AlertDialog`"); this is the compose branch, matching the shape the
pilot's `BAINameActionCellAstryx` already shipped. The config is the exact
subset the **11 live `popConfirm` objects** pass (`title`, `description`,
`okText`, `cancelText`, `okButtonProps.danger`, `onConfirm`, `onCancel`, plus an
inert `placement`), measured across `ResourceGroupList`,
`AdminUserCredentialList` ×2, `AdminUserManagement`, `QuotaScopeTable`,
`DeploymentRevisionHistoryTab`, `LoginSession`, `RBACManagementPage` ×2 and
`ProjectPage` ×2. The two-click contract
`.claude/rules/destructive-confirmation.md` cares about is preserved.

**D29 — overflow-menu rows lose their `danger` tint.**
`DropdownMenuItemData` has no danger flag — Astryx's menu rows are uniform (P5).
A destructive overflow row relies on its icon and label, exactly as it already
does inside the `modal.confirm` it escalates to; the *visible* (non-overflowed)
button keeps its tint through `bai-nac-action-button-danger`.

**D30 — `Descriptions` loses `bordered`, `column` and per-item `span`.**
MAPPING §4 records all three as having no Astryx destination (repo-wide: 27, 56
and 20 sites). `MetadataList` is a borderless definition list by design — the
defaults-first answer to a closed appearance API — and `column={2}` becomes
`columns="multi"`. The two full-width rows now occupy one cell each.

**D31 — antd v6's `color` + `variant` emphasis pair collapses.** Astryx
`Button.variant` is a closed 4-value enum with no colour slot (P5). In
`BAIArtifactTable`, Deactivate is the destructive half and keeps that reading via
`danger`; Activate loses its blue fill and becomes the default secondary button.
On `BAIButton` itself, `color` is accepted with only `danger` carrying meaning —
everything else is ignored rather than mapped to a hue Astryx does not have.

**D16b — ORIGINAL FIDELITY: the auto-refresh trigger stays unlabelled while
auto-refresh is off.** antd showed the selected interval ("30s") next to the
chevron only while auto-refresh was ON, and a bare chevron otherwise. Astryx
`Button` renders `label` as visible text unless `children` overrides it or
`isIconOnly` is set — so the first conversion put a permanent "Auto Refresh"
caption on every page's toolbar. Caught in the live screenshots; the OFF state
is now `isIconOnly` with the chevron as its icon, keeping the accessible name
without the caption. The corollary from SKILL.md applies: per-page original
fidelity beats a generic convention, and the user notices immediately.

**D32 — BUG FOUND WHILE CONVERTING (not a policy choice), recorded so it is not
re-introduced.** `BAIArtifactTable`'s Controls column declared
`render: (record) => …`, but `render`'s FIRST argument is the cell VALUE and the
column has no `dataIndex` — so `record` was always `undefined` and every row
threw `Cannot read properties of undefined (reading 'availability')`. All five
`BAIArtifactTable` Storybook stories were failing on this **before** this
ticket; the signature is now `(value, record)` and the smoke went 458/463 →
463/463. Only a rendering gate catches this class; `tsc` accepted it.

**D33 — `Input.Password addonAfter` becomes an `InputGroup` with the action as a
sibling.** Astryx `TextInput` has no addon slot (MAPPING §3.6 routes
`addonAfter` to `InputGroup`), and the affordance was an `<a>` with an `onClick`
and no `href` — a button wearing a link, with no keyboard access. It is now an
Astryx `Link`, which renders a real button without an `href` (the D3 call wave 1
made for `BAILink`).

**D34 — the image-name copy control loses its `colorLink` tint.** `BAIText`'s
rebuilt copy control is a ghost `IconButton` that takes its colour from the
theme; Astryx `Text` has no arbitrary colour slot (P5). Defaults-first: the
control now looks like every other icon action in the app.

**D35 — antd `Popover title` is folded into `content`.** Astryx `Popover` has
`content` plus a `label` that is the popover's ACCESSIBLE name (a plain string),
not a rendered header. antd's `title` was a rendered row that also carried the
"Copy All" action, so it moves to the top of `content` and `label` gets the
plain-text agent count. `trigger="click"` is dropped: click is Astryx
`Popover`'s only trigger (hover is `HoverCard`).

**D36 — `RcFile` is restated locally, once.** It was the ONE antd specifier the
FileExplorer's upload path carried, across four modules — a type that renders
nothing and is therefore invisible to a screenshot (MAPPING §6 rule 1). The
upstream definition is two lines, and the file objects come from the browser's
`DataTransfer` / `<input type="file">`, never from antd's `Upload`. Consumers
keep importing the name (now from `./hooks`); the declaration is
byte-compatible, including antd's `readonly lastModifiedDate: Date`.

**D37 — breadcrumb sibling-folder rows become real menu items.**
`BreadcrumbItem` has a NATIVE `menu` prop taking `DropdownMenuOption[]`. antd's
rows carried a JSX label whose own `onClick` did the navigating — a click
handler on a `<div>` inside a menu row, reachable by mouse only. The Astryx rows
put `onClick` on the ITEM, so keyboard selection works.

**D38 — `Upload.Dragger` → `FileInput mode="dropzone"`, and `directory` is
dropped.** MAPPING §3.12 is precise: this repo already uses `Upload` as a
PICKER (`beforeUpload` returning `false` + `showUploadList={false}`), never a
transport, so the tus uploader is untouched. `directory` (×1) has no `FileInput`
equivalent — multi-FILE drag-and-drop is unchanged, and dropping a FOLDER still
works because that path goes through `DataTransfer`, not the input's
`webkitdirectory` attribute.

**D39 — `Grid.useBreakpoint()` → the theme-shim's `useBAIBreakpoint()`.**
MAPPING §3.9 grades antd's hook NONE and warns that Astryx's `useMediaQuery`
returns `false` on FIRST RENDER for SSR safety — which would make every
responsive label here flash in and out. The shim exists for exactly this
(RESPONSIVE-POLICY §2) and it is a pure import swap.

**D40 — the upload menu uses hidden native file inputs, NOT `FileInput`.**
Unlike the dropzone, this is a *menu*: `FileInput` renders its own control,
which cannot live in a menu row, and `webkitdirectory` — the whole point of
"Upload Folder" — has no `FileInput` prop. Driving two hidden inputs directly
keeps folder upload working AND makes the rows real `menuitem`s, so the menu is
keyboard-operable, which antd's button-inside-a-popup was not. `popupRender`'s
hand-built surface (elevated background, radius, shadow from antd tokens) goes
with it — `DropdownMenu` owns its own surface.

**D41 — the disabled-edit tooltip becomes part of the row label.**
`DropdownMenuItemData` has no tooltip slot, and Astryx advises against tooltips
on disabled controls (P18). Rather than drop the information, the reason is
folded into the label — "Edit file (file too large)" — which every user sees,
not just the ones who hover.

**D42 — `Typography.Text editable` is rebuilt as an explicit pencil button.**
This is the one production inline-edit surface in the repo, and the reason
wave 1's `BAIText` could drop `editable` outright (D1 there explicitly deferred
this file). Astryx has no inline-edit affordance; antd's was an
`<a class="ant-typography-edit">` injected into the text flow and revealed on
hover. The rebuild keeps that behaviour exactly — same hover reveal, same
`triggerType: ['icon']` semantics (the text was never click-to-edit) — with an
`IconButton` that has a real accessible name and a focus ring.
`EditableFileName.css` is re-pointed from `.ant-typography-edit` to the button's
class (P6); its `.ant-form-item` rules STAY, because the form engine is PARKED
and still renders antd's item DOM.

**D43 — ⚠️ CONTRACT NARROWING: `EditableFileName`'s `component` prop is
removed.** It let a caller swap `Typography.Text` for `Typography.Title`, typed
through antd's `GetProps` — which has no Astryx analog (MAPPING §6 rule 2) and
was the last antd specifier in the file. The component has **exactly one
consumer** (`BAIFileExplorer`'s name cell) and it never passed `component`, so
the polymorphism had no user. This is the ONLY narrowed public contract in the
ticket.

**D44 — the rename field's ⏎ hint is dropped**, same call as D9. Enter still
submits (the form's `onFinish`) and Escape still cancels.

---

## Frontier contracts — what did NOT change

Per the frontier rule, and verified by `tsc` across the whole app, these
antd-shaped surfaces are preserved with **zero consumer edits**:

| Wrapper | Consumers held at zero diff |
|---|---|
| `BAIButton` | 168 call sites / 72 files + 6 `extends BAIButtonProps` |
| `BAICard` | 142 call sites / 57 files + 2 `extends BAICardProps` |
| `BAISelect` | 64 call sites / 56 files + **12 `extends BAISelectProps`** |
| `BAIQuestionIconWithTooltip` | 63 call sites / 30 files |
| `BAIProgressWithLabel` | 44 call sites / 7 files |
| `BAINameActionCell` | 11 `popConfirm` action objects across 9 files |
| `BAIDynamicUnitInputNumber` | 9 call sites / 11 files (incl. the WithSlider pair) |

**P1 discipline:** every one of those interfaces was written from a MEASURED
prop census (`.scratch/w2d-props.mjs`, a brace-aware multi-line JSX attribute
scanner), not from memory. The first `tsc` pass over `react/` after the
narrowing surfaced 16 errors in 11 files — `filterOption`, `optionFilterProp`,
`searchValue`, `option.data`, `ref`, `color`, `placement`, `mode="tags"`,
`children`, `size="small"` — every one a prop the census had missed because it
sits inside an object literal or a spread. All 16 were fixed by WIDENING the
BUI type, never by editing a consumer.

---

## i18n

12 keys added to all 21 BUI locale files (English strings everywhere;
translation is a follow-up). Every one exists because Astryx makes an
accessible name REQUIRED where antd allowed none:

`general.Select`, `general.Unit`, `general.Increase`, `general.Decrease`,
`general.button.Action`, `general.button.Back`, `general.button.Confirm`,
`comp:BAINameActionCell.MoreActions`,
`comp:BAIDynamicUnitInputNumberWithSlider.Amount`, `comp:FileExplorer.Path`,
`comp:FileExplorer.RenameFile`.

---

## CSS: added, re-pointed, deleted

| File | Action | Justification |
|---|---|---|
| `BAICard.css` | **new** | `status` border tint + `hoverable` hover shadow + the extra-button glyph tint. Astryx `Card` has no border-colour knob and no hover state (P5). Tokens only, no fallback argument (P19). |
| `astryxNumberStepper.css` | **new** | Suppresses the native `input[type=number]` spinner, which would otherwise offer a SECOND stepper with different (linear) arithmetic next to the ladder. Targets native pseudo-elements, never a design-system class. |
| `BAISelect.css` | **rewritten** | Every `.ant-select*` rule deleted (P6): the ghost `suffix`/`status-error` rules and both `.ant-select-content*` dimming blocks — including the `.astryx-*` spellings sibling A/C added for the merge window. What survives is `ghost`, re-expressed structurally (`button`, `[role=combobox]`, `[aria-invalid]`). The `--color-on-dark` reasoning is carried over verbatim. |
| `EditableFileName.css` | **re-pointed** | `.ant-typography-edit` → `.bai-editable-file-name-edit-button` (+ `:focus-within`). The `.ant-form-item` rules STAY — the form engine is PARKED. |
| `BAICheckbox.css` | **deleted** | Every rule targeted `.ant-checkbox*`; the error paint is now `CheckboxInput status`. |
| `BAIUncontrolledInput.css` | **deleted** | Its only rules hid the number spinner; the number branch is a `NumberInput`. |

---

## Verification

- **`bash scripts/verify.sh` → `=== ALL PASS ===`** (Relay, Lint, Format,
  TypeScript, warmup paths, StyleX target, theme build, terminology).
- **BUI vitest**: 446 passed / 1 skipped (23 files). Two suites needed updating,
  both for real contract changes: `BAICard.test.tsx` (antd structural classes →
  the stable `bai-card` hook; tab queries by ROLE because Astryx's `TabList`
  keeps a hidden overflow copy of each label) and `BAIBulkEditFormItem.test.tsx`
  (`Typography.Link` was an `<a>`, Astryx `Link` without `href` is a button).
  `BAIButton.test.tsx` / `BAIBackButton.test.tsx` moved their loading and
  variant assertions from antd class names to `aria-busy` and
  `toHaveAccessibleName()` — signals antd never exposed.
- **react vitest**: 1164 passed (62 files), untouched.
- **Storybook smoke** (`measure-w2d-storybook-smoke.mjs`, full index):
  **463/463 stories render error-free**, up from 458/463 (the 5 recovered are
  `BAIArtifactTable`, D32). 28 light+dark screenshots in
  `.scratch/astryx-migration/shots/p3-w2d/`.
- **Live** (`w2d-live.mjs`): vite on `127.0.0.1:5880` against
  `10.82.0.130:8090`, Playwright, admin login, **8 surfaces × light + dark**
  (`/agent`, `/reservoir`, `/session`, `/data`, `/serving`, `/admin/project`,
  `/admin/users`, `/summary`). Screenshots + `live-results.json` in
  `shots/p3-w2d/`. **Zero `pageerror`s.** The dark pass clicks the app's REAL
  theme toggle and then ASSERTS `document.documentElement[data-theme] === 'dark'`
  — the first attempt wrote a guessed localStorage key, silently no-opped, and
  produced eight "dark" screenshots that were actually light. Verified
  rendering: the header `ProjectSelect` (ghost `BAISelect`) stays white-on-orange
  in both modes, `BAICard` tabs + badge counts, `BAIFetchKeyButton` (icon-only
  when off, "15s" + countdown border when on), `BAINameActionCell` row actions,
  vfolder/agent status badges, `BAIProgressWithLabel` utilisation bars,
  `BAIAgentTable`, `BAIArtifactTable`, pagination.
- Remaining console output is the documented pre-existing set, identical to what
  p3-c and p3-d recorded: the Google-Fonts CSP block, the backend's
  `Group`/`UserGroup` globally-unique-id violation (Relay normalizer), a 404
  static asset, and `titleStyle` on a DOM element from `ConfigurableResourceCard`.

### Three defects only a rendering gate could catch

`verify.sh`, ESLint and both unit suites were green through all three:

1. **`BAISelect` dropped antd option GROUPS** (D17b) — live console, 77 warnings.
2. **The auto-refresh trigger grew a permanent caption** (D16b) — live screenshot.
3. **Astryx `Slider` collapsed to a ~7px rail** because it sizes to its CONTENT
   where antd's filled its flex track, stacking the resource marks on top of each
   other. `width="100%"` restores it — Storybook screenshot. Exactly the
   P10/P12 shape SKILL.md warns about.

Finding #1 is the sharpest illustration of the skill's core warning: a
misclassified call site "compiles, type-checks, lints, and is wrong".

### Gate deltas

| Gate | Before (`to-astryx`) | After |
|---|---|---|
| `antd-import-graph` — files | 968 | 972 (+4 new shared modules) |
| `antd-import-graph` — **direct antd** | 300 → 256 (post wave-1) | **196** (−60) |
| `antd-import-graph` — antd-free | 266 (27.5%) | **274 (28.2%)** |
| `ant-selector-gate` — total `.ant-*` refs | 905 | **802** (−103) |
| `astryx-token-gate` (P19) | exit 0, 3 undeclared | exit 0, **3 undeclared** (all pre-existing) |
| BUI bundle (`dist/backend.ai-ui.js`) | 1712 kB | 1735 kB |

`transitively antd-reachable` rises (446 → 502) because files that were
themselves *direct* antd importers are now merely *reachable* through the four
remaining shim hubs — the same accounting shift p3-c saw. **Slice check: 60 of
61 files are out of the DIRECT bucket; the 61st is `BAIConfigProvider`, the
documented exclusion.**

The BUI bundle grows ~23 kB because Astryx primitives are now pulled in
alongside the antd ones that other, unconverted BUI modules still import. It
falls at the final switch, not here.

### Remaining antd in this slice's tree (all out of scope, all documented)

- `provider/BAIConfigProvider/BAIConfigProvider.tsx` — the antd
  `ConfigProvider` mount itself (final-switch material, **excluded by the
  ticket**).
- Transitive reachability through the four parked hubs: `locale/index.ts`
  (`import type { Locale } from 'antd/es/locale'`, ticket 30),
  `theme-shim/index.tsx` (`type { GlobalToken }`), `app-shim/*`, and
  `form-engine/index.ts` (the PARKED antd form engine).

---

## Queued for REMAINDER.md

1. **~39 icon-only `BAIButton` call sites need real accessible names** (D4).
   They currently render the translated `general.button.Action` placeholder.
   Per-surface copywriting; grep for `<BAIButton` with `icon` and no children,
   `aria-label` or `title`.
2. **`BAICheckbox` / `BAIUncontrolledInput` / `BAISelect` label fallbacks** —
   same class, smaller: 2 permission-matrix cells, 16 settings fields, and the
   select call sites that pass no `placeholder`.
3. **`BAISelect`'s inert props** (`searchAction`, `endReached`,
   `atBottomStateChange`, `bottomLoading`, `popupRender`, `notFoundContent`,
   `suffixIcon`, `maxTagCount`, `maxTagPlaceholder`, `optionLabelProp`,
   `labelRender`, `defaultActiveFirstOption`, `ref`) can be deleted from the
   signature once the 12 `extends BAISelectProps` components are converted —
   they exist purely to hold those files at zero diff.
4. **`BAICard styles` and `BAIDynamicUnitInputNumberWithSlider warn`** are
   likewise accepted-and-ignored props with no remaining mechanism; drop them
   when their call sites are visited.
5. **`Slider` width** — worth a sweep: any other Astryx control that used to
   fill a flex track may need an explicit `width`, and no gate detects it.
