# Phase 3 · wave 2 · partition C — app components → Astryx

46 files under `react/src/components/` (alphabetical band `RoleAssignmentTab` →
`WEBUINotificationDrawer`). **42 converted, 4 documented exclusions.**

Gate delta (`scripts/migration-gates/antd-import-graph.mjs`):
**direct-antd 256 → 214 files (−42)**; transitively-reachable 446 → 486 and
antd-free 266 → 268 (both move with sibling waves landing in the same tree, not
with this partition alone).

---

## 1. Converted (42)

| File | antd → Astryx |
|---|---|
| `RoleAssignmentTab` | Alert→Banner, Tooltip→Tooltip(`content`) |
| `RoleDetailDrawer` | Drawer→lab Drawer, Skeleton→BAISkeletonAstryx, Typography.Title `copyable`→BAICopyableText, Button+Tooltip→IconButton, `DrawerProps`→explicit interface |
| `RoleDetailDrawerContent` | Descriptions→MetadataList, Tabs→TabList+Tab, Tag→Badge (ticket-13 lookup), Skeleton→BAISkeletonAstryx |
| `RoleFormModal` | Button→IconButton, Checkbox/Input/Input.TextArea→`AstryxForm*` adapters |
| `RoleNodes` | Tooltip+Typography.Text `ellipsis`→`Text maxLines/hasTruncateTooltip`, Tag/BAITag→Badge, Button→IconButton |
| `RolePermissionDetailTab` | Empty→EmptyState, Skeleton→BAISkeletonAstryx |
| `RoleScopePermissionEditModal` | Empty→EmptyState, Tooltip, Typography.Text→Text |
| `RuntimeParameterFormSection` | Collapse→Collapsible, Tabs→TabList+Tab, Alert→Banner, Tooltip+Button→IconButton, Checkbox/InputNumber/Select/Input→`AstryxForm*` |
| `SFTPServerButton`, `SFTPServerButtonV2` | Space.Compact→ButtonGroup, Dropdown→DropdownMenu, Image→`<img>`, Tooltip |
| `ScanArtifactModelsFromHuggingFaceModal` | Input→AstryxFormTextInput |
| `ScopedRolePermissionCard` | Tag→Badge (ticket-13 `grantState`), Button+Tooltip→IconButton |
| `SessionDetailDrawer` | Drawer→lab Drawer, `DrawerProps`→explicit interface |
| `SessionFormItems/ClusterModeFormItems` | Radio.Group/Radio.Button→SegmentedControl, Tooltip |
| `SessionFormItems/ResourceAllocationFormItems` | Card→Astryx Card, Button→IconButton, Row/Col→VStack, Radio→SegmentedControl, Tooltip |
| `SessionFormItems/SharedMemoryFormItems` | ConfigProvider+Slider→a two-box bar, Switch→Astryx Switch, Divider, `SwitchProps` type dropped |
| `SessionLauncherErrorTourProps` | antd Tour→lab Tour+TourStep |
| `SessionListColums/SessionInfoCell` | Input→TextInput (local adapter), Typography.Text→Text, Button→IconButton |
| `SessionNameFormItem` | Input→AstryxFormTextInput |
| `SessionOwnerSetterCard` | Card→Astryx Card+HStack/VStack, Input.Search→InputGroup(TextInput+IconButton), Row/Col→Grid/GridSpan, Select→Selector, Switch, Descriptions→MetadataList, `CardProps`→explicit interface |
| `SimpleProgressWithLabel` | Tooltip, Typography.Text→Text |
| `StorageHostFetchErrorBoundary` | Result→EmptyState, Button→Astryx Button |
| `StoragePermissionEditModal` | Checkbox→CheckboxInput, Checkbox.Group→CheckboxList, Divider, Tooltip, Typography.Text→Text, `CheckboxChangeEvent` type dropped |
| `StorageSelect` | Tooltip |
| `SummaryPageItems/SummaryItemInvitation` | Descriptions→MetadataList+Heading, Tag→Badge (ticket-13 `vfolderPermission`), Button→Astryx Button, Empty→EmptyState |
| `TOTPActivateModal` | Spin→Spinner, Typography copyable+code→BAICopyableText, Input.OTP→TextInput, static `message`→app-shim (**QRCode kept — exclusion #1**) |
| `TerminateSessionModalForProjectAdmin` | Checkbox→CheckboxInput, Typography.Text `mark`→BAIText, Paragraph `danger`→`Text color="danger"`, copyable→BAICopyableText, `ModalProps`→`BAIModalProps` |
| `UsageProgress` | Progress→ProgressBar, Typography.Text→Text |
| `UserProfileSettingModal` | Input/Input.Password→AstryxFormTextInput, Switch→local adapter, Typography.Text→Text, `ModalProps`→`BAIModalProps` |
| `UserResourcePolicySelect` | Select→AstryxFormSelector, `SelectProps`→explicit interface |
| `UserSelect` | Select→Selector, `SelectProps`→explicit interface |
| `UserSessionsMetrics` | Alert→Banner, DatePicker.RangePicker→DateRangeInput, Empty→EmptyState, Skeleton→BAISkeletonAstryx |
| `VFolderDeployModal` | Alert→Banner, Space.Compact+Tooltip+Button→IconButton |
| `VFolderLazyView`, `VFolderLazyViewV2` | Typography.Link→Link, Typography.Text→Text |
| `VFolderMountFormItem` | Button+Tooltip→IconButton, Input→TextInput, Skeleton.Input→BAISkeletonAstryx, Descriptions→MetadataList, Tag→Badge |
| `VFolderNameTitle` | Tooltip, Typography.Title→Heading |
| `VFolderNodeDescription` | Descriptions→MetadataList, Tag→Badge, BAISelect→Selector, copyable→BAICopyableText/IconButton, `DescriptionsProps`→explicit interface |
| `VFolderSelect` | Select→Selector, Space.Compact→ButtonGroup, Button+Tooltip→IconButton, `SelectProps`→explicit interface |
| `VFolderTable` | Descriptions→MetadataList, Input→TextInput, Space.Compact→ButtonGroup, Tag→Badge, Tooltip, Typography.Text→Text |
| `VFolderTableFormItem` | hidden `Input`→`<div/>` (matches its three hidden siblings) |
| `VFolderTextFileEditorModal` | `antd/es/upload` `RcFile` type → local `UploadableFile` |
| `ValidationStatusTag` | Spin→Spinner, Tag→Badge (ticket-13 `validation`) |
| `WEBUINotificationDrawer` | Drawer→lab Drawer (`mask=false`→`hasScrim=false`), List→VStack map, Segmented→SegmentedControl, Badge `dot`→StatusDot, Dropdown→DropdownMenu, `DrawerProps`→explicit interface |

Two adjacent files changed as a **consequence** of the above, not as partition
members:

- `WEBUINotificationDrawer.css` — the `.ant-drawer-*` Electron drag rules died
  with the antd Drawer; they now target this component's own header row.
- `BAIContentWithDrawerArea.css` — its
  `body:has(.margin-style) .ant-drawer-content-wrapper` rule became DEAD the
  moment the notification drawer stopped being an antd Drawer (P6). Repointed
  to `.astryx-drawer`; scope unchanged. Owned by no partition.

---

## 2. Documented exclusions (4)

| File | Why it stays |
|---|---|
| `ThemeAdminProvider`, `ThemeSecondaryProvider` | **Theme PRODUCERS.** They build an antd `ThemeConfig` and install it via `ConfigProvider`, reading `ConfigProvider.ConfigContext` for the parent's algorithm. MAPPING §5 splits `ConfigProvider` three ways and flags the nested-`<Theme>`-without-`mode` hazard: porting them means deciding the app's whole nested-theme layering. Final-switch material — while any consumer still renders antd, the antd theme must keep being produced. |
| `ThemeAccentColorPicker` | `theme.getDesignToken(...)` runs antd's palette ALGORITHM to derive a fallback accent — a producer call with no Astryx counterpart (Astryx derives ramps inside `defineTheme`, at build time). Renders nothing antd. Skip-listed since ticket 09; re-confirmed. |
| `TOTPActivateModal` (`QRCode` only) | MAPPING §2 grades `QRCode` **NONE — third-party**. There is no QR encoder anywhere in the dependency graph (`node_modules/.pnpm` has no `qr*`), so closing it means ADDING a runtime dependency — a `pnpm-lock.yaml` write that three sibling agents in this wave would have to merge (`.claude/rules/pnpm-lockfile-conflicts.md`). Import narrowed to the single symbol; queued for the final switch. |

---

## 3. PILOT-DECISIONs

**D1 — `Input.OTP` collapses to one `TextInput`** (`TOTPActivateModal`).
MAPPING §3.6: NONE. Rebuilding the six-box widget (per-box focus, paste
splitting, backspace traversal) is the antd-equivalence reflex the simplicity
policy forbids. The Form.Item rules already enforce required + digits-only.
`inputMode`/`maxLength`/`autoComplete` go with it — `TextInputProps` is a
closed surface with no raw-attribute passthrough.

**D2 — `Input.Search` becomes `InputGroup(TextInput + IconButton)`**
(`SessionOwnerSetterCard`). This IS the documented §3.6 recipe. `onSearch`
fires on Enter (`onEnter`) or the trailing button, matching antd's
`enterButton`; the check-vs-search glyph keeps signalling resolved-owner state.

**D3 — `Input.Password` loses the reveal-eye toggle**
(`UserProfileSettingModal`). §3.6 maps it to `TextInput type="password"`;
Astryx has no show/hide affordance. Both fields here are write-only (never
pre-filled), so nothing the user cannot re-type is concealed.

**D4 — the shared-memory "slider" is rebuilt as two boxes, not a ProgressBar**
(`SharedMemoryFormItems`). It was never an input: an antd `Slider` with its
handle hidden, `cursor: default`, and a `ConfigProvider` block repainting
rail/track — a read-only two-tone bar. §3.11 offers `ProgressBar`, but its
track colour is theme-owned and cannot carry the warning hue that the legend
directly beneath NAMES ("yellow = shared memory"), so flattening would break
the legend's contract. Two plain boxes, painted from the same theme-shim tokens
the legend swatches already use. No antd, no CSS file, light/dark from the shim.

**D5 — `SegmentedControlItem`'s help tooltip moves to the `icon` slot**
(`ClusterModeFormItems`, `ResourceAllocationFormItems`). `label` is a required
STRING (P2), so antd's `<Radio.Button>{text}<Tooltip><CircleHelp/></Tooltip>`
cannot stay inside it. Same glyph, same `Trans` copy, now leading the label
instead of trailing it — the only visual change — and the manual `marginLeft`
is gone because the slot owns its spacing.

**D6 — the notification list is a `VStack` map, not an Astryx `List`**
(`WEBUINotificationDrawer`). Astryx `List`/`ListItem` is a `<ul>`-shaped
component for label/description rows; the three notification items are rich
cards with their own action rows, and "don't place interactive elements inside
an interactive list item" is an explicit Astryx rule. antd's `List`
contributed no pagination, no dividers, no item meta here — and the `VStack`
keeps this file decoupled from how sibling partition W2-A renders those items.

**D7 — `Badge dot` on a segment label becomes a `StatusDot` icon**
(`WEBUINotificationDrawer`). §3.8 grades the count/dot OVERLAY as NONE, and
`SegmentedControlItem.label` is a string anyway. The dot moves into `icon` as
`StatusDot variant="accent"` — the same "there is activity" signal, now with an
accessible name.

**D8 — `Tabs forceRender` becomes `display:none`, not unmount**
(`RuntimeParameterFormSection`). antd mounted every pane up front so required
rules in unvisited tabs registered with the form; `validateFields()` silently
skips unregistered fields. `TabList` renders no panels, so every group stays
mounted and the inactive ones are hidden — the requirement survives verbatim.

**D9 — the "touched" mark moves from the control to `Form.Item`**
(`RuntimeParameterFormSection`). The shared Astryx adapters own the `onChange`
slot and only two expose an `onValueChange` escape hatch. Rather than fork
them, the mark rides `getValueFromEvent`, which fires on the same events,
passes the value through untouched, and works for every control type.

**D10 — five local `Form.Item` control adapters, not new shared props.**
`InlineNameInput` (SessionInfoCell), `OTPInput` (TOTPActivateModal),
`TotpSwitch` (UserProfileSettingModal), `AliasInput` (VFolderTable),
`MountPathInput` (VFolderMountFormItem), `OwnerEnabledSwitch` /
`OwnerEmailSearchInput` (SessionOwnerSetterCard), `ClusterModeSegmented` (×2).
Each needs one thing the shared `astryxFormControls` surface does not carry
(`onEnter`, `onKeyDown`, `isLoading`, click-propagation control, a
state-dependent label, a per-option tooltip). `components/astryxFormControls.tsx`
is shared, unowned infrastructure that three sibling agents are editing in the
same wave, so widening it here would trade a local 15-line adapter for a
cherry-pick conflict. **Follow-up:** once the wave lands, fold the recurring
ones (`onEnter`/`onKeyDown` on TextInput, `isLoading` on Switch) into the
shared module and delete the locals.

**D11 — `UserSelect` loses its server-side search.** `Selector.hasSearch` owns
its search box and exposes no controlled `searchValue`/`onSearch`, so the term
can no longer feed the Relay `email ilike` filter. §3.1 routes genuine remote
search to `Typeahead`/`ComplexSelector` — building either for a component that
**no file imports** is exactly the reflex the simplicity policy forbids. The
query already returns up to 150 active users and `Selector` filters that set
locally. If it is ever revived at scale, promote it to `BAIUserSelectAstryx`
(which already does paginated remote search) rather than re-adding the filter.

**D12 — `UserSessionsMetrics` drops `showTime` from its range picker.** §3.13
has `DateTimeInput` but no date-TIME range input. The filter's presets were
already whole-day/relative spans and the URL defaults were already
`00:00:00`/`23:59:59`, so a picked range now covers whole days — which is what
the defaults expressed. The six antd presets collapse to three day-granular
ones (Today / Last 1 Day / Last 7 Days); the sub-day ones (`LastHour`,
`Last3Hours`, `Last12Hours`) have no meaning without a time component.

**D13 — Row/Col.** `SessionOwnerSetterCard`'s `Row gutter` + two
`Col span={12}` (no breakpoint props) is the one §3.9 shape that translates
directly: `Grid columns={24}` + `GridSpan columns={12}`.
`ResourceAllocationFormItems`' `Row` + two `Col xs={24}` is a single column
with a gap, i.e. `VStack gap` — nothing reflows, both columns already spanned
the full 24.

**D14 — every `Descriptions` drops `bordered` / `size="small"` / per-item
`span`.** The project-wide call from tickets 15/18, re-applied at seven more
sites. `VFolderNodeDescription` additionally follows its already-converted V2
twin verbatim (copy affordance moves from the LABEL to the VALUE, because
`MetadataListItem.label` is a plain string).

**D15 — every icon-only `Button` + `Tooltip` pair becomes one `IconButton`.**
17 sites. `IconButton.label` is required and doubles as the tooltip, so the
wrapper disappears and each control gains its first accessible name. The
`style={{color: token.colorX}}` glyph tints (colorError, colorInfo, colorLink,
colorTextTertiary) are dropped — P5, closed variant enum — except where the
whole control is semantically destructive, which becomes
`variant="destructive"`.

**D16 — no per-file colour maps survive.** `ScopedRolePermissionCard`'s
`GRANT_STATE_TAG_COLOR`, `SummaryItemInvitation`'s r/w/d/o array,
`ValidationStatusTag`'s `getStatusColor` switch, and
`VFolderNodeDescription`'s imported `statusTagColor` all route through ticket
13's `badgeVariantForStatus` / `badgeVariantForTagColor` instead.

**D17 — the notification drawer header reserves the Drawer's close button.**
MEASURED (`p3-w2c-measure-drawer.mjs`, 280px drawer at the viewport's right
edge): lab Drawer's built-in Close sits at x 1760..1792 and paints ABOVE the
content, while the header's "More" menu landed at x 1752..1784 — a 24×24
overlap swallowing part of its hit box. 32px of inline-end reserve leaves an
8px gap (re-measured: More 1720..1752, Close 1760..1792). Applied as an INLINE
style, not in the co-located CSS, because `BAIFlex` hard-codes `padding: 0`
inline and no stylesheet rule can outrank that.

---

## 4. Handoff — found, NOT ours to fix

**The "My Account Information" modal renders its antd `Form.Item` labels
invisible.** Measured with `.scratch/astryx-migration/p3-w2c-ab-account.mjs`:
label colour `rgb(20,20,20)` against the dialog's dark surface. **A/B proves it
is PRE-EXISTING** — the same probe run against `UserProfileSettingModal`'s
pre-conversion revision reproduces it exactly (`shots/p3-w2c/
ab-account-before.png` vs `35-my-account-light.png`). Cause: the header's
reverse-theme region (this modal opens from the account menu) meeting the
Astryx `Dialog` surface wave 1 introduced, while the antd Form layer still
paints labels from the LIGHT antd theme — MAPPING §5's "a nested `<Theme>` with
no explicit `mode` falls back to `system`, not the parent's resolved mode".
Belongs to the modal/theme layer (BAIModal + ReverseThemeProvider), not to any
call site.

**`SessionLauncherErrorTourProps` still queries `.ant-card-head`**, and
`RuntimeParameterFormSection` / `DeploymentAddRevisionModal` still lean on
`bai-card-error`. `BAICard` is an unconverted BUI frontier component that still
emits antd Card DOM — revisit when it converts. Marked in-code.

---

## 5. Verification

- `bash scripts/verify.sh` → **`=== ALL PASS ===`** (Relay, ESLint, Prettier,
  TypeScript, Vite warmup, StyleX, Astryx theme build, terminology).
- `react` vitest **62 files / 1164 tests pass**; `backend.ai-ui` vitest
  **22 files / 446 pass, 1 skipped**.
- `antd-import-graph.mjs`: **direct antd 256 → 214**. Every file in this
  partition is direct-antd-free except the four documented exclusions.
- Live, against `10.82.0.130:8090`, Vite on **5870**, light AND dark:
  - scripts `p3-w2c-shots{,2,3,4}.mjs`, `p3-w2c-diag.mjs`,
    `p3-w2c-measure-drawer{,2}.mjs`, `p3-w2c-warn.mjs`,
    `p3-w2c-ab-account.mjs`
  - shots → `.scratch/astryx-migration/shots/p3-w2c/`
  - **8 surfaces**: notification drawer · RBAC list + role drawer ·
    RoleFormModal · session list + detail drawer · session launcher (3 steps) ·
    data/folders · statistics → User Session History · My Account.
  - **Zero `pageerror`s** on every pass, both themes. Measured negatives:
    `.ant-drawer` 0, `.ant-list` 0, `.ant-descriptions` 0, `.ant-tag` 0,
    `.ant-picker` 0, `.ant-card` 0 on the launcher, `.ant-input` 0 in the
    account modal.
  - Measured positives: drawer `dialog.open === true` at 280px with the
    "Notifications | All | In progress" header; 40 Astryx badges on RBAC;
    `DateRangeInput` reading "Aug 8 – Aug 8"; the two-tone shmem bar with its
    legend and the Auto/Manual switch.

Credentials came from the environment; `react/.env.development.local` is
gitignored and not committed.
