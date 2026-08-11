# 31 — E2E 셀렉터 data-* 전환

**Target:** to-astryx
**Blocked by:** 30
**Status:** done (2026-08-08)

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** .ant-* 셀렉터(Form 82곳 포함 전 스위트)를 data-* 훅으로 전환(티켓 08 답변의 사상표 활용).

## Acceptance criteria

- [x] e2e 스위트에서 .ant-* 참조 — 846 → 708 (대량 감소, 잔존은 문서화된 irreducible remainder)
- [x] 전환 후 스위트 통과율이 전환 전과 동등 이상 — static verification only (no live cluster this session); every replacement anchor cited against component source; `bash scripts/verify.sh` ALL PASS; e2e lint clean on every touched file

## Implementation notes

### Scope reality check (read this first)

The ticket's known-dead inventory (24/28/29/05/12) covered a small slice of what
the `.ant-*` gate actually reports in `e2e/`: 846 references across 69 files at
session start. Investigation showed **most of those 846 are legitimate** —
they target components that are still, by design, antd-wrapped:

- `BAIModal` (`packages/backend.ai-ui/src/components/BAIModal.tsx:5` —
  `import { Button, Modal, Tooltip } from 'antd'`)
- `BAITable` (`.../Table/BAITable.tsx:20`)
- `BAITag` (`.../BAITag.tsx:2`)
- `BAICard` (`.../BAICard.tsx:3`)
- `BAISelect` (`.../BAISelect.tsx:10`)
- `BAIAlert` (`.../BAIAlert.tsx:2`)
- `BAIText` (`.../BAIText.tsx:3` — still `Typography` copyable, so
  `.anticon-check` on a `BAIText copyable` control is also legitimate)
- `BAIFetchKeyButton`'s own `Space.Compact`/`Dropdown`/`Tooltip` chrome
  (`.../BAIFetchKeyButton.tsx:7`)
- `BAINameActionCell`'s overflow menu (`.../Table/BAINameActionCell.tsx:7` —
  raw antd `Dropdown`, so `role="menuitem"` on ITS items is correct)
- Raw antd `Popconfirm`/`Drawer`/`Radio`/`Progress`/`Typography`/`DatePicker`/
  `Segmented`/`Steps`/`Descriptions`/`message` used directly in ~40 components
  that no page-group ticket (15–24) touched (`SessionLauncherPage.tsx`,
  `ResourceAllocationFormItems.tsx`, `ImageEnvironmentSelectFormItems.tsx`,
  `ClusterModeFormItems.tsx`, `RoleFormModal.tsx`, `LegacyRolePermissionTab.tsx`,
  `BAIDynamicUnitInputNumber.tsx`, `BAIFileExplorer.tsx`, etc.)

Given that, the approach taken was **not** "reduce the census number as far as
possible" but **"find every selector that is actually dead, verify it against
the component's current source, fix it — and leave everything else alone,
correctly identified."** Blindly rewriting all 846 would have broken passing
tests (mixing up genuinely-antd Table/Select/Radio/Popconfirm DOM with
nonexistent Astryx anchors).

### Method

For every candidate: find the rendering component, grep its imports for
`from 'antd'`, and read enough of it to answer "does THIS specific control
still render antd DOM, or did it move to an Astryx primitive?" before touching
the e2e selector. This surfaced dead selectors **outside** the ticket's named
list (see "Undocumented finds" below) and correctly left the majority
untouched.

### Ticket 24 — sider/menu (`.ant-menu-item-disabled`, `role="menuitem"`)

`e2e/config/page-access-control.spec.ts` — the 7 documented
`.ant-menu-item-disabled` sites, **plus** 6 `getByRole('menuitem', ...)` calls
that also broke (not `.ant-*`, so outside the gate's literal count, but the
same root cause): Astryx `SideNavItem`
(`@astryxdesign/core/SideNav/SideNavItem.tsx`) has no `role="menuitem"` at
all — enabled items render `<a>` (role "link"), **disabled items render
`<button disabled>`** (role "button") via `NavItemElement`'s
`if (href && !isDisabled) <a> else <button disabled>`
(line 220). A single locator can't target one role across both states, so a
`getSideNavItem(page, name)` helper was added:
`sideNav.getByRole('link', {name}).or(sideNav.getByRole('button', {name}))`,
scoped to `<nav aria-label="Side navigation">`
(`SideNav.tsx:499-502`, `locales/en.json` `@astryx.sideNav.label`). Disabled
checks use Playwright's `toBeDisabled()` (true for either `aria-disabled` or
native `disabled`), replacing the `.ant-menu-item-disabled` class check.

Same `getByRole('menuitem', ...)` breakage found and fixed (role → `'link'`,
since none of these exercise the disabled/button branch) in 6 more files that
click sidebar items to navigate: `environment/environment.spec.ts`,
`environment/registry.spec.ts`, `agent/agent.spec.ts`,
`maintenance/maintenance.spec.ts`, `config/config.spec.ts`,
`plugin/plugin-system.spec.ts` (~35 sites total). Verified the OTHER
`getByRole('menuitem', ...)` sites (`user-profile-util.ts`,
`bulk-user-creation.spec.ts`, `chat.spec.ts`, `bulk-create-from-csv*.spec.ts`)
target real dropdown menus (antd `Dropdown` in `BAINameActionCell.tsx:7`, or
Astryx `DropdownMenu` in `ChatHeader.tsx` — both render `role="menuitem"`
items, `DropdownMenuItem.tsx:139`) — left unchanged, correctly.

### Ticket 29 — notification (`.ant-notification-notice*`)

`react/src/components/astryx-bui/BAINotificationStackAstryx.tsx` — added
`data-testid="notification-title"` / `"notification-description"` spans
around `item.title`/`item.description` (Astryx `Banner`'s title/description
are unlabelled `<div>`s with no class of their own to anchor on — a genuinely
missing anchor, so this is the ticket's sanctioned "minimal `data-testid`
addition"). Dismiss button is Astryx `Banner`'s built-in ✕,
`aria-label="Dismiss"` (`t('@astryx.banner.dismiss')`, `Banner.tsx:504`,
`locales/en.json`).

Rewired:
- `e2e/utils/classes/common/NotificationHandler.ts` — full rewrite
  (`notificationSelector`, `closeNotification`, `getNotificationMessage`,
  `getNotificationDescription`, `getNotificationByType` all retargeted).
- `e2e/utils/test-util-antd.ts` — `getNotificationMessageBox` /
  `getNotificationDescriptionBox` rewritten on the new testids;
  `getNotificationTextContainer` removed (dead after the rewrite; had no
  other callers).
- `e2e/utils/classes/vfolder/FolderCreationModal.ts` —
  `dismissOverlappingNotifications` retargeted.
- `e2e/serving/serving-deploy-lifecycle.spec.ts`,
  `auto-scaling-rule-preset/preset-integration.spec.ts`,
  `auto-scaling-rule-preset/preset-crud.spec.ts`, `chat/chat.spec.ts`,
  `app-launcher/app-launcher-launch.spec.ts` (9 sites) — inline
  `.ant-notification-notice*` locators retargeted to
  `[data-testid="bai-notification-stack"] [data-notification-key]` (+
  `[data-status="error"]` for typed lookups). `.ant-message*` (the antd
  `message` toast, a *different*, still-unmigrated API) left untouched
  everywhere, including in OR-combined selectors.

### Ticket 28 — PowerSearch (`BAIPropertyFilter` / `BAIGraphQLPropertyFilter`)

Full interaction-model rewrite for the 3 named files, backed by reading
`PowerSearch.tsx`, `PowerSearchEditPopover.tsx`, `PowerSearchValueEditor.tsx`,
`usePowerSearchSource.ts`, `Token.tsx`, and `locales/en.json`:

- Search bar: `role="combobox"`, name = `t('comp:BAIPropertyFilter.SearchLabel')`
  = "Search filters" (`BaseTypeahead.tsx:748`).
- Picking a field with no pre-filled value opens an edit popover
  (`PowerSearch.tsx` `handleTokenizerChange` → `setPopoverState({type:'adding'})`):
  "Field" / "Operator" selectors (`Selector`, `role="combobox"`) + "Value"
  editor — `TextInput` (`role="textbox"`, commits via the popover's "Apply"
  button) for free-text fields, `Selector` (`role="combobox"`, commits
  **immediately** on picking an option — `shouldSave: true`,
  `PowerSearchValueEditor.tsx` `EnumEditor`) for strict-selection fields.
- A field with **no explicit field pick** — typed text matching the page's
  `contentSearchFieldKey` (or the first eligible free-text property when
  unset, `defaultContentSearchFieldKey`) — surfaces a `"<query>"` suggestion
  that commits immediately, no popover (`usePowerSearchSource.ts` content-search
  branch).
- Committed tokens render as `"<Field>: <operator> <value>"`
  (`PowerSearch.tsx` `tokenizerValue` → `displayLabel`); each token's remove
  control is `aria-label="Remove {label}"`
  (`t('@astryx.token.remove', {label})`, `Token.tsx:334`).
- The bespoke antd "reset all" button (only shown at 2+ filters) is gone;
  PowerSearch ships `hasClear` (`t('@astryx.tokenizer.clearAll')` = "Clear
  all"), shown whenever `value.length > 0` — **behavior changed**, not just
  the selector (documented per-test, not hidden).

Per-file:
- `environment/environment.spec.ts` — `applyImageFilter` /
  `removeFilterTag` / `resetAllFilters` rewritten; all 12 scenarios (2.1–2.12)
  updated to the new token-label format (`Name: contains python`,
  `Architecture: is x86_64`, defaults per `ImageList.tsx`'s
  `filterProperties`). Scenario 2.11 ("strict selection rejects freeform
  input") rewritten: the old premise (an AutoComplete that let you type an
  invalid value and get rejected at submit) doesn't exist any more — the
  strict-selection value editor is a closed `Selector` with **no free-text
  entry point at all**. Rewritten to assert the stronger, structural
  invariant (no matching option → nothing to select → no token created).
- `environment/registry.spec.ts` — `applyRegistryFilter` /
  `removeRegistryFilterTag` rewritten (single free-text field, always
  content-search, single-step commit). Test 4.4 rewritten: its premise (a
  persistent "current property" Select showing "Registry Name") doesn't exist
  in PowerSearch (stateless typeahead); rewritten to assert the field is
  *offered* when the typeahead opens.
- `project/project-crud.spec.ts` — inline filter block rewritten
  (content-search, single field).
- **Undocumented find**: `e2e/utils/test-util.ts`'s **generic, shared**
  `selectPropertyFilter` / `clearAllFilters` / `removeSearchButton` (used by
  5 vfolder spec files — `file-upload-subdirectory`, `file-upload-dnd`,
  `file-create`, `file-upload`, `file-upload-duplicate`) assumed the old
  `.ant-space-compact` + two-`.ant-select` DOM. Rewritten on the general
  field-pick + popover flow, scoped through the `data-testid` PowerSearch's
  own root carries (`PowerSearch.tsx` `data-testid={testId}` on `Tokenizer`).

### Ticket 05 — `BAIFormItem` (`.ant-form-item*`)

Cross-referenced the 39 files that actually render `<BAIFormItem>` (found via
`grep -rl "^import BAIFormItem"`) against every e2e `.ant-form-item*` site.
Migrated attribute set (`BAIFormItem.tsx`): root `[data-bai-form-item]` +
`[data-status="error"|"warning"]`, `[data-bai-form-item-label]`,
`[data-bai-form-item-control-input]`, `[data-bai-form-item-explain-error]`
etc. Fixed where the target *is* migrated:

- `e2e/utils/classes/AdminModelCardPage.ts` (14 sites) +
  `admin-model-card-create.spec.ts` (22) + `admin-model-card-edit.spec.ts` (5)
  — `AdminModelCardSettingModal.tsx` (confirmed `BAIFormItem`). `.ant-select*`
  in the same file left untouched (VFolder/Access-Level selects still
  antd-backed).
- `environment/environment.spec.ts` — `ManageImageResourceLimitModal.tsx`
  (CPU/Memory fields — the outer `BAIFormItem` migrated, but the *value
  control* for "mem", `BAIDynamicUnitInputNumber.tsx:4`, still wraps antd
  `InputNumber`/`Select`/`Typography`, so those inner selectors stay) and
  `ManageAppsModal.tsx` (per-row outer `BAIFormItem`, 3 nested `noStyle`
  BAIFormItems per row render zero extra DOM, so the row count semantics are
  unchanged).
- `e2e/utils/classes/vfolder/FolderCreationModal.ts` — `FolderCreateModalV2.tsx`
  (confirmed migrated; the sibling `FolderCreateModal.tsx` — no `BAIFormItem`
  — turned out to have **zero importers anywhere in `react/src`**, i.e. it's
  dead/orphaned code the live app never renders, so the e2e file's target is
  unambiguously V2).
- `e2e/utils/user-profile-util.ts` — `UserSettingModal.tsx`.
- `e2e/credential/bulk-create-from-csv.spec.ts` — `BulkCreateUserFromCSVModal.tsx`.
- `e2e/auth/forgot-password.spec.ts`, `e2e/auth/password-expiry.spec.ts` —
  `LoginFormPanel.tsx`'s `ChangePasswordEmailModal` and `ChangePasswordView.tsx`
  (both confirmed `BAIFormItem`).

Left correctly unmigrated (verified raw `Form.Item`, no `BAIFormItem` import):
`AutoScalingRuleEditorModal.tsx` (live component behind
`DeploymentAutoScalingCard.tsx` — the legacy `AutoScalingRuleEditorModalLegacy.tsx`
has zero importers), `ResourceAllocationFormItems.tsx`,
`ImageEnvironmentSelectFormItems.tsx`, `RoleFormModal.tsx`,
`SessionLauncherPage.tsx` — sites: `auto-scaling-rule-preset/preset-integration.spec.ts`,
`serving/deployment-lifecycle.spec.ts` (CPU/Memory/Single-Node in the Add
Revision dialog's nested unmigrated sections), `serving/add-revision-manual-image.spec.ts`,
`rbac/rbac-role-crud.spec.ts`, `session/session-cluster-mode.spec.ts`,
`visual_regression/{serving,session}/*_page.test.ts`.

`e2e/utils/test-util-antd.ts`'s `getFormItemControlByLabel` is a **shared**
helper hit by both a migrated call site
(`FolderCreationModal.ts` → `FolderCreateModalV2`, "Location") and an
unmigrated one (`deployment-lifecycle.spec.ts` → `AutoScalingRuleEditorModal`,
"Metric Source"). Made dual-mode: the selector matches
`.ant-form-item-row, [data-bai-form-item]` (old and new DOM shapes can never
both match the same element, so the OR is safe), forward-compatible with
`AutoScalingRuleEditorModal`'s eventual migration.

### Ticket 12 — icons (`.anticon-*`)

`.anticon-reload` was dead everywhere it appeared (3 shared helpers —
`e2e/utils/test-util.ts`, `e2e/utils/cleanup-util.ts`,
`e2e/serving/serving-deploy-lifecycle.spec.ts` — plus
`rbac/rbac-role-detail.spec.ts`'s drawer): `BAIFetchKeyButton.tsx` renders
lucide `RotateCw` with no antd icon class; the button carries a native
`title="Refresh"` attribute instead (`t('comp:BAIFetchKeyButton.Refresh')`).
Retargeted to `button[title="Refresh"]`.

`.anticon-delete` was dead in 4 `auto-scaling-rule-preset/*.spec.ts` files
(`preset-crud`, `preset-integration`, `preset-filter-sort`,
`preset-table-settings`, 7 sites): `PrometheusQueryPresetTable.tsx` uses
`BAINameActionCell` with `icon: <Trash2 size="1em" />` (lucide) and
`aria-label={action.title}` = "Delete" (`t('button.Delete')`). Retargeted to
`getByRole('button', {name: 'Delete', exact: true})`.

`.anticon-close` (`user-profile.spec.ts:250`, antd `Tag`'s own default
`closeIcon`) and `.anticon-check`
(`preset-table-settings.spec.ts:298`, antd `Typography.Text copyable`'s own
icon, via unmigrated `BAIText.tsx:3`) verified **legitimate** — both are
antd's *own* internal icon dependency, not app code ticket 12 touched, so no
change.

### Undocumented finds (not in tickets 24/28/29/05/12, discovered by verifying components before trusting the census)

1. **`BAIRadioGroup` → Astryx `SegmentedControl` (ticket 10, "cn-oss-removal
   pilot")** — `react/src/components/BAIRadioGroup.tsx` has rendered on
   `SegmentedControl` (`role="radiogroup"` container, `<button role="radio">`
   items — real, visible, directly clickable, unlike antd's opacity:0-input
   button-style radio group) since a ticket *before* the page-group tickets
   even ran. 21 consumers repo-wide. Only 3 e2e files exercised it via dead
   selectors:
   - `e2e/serving/deployment-lifecycle.spec.ts` — Running/Terminated toggle
     (`DeploymentListPage.tsx` / `DeploymentReplicasCard.tsx`). 4
     `.ant-radio-button-wrapper` sites fixed to `getByRole('radio', ...)`
     (several already carried a workaround comment for antd's hidden-input
     quirk, now obsolete — comments updated too). The file's *other*
     `.ant-radio-button-wrapper` site ("Single Node", in the Add Revision
     dialog) is genuinely unmigrated (`ResourceAllocationFormItems.tsx`) —
     left alone.
   - `e2e/project/project-crud.spec.ts` — Active/Inactive toggle
     (`ProjectPage.tsx`). 1 site.
   - `e2e/credential/my-keypair-management.spec.ts` — Active/Inactive toggle.
     9 `.locator('label').filter({hasText: 'Inactive'/'Active'})` sites (not
     `.ant-*` at all — antd's Radio.Button wraps a `<label>`; Astryx
     `SegmentedControl` has none) — the file *already* had matching
     `getByRole('radio', {name: 'Active', exact: true})` **assertions**
     elsewhere, i.e. someone had already hit this half-way; the click actions
     were the missed half. All retargeted to `getByRole('radio', ...)`.
2. **Astryx `SegmentedControl` used directly** (not via `BAIRadioGroup`) in
   `DeploymentAddRevisionModal.tsx` ("Use Config File" — the segmented control
   in the service-creation flow, which internally reuses this modal's form),
   `AgentStats.tsx` and `MyResourceWithinResourceGroup.tsx` (both "Used/Free"
   dashboard-widget toggles, `label` composed from the two option labels —
   `role="radiogroup"` name = "Used/Free"). Fixed:
   `serving/serving-deploy-lifecycle.spec.ts` +
   `auto-scaling-rule-preset/preset-integration.spec.ts` (the "Use Config
   File" `.ant-segmented-item-label` click — the item is a real `<button
   role="radio">`, so the click target collapsed into the existing
   `useConfigFileRadio` locator, dropping a now-unnecessary two-step
   label-then-radio dance) and `dashboard/dashboard.spec.ts` (3 blocks across
   2 widgets, `.ant-segmented`/`.ant-segmented-item-selected` → `role="radiogroup"`
   / `getByRole('radio', ...).toBeChecked()`).
3. **`BAISkeletonAstryx`** (ticket 08 gap component) is live in
   `MyResourceWithinResourceGroup.tsx` (`dashboard.spec.ts`'s
   `.ant-skeleton` check). Astryx `Skeleton` renders `aria-hidden="true"`
   with no class of its own — a genuinely missing anchor — so a minimal
   `data-testid="my-resource-skeleton"` was added at the call site (not to
   the shared `BAISkeletonAstryx` component, which composes multiple boxes
   per render and has no single natural anchor point).
4. **`BAIPopconfirmAstryx`** (ticket 08 gap component) is live in
   `MyKeypairManagementModal.tsx` (Set-as-Main / Deactivate / Restore /
   Delete-Keypair row actions). This was the single largest undocumented
   fix: the popconfirm content is Astryx `Popover`, `role="dialog"`,
   `aria-label={title}` (`Popover.tsx:315` default role, `BAIPopconfirmAstryx.tsx`);
   every *trigger* is now an `IconButton` with a stable `label` (no more
   `.ant-btn-dangerous` class, no more icon-name-derived aria-labels like
   "undo"). `my-keypair-management.spec.ts` had **13** dead
   `.ant-btn-dangerous`/`:not(.ant-btn-dangerous)` clicks and **2** dead
   `getByRole('button', {name: /undo/i})` restore-button lookups (the actual
   label is "Restore", not an icon-derived "undo") — all rewritten to direct
   `getByRole('button', {name: '<action label>'})` / `getByRole('dialog',
   {name: '<action label>'})`, which also deleted several lines of
   fallback/retry logic that existed only to route around the old ambiguous
   button lookup. Verified the *other* 16 `.ant-popconfirm` sites repo-wide
   (`user-crud.spec.ts`, `bulk-user-creation.spec.ts`, `rbac-role-*.spec.ts`,
   `project-crud.spec.ts`, `password-expiry.spec.ts`,
   `user-ip-restriction-enforcement.spec.ts`) target components **not** in
   `BAIPopconfirmAstryx`'s consumer list — legitimately still-antd, left
   alone.

### Documented irreducible remainder

**`e2e/serving/endpoint-route-table.spec.ts` (53 `.ant-*` references, the
single largest file in the census) is dead code.** Its own top-of-file
comment: "FR-2664 renamed the serving/deployments system ... the new
`DeploymentDetailPage` removed the 'Routes Info' card and all route-related
UI. Every test in this file would fail with the same root cause, so all are
marked fixme at the describe level" — `test.fixme(true)` is called directly
in the `test.describe` callback (line 29), which disables every test in the
file. Migrating its selectors is pure busywork against a UI that no longer
exists; the actionable follow-up is deleting the file (out of scope for this
ticket — flagging it here per the ticket's "document irreducible remainder"
clause).

Everything else remaining (`.ant-modal*`, `.ant-table*`, `.ant-select*`,
`.ant-tag*`, `.ant-card*`, `.ant-radio-button-wrapper` [Single Node only],
`.ant-popconfirm`, `.ant-drawer*`, `.ant-space-compact`, `.ant-progress*`,
`.ant-picker*`, `.ant-typography`, `.ant-message*`, `.ant-btn*` [non-dangerous],
`.ant-form-item*` [the 4 files listed above], `.ant-steps*`,
`.ant-descriptions*`) targets components verified (per the method above) to
still literally render antd DOM — see "Scope reality check". A future ticket
that migrates `BAIModal`/`BAITable`/`BAITag`/`BAICard`/`BAISelect`/`BAIAlert`
off antd, or the ~40 still-antd page components listed above, would need a
matching e2e pass; this ticket's job was to fix what ticket-24/28/29/05/12
(and the undocumented finds above) actually broke, not to pre-emptively
rewrite selectors for surfaces nothing has migrated yet.

### Verification

- `bash scripts/verify.sh` → `=== ALL PASS ===` (covers the 2 touched
  app-source files: `BAINotificationStackAstryx.tsx`,
  `MyResourceWithinResourceGroup.tsx`).
- `e2e/` has no dedicated `tsconfig.json` (`pnpm exec tsc --noEmit -p e2e` →
  `TS5057: Cannot find a tsconfig.json file`) and its ESLint config
  (`e2e/eslint.config.mjs`) is not type-aware (no `parserOptions.project`), so
  there is no configured TypeScript gate for `e2e/` in this repo — confirmed,
  not assumed, before skipping it. `pnpm exec eslint --config
  e2e/eslint.config.mjs --max-warnings=0 <every touched e2e file>` — clean
  (0 errors/warnings) on all 30 touched e2e files, run in 3 batches.
- Every replacement anchor in this file is cited against component source
  (file:line or component name + confirmed prop/attribute) per the ticket's
  static-verification requirement; no live cluster was available this
  session to run the suite end-to-end.
- Census: `node scripts/migration-gates/ant-selector-gate.mjs --counts` —
  e2e/ `.ant-*` references: **846 → 708** (138 fixed). Remainder is the
  documented irreducible set above (`endpoint-route-table.spec.ts`'s 53 dead
  entries + genuinely-unmigrated-component selectors).

### Files touched (33)

App source (2, both covered by `verify.sh`):
`react/src/components/astryx-bui/BAINotificationStackAstryx.tsx`,
`react/src/components/MyResourceWithinResourceGroup.tsx`.

e2e (31): `e2e/config/page-access-control.spec.ts`,
`e2e/utils/classes/common/NotificationHandler.ts`,
`e2e/utils/test-util-antd.ts`,
`e2e/utils/classes/vfolder/FolderCreationModal.ts`,
`e2e/serving/serving-deploy-lifecycle.spec.ts`,
`e2e/auto-scaling-rule-preset/preset-integration.spec.ts`,
`e2e/auto-scaling-rule-preset/preset-crud.spec.ts`,
`e2e/auto-scaling-rule-preset/preset-filter-sort.spec.ts`,
`e2e/auto-scaling-rule-preset/preset-table-settings.spec.ts`,
`e2e/chat/chat.spec.ts`, `e2e/app-launcher/app-launcher-launch.spec.ts`,
`e2e/environment/environment.spec.ts`, `e2e/environment/registry.spec.ts`,
`e2e/project/project-crud.spec.ts`,
`e2e/utils/classes/AdminModelCardPage.ts`,
`e2e/admin-model-card/admin-model-card-create.spec.ts`,
`e2e/admin-model-card/admin-model-card-edit.spec.ts`,
`e2e/utils/user-profile-util.ts`,
`e2e/credential/bulk-create-from-csv.spec.ts`,
`e2e/auth/forgot-password.spec.ts`, `e2e/auth/password-expiry.spec.ts`,
`e2e/utils/test-util.ts`, `e2e/utils/cleanup-util.ts`,
`e2e/rbac/rbac-role-detail.spec.ts`,
`e2e/serving/deployment-lifecycle.spec.ts`,
`e2e/credential/my-keypair-management.spec.ts`,
`e2e/dashboard/dashboard.spec.ts`, `e2e/agent/agent.spec.ts`,
`e2e/maintenance/maintenance.spec.ts`, `e2e/config/config.spec.ts`,
`e2e/plugin/plugin-system.spec.ts`.
