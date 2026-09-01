# QA round 2 — agent B: multi-select triggers + attached button groups

Base: `to-astryx` @ `0a6899059`. Dev server on 5920/5921, backend
`10.82.0.130:8090`. Screenshots: `.scratch/astryx-migration/shots/qa2-b/`.

Scope guard: nothing here touches `BAICard` / `BAITabs` / tab theming (agent A),
page layout containers or Drawer headers (agent C), or `Chat/*` (agent D). The
one file under a sibling's neighbourhood, `DeploymentRevisionHistoryTab.tsx`,
is edited inside the drawer's `extra` slot only — the drawer chrome is untouched.

---

## 1. Multi-select triggers: labels, not "N selected"

### Symptom

Legacy antd `Select mode="multiple"` printed the selected options in the
trigger (as tag pills). After the Astryx flip the same fields read
**"2 selected"**.

### Root cause

Astryx `MultiSelector` defaults `triggerDisplay` to `'count'`
(`MultiSelector.tsx:702`). Nothing in the repo passed the prop — measured:
zero occurrences of `triggerDisplay` anywhere before this pass — so every
`mode="multiple"` call site silently inherited the count. Astryx offers three
values (`MultiSelector.tsx:1101`):

| value | renders | overflow |
|---|---|---|
| `count` | `N selected` | n/a — the labels never appear |
| `labels` | `A, B, C` | first **3**, then `, +N`. The 3 is **hardcoded**, not a prop |
| `badges` | `[A] [B] [C]` (`Badge`) | first `maxBadges` (default 3), then `+N` |

**Overflow policy chosen: `labels`.** `badges` is visually closer to antd's tag
pills, but the chips wrap and grow the trigger's height, which Astryx's own
`MultiSelector` guidance warns against for fields in toolbars and form rows
("prefer count or labels trigger display so the group stays single-line").
`labels` keeps the control exactly one row tall at any selection size, and the
`, +3` tail is the same information antd's `maxTagCount="responsive"` collapse
carried. `badges` stays available per call site on both engines.

### Fix — component defaults only, zero call sites touched

| file | change |
|---|---|
| `packages/backend.ai-ui/src/components/BAISelect.tsx` | new `triggerDisplay` / `maxBadges` props, `triggerDisplay` **defaults to `'labels'`**, forwarded to `MultiSelector` in the `mode="multiple" \| "tags"` branch |
| `react/src/components/astryxFormControls.tsx` | `AstryxFormMultiSelector` gains the same prop with the same `'labels'` default |
| `packages/backend.ai-ui/src/components/BAIComplexSelect.tsx` | new `triggerDisplay: 'labels' \| 'badges'`, **default `'labels'`**; the multiple-mode trigger now emits the *same string* Astryx builds (`A, B, C, +N`, capped by the existing `maxTriggerTokens`, default 3). The former `Token` chips (P26-4) move behind `triggerDisplay="badges"` |

`'count'` is deliberately **not** offered on `BAIComplexSelect`: it is the one
rendering that hides what the trigger exists to show.

The three engines now speak the same trigger language, which is the point — a
user moving between an infinite-scroll select (`ComplexSelector`) and a static
one (`MultiSelector`) must not be able to tell which engine is behind the field.

### Measured, live

| surface | component chain | before | after |
|---|---|---|---|
| `/admin/users` → row **More actions → Edit** → *Projects* | `ProjectSelect` → `BAISelect mode="multiple"` → `MultiSelector` | `2 selected` | `test-project, 031f5252-…` |
| `/admin/agent?tab=resourceGroup` → row **Edit** → *Allowed session types* | `AstryxFormMultiSelector` → `MultiSelector` | (`3 selected`) | `Interactive, Batch, Inference` |

Shots: `before-multiselector-projects-light.png` →
`after-multiselector-projects-{light,dark}.png`,
`after-formmultiselector-sessiontypes-{light,dark}.png`,
`after-user-modal-{light,dark}.png`,
`after-resourcegroup-modal-{light,dark}.png`.

The `before` row was produced by temporarily flipping the `BAISelect` default
back to `'count'` and re-running the same probe
(`.scratch/astryx-migration/qa2b-select2.mjs`), so the two shots differ in
exactly one line of code.

`BAIComplexSelect`'s multiple mode has **no reachable route on this backend**
(see the audit table's note on it), so it is pinned by
`packages/backend.ai-ui/src/components/BAIComplexSelect.trigger.test.tsx`
instead — 4 assertions over the trigger string, including the `, +1` collapse
and a negative control against `/\d+ selected/`.

### Observation, not fixed (pre-existing, now visible)

In the user-edit modal one selected project renders as a raw UUID
(`031f5252-…`) rather than a name. `MultiSelector` falls back to the raw value
when the value has no matching option, and `ProjectSelect`'s option list is
domain-scoped, so a project the user belongs to outside the selected domain has
no option to name it. Legacy antd behaved identically (plain string values, tag
shows the value) — `triggerDisplay="count"` was merely hiding it. Out of scope
here; belongs to `ProjectSelect`'s option sourcing.

---

## 2. Select-family audit

Census command: `git grep -ln "ComplexSelect\|Selector\|Tokenizer\|MultiSelect"
react/src packages/backend.ai-ui/src` (76 files after dropping locale JSON,
tests, stories and CSS-selector false positives), narrowed to the files that
actually *render* a select primitive (110 files) and then grouped by engine —
because the trigger is owned by the engine, not by the wrapper.

### Engines (where a trigger is actually rendered)

| # | component | engine | multi-capable | trigger behaviour before | after | fixed? |
|---|---|---|---|---|---|---|
| 1 | `BAISelect` (`mode="multiple"` / `"tags"`) | Astryx `MultiSelector` | yes | **`N selected`** | `A, B, C, +N` | **yes** |
| 2 | `BAISelect` (single) | Astryx `Selector` | no | selected label | unchanged | n/a |
| 3 | `BAIComplexSelect` (`multiple`) | Astryx `ComplexSelector` | yes | `Token` chips, 3 then `+N` | `A, B, C, +N` (chips still available via `badges`) | **yes** (aligned) |
| 4 | `BAIComplexSelect` (single) | Astryx `ComplexSelector` | no | selected label | unchanged | n/a |
| 5 | `AstryxFormMultiSelector` | Astryx `MultiSelector` | yes | **`N selected`** | `A, B, C, +N` | **yes** |
| 6 | `AstryxFormSelector` | Astryx `Selector` | no | selected label | unchanged | n/a |
| 7 | `AstryxFormTagsInput` | Astryx `Tokenizer` | yes (free entry) | removable chips, wrap to multiple lines | unchanged | no — already labels |
| 8 | bare `Tokenizer` adapters ×4 (`DeploymentSettingModal`, `AdminModelCardSettingModal`, `AdminDeploymentPresetModelConfigItem`, `UserSettingModal`) | Astryx `Tokenizer` | yes | removable chips, wrap | unchanged | no — already labels |

`Tokenizer`'s overflow policy is its own `tokenOverflowBehavior`, default
`'none'` = *tokens wrap to multiple lines*. That is exactly what antd
`mode="tags"` did, so it is left alone; `'unfocusedInline'` / `'unfocusedLayer'`
(single line + "+N more", expanding on focus) are available if a specific field
ever needs to stay one row tall.

### Wrappers that can go multi (all inherit an engine above — no trigger of their own)

| wrapper | engine | how it goes multi | inherits fix |
|---|---|---|---|
| `BAIAllowedHostNamesSelect` | `BAISelect` | `mode="multiple"` | ✔ #1 |
| `ProjectSelect` / `ProjectSelectForAdminPage` | `BAISelect` | `mode="multiple"` | ✔ #1 |
| `BAIStorageProxySelect` | `BAISelect` | `mode="multiple"` | ✔ #1 |
| `BAIResourceGroupSelect` | `BAISelect` | `mode="tags"` | ✔ #1 |
| `AgentSelect` | `BAIComplexSelect` | `mode="multiple"` → `multiple` | ✔ #3 |
| `BAIUserSelectAstryx` | `BAIComplexSelect` | `multiple` | ✔ #3 |
| `BAIAdminKeypairResourcePolicySelectAstryx` | `BAIComplexSelect` | `multiple` | ✔ #3 |
| `BAIVFolderSelectAstryx` | `BAIComplexSelect` | `multiple` | ✔ #3 |
| `BAIAdmin{Image,Project,Session,ModelService,ContainerRegistry,ResourceGroup}SelectAstryx`, `BAI{Project,Keypair,Bucket,Deployment,StorageHost,AvailablePreset}SelectAstryx` | `BAIComplexSelect` | `multiple` prop exists, no live call site passes it | ✔ #3 |
| `BAI{RuntimeVariant,ProjectVfolder,ObjectStorage}SelectAstryx`, `BAIDomainSelect`, `StorageSelect`, `AccessKeySelect`, `PrometheusCategorySelect`, `SettingItem`, `Chat/ModelSelect`, `BAIVFolderPathPicker`, `BAIProjectResource{Group,Policy}Select`, `SharedResourceGroupSelectForCurrentProject`, `KeypairResourcePolicySelect`, `UserResourcePolicySelect`, `ResourcePresetSelect`, `UserSelect`, `Chat/AIAgentSelect`, `Chat/DeploymentTokenSelect` | `BAISelect` / `BAIComplexSelect` | **single only** — documented as such in each header | n/a |

### Multi call sites, exhaustive

`mode="multiple"` / `mode="tags"` (→ `MultiSelector`, fix #1):
`UpdateResourceGroupsModal:177`, `ResourceGroupSettingModal:459`,
`KeypairResourcePolicySettingModal:562`, `BAIProjectSettingModal:475,481`,
`UpdateUsersModal:242`, `UserSettingModal:1095`,
`BulkCreateUserFromCSVModal:1255`, `ContainerRegistryEditorModal:498`,
`AssignRoleModal:246`, `ProjectAdminSettingModal:272` (Suspense fallback),
`ResourceAllocationFormItems:1487` (`AgentSelect`, routes to `BAIComplexSelect`).

`multiple` prop (→ `ComplexSelector`, fix #3): `UserFolderPermissionPanel:100`,
`ProjectAdminSettingModal:284`, `VFolderMountFormItem:127`, `AgentSelect:244`.

`AstryxFormMultiSelector` (fix #5): `ResourceGroupSettingModal:412`.

`Tokenizer` (#7/#8): `AstryxFormTagsInput` × `UpdateUsersModal:385`,
`PrometheusQueryPresetEditorModal:405,414`, `UserProfileSettingModal:342`,
`PortSelectFormItem:113`, `UserSettingModal:1237`, `AppLauncherModal:404`;
plus the four bare adapters.

### Why `BAIComplexSelect` multiple has no live proof

All three of its multi consumers are gated on this cluster:

* `ProjectAdminSettingModal` — the "Set project admin" row action only renders
  when the manager advertises project-admin assignment. Measured on
  `/admin/project`: the row exposes `Edit` / `Deactivate` only.
* `UserFolderPermissionPanel` — superseded by `UserFolderPermissionPanelV2`,
  which is **single**-select. The storage-host drawer renders V2.
* `VFolderMountFormItem` — **no call site left** in the repo; the session
  launcher's "Data & Storage" step uses `VFolderTable`, not a select.

Hence the render test, which asserts the trigger string directly.

---

## 3. Auto-refresh control reads as one group

### Symptom

`BAIFetchKeyButton`'s refresh icon and its interval dropdown rendered as two
pills with a notch between them; legacy was one attached control.

### Root cause

`ButtonGroup` was already in place and is *context*-based: `Button` /
`IconButton` read `ButtonGroupContext` and then apply position CSS keyed on
their own position among **siblings** — `:first-child` for the leading cap,
`IS_LAST_ITEM` (`:not(:has(~ *:not([popover])))`) for the trailing one
(`Button.tsx:479`). Both selectors resolve against the button's *real* parent.

The refresh button was wrapped in an Astryx `Tooltip`, which renders a
`display: contents` div around its child (`Tooltip.tsx:311`). Invisible to
layout — and fatal to the selector: the button became `:first-child` **of the
wrapper**, matching both the leading and the trailing rule, so it kept a full
`8px` pill against the dropdown's `0 8px 8px 0`.

This is the W1 lesson generalised: it is not "antd children are invisible to the
group", it is **anything that is not a direct child**. `BAIButton` already
renders an Astryx `Button` (wave 2), so the antd half of that lesson is gone;
the wrapper half is what was left.

### Fix

`packages/backend.ai-ui/src/components/BAIFetchKeyButton.tsx` — inside the
group, the refresh button carries its hover text through `title` (which
`BAIButton` maps to Astryx `Button`'s own `tooltip`) instead of being wrapped.
Astryx renders that tooltip as a `[popover]` **sibling inside a fragment**,
which is precisely the case `IS_LAST_ITEM` was written to skip. The standalone
(no-dropdown) branch keeps its `Tooltip` wrapper — there is no group there, and
the wrapper preserves the `placement="above" alignment="start"` placement.

### Measured

`.astryx-button-group` geometry, `.scratch/astryx-migration/qa2b-proof.mjs`:

| surface | child | before | after |
|---|---|---|---|
| `/project/default/deployments` | refresh | `8px` (parent `display: contents`) | **`8px 0px 0px 8px`** (parent = group) |
| | `15s` dropdown | `0px 8px 8px 0px` | `0px 8px 8px 0px` |
| `/project/default/data` | refresh | `8px` | **`8px 0px 0px 8px`** |
| | chevron dropdown | `0px 8px 8px 0px` | `0px 8px 8px 0px` |
| deployment detail card | refresh | `8px` | **`8px 0px 0px 8px`** |
| | `10s` dropdown | `0px 8px 8px 0px` | `0px 8px 8px 0px` |

Inter-button gap `0` throughout, group `101×32` / `64×32`. Light and dark.
Shots: `before-group-*-auto-refresh-light.png` →
`after-group-{deployments,data,deployment-detail}-auto-refresh-{light,dark}.png`.

---

## 4. The two POLISH-2 leftovers

### `DeploymentBasicInfoCard.tsx:301` (Edit + DropdownMenu) — already fixed upstream

POLISH-2 recorded this as an antd-`BAIButton` child. That is **stale**: wave 2
re-implemented `BAIButton` on Astryx `Button`, so the Edit button is now a
direct Astryx child and the group welds itself. Verified live on
`/project/default/deployments/<id>`:

| child | element | border-radius |
|---|---|---|
| Edit | `button.astryx-button secondary` | `8px 0px 0px 8px` |
| More | `button.astryx-button secondary` | `0px 8px 8px 0px` |

gap `0`, group `106×32`, light and dark. No code change needed.
Shot: `after-group-deployment-detail-control-{light,dark}.png`.

### `DeploymentRevisionHistoryTab.tsx:634` (Apply + DropdownMenu) — fixed

The intervening wrapper POLISH-2 flagged is `BAIPopconfirmAstryx`, i.e. Astryx
`Popover`'s **element form**, which wraps its trigger in an `inline-flex` anchor
div (`Popover.tsx:579`) — same failure mode as the tooltip above, but with a
real box rather than `display: contents`.

Fix: the popconfirm's **render-prop form** (`Popover.tsx:539`), which hands
`ref` / `onClick` / `aria-*` to the trigger and emits no wrapper. The child
becomes an Astryx `Button variant="primary"` (the idiom POLISH-2 already
established for `AdminUserManagement`), so `BAIButton` drops out of the file.

**PILOT-DECISION (QA2-B-2):** a confirm-guarded button inside a `ButtonGroup`
uses the render-prop popconfirm. The element form stays the default everywhere
else — it is shorter and needs no trigger wiring; only group membership forces
the render prop.

Live proof was not possible: the drawer opens from a revision row, and the dev
cluster's only deployment reports `revisionHistory.count: 0` ("No revision is
deployed — add a revision to activate this service"), so the table is empty.
Captured as `probe-revision-tab.png`. Pinned instead by
`react/src/components/astryx-bui/BAIPopconfirmAstryx.buttonGroup.test.tsx`,
which asserts the causal precondition both ways: render-prop → trigger's
`parentElement` **is** the group (and is its `firstElementChild`); element form
→ it is **not** (negative control). jsdom does not run StyleX's cascade, so the
radius itself is not observable there — direct-childhood is what the CSS is
keyed on and what a refactor would silently break.

---

## 5. Files changed

```
packages/backend.ai-ui/src/components/BAIComplexSelect.tsx        default trigger = labels
packages/backend.ai-ui/src/components/BAIComplexSelect.trigger.test.tsx   (new)
packages/backend.ai-ui/src/components/BAISelect.tsx               default trigger = labels
packages/backend.ai-ui/src/components/BAIFetchKeyButton.tsx       group member is a direct child
react/src/components/astryxFormControls.tsx                       default trigger = labels
react/src/components/DeploymentRevisionHistoryTab.tsx             render-prop popconfirm in the group
react/src/components/astryx-bui/BAIPopconfirmAstryx.buttonGroup.test.tsx  (new)
```

No call site changed for the select work — that was the requirement, and it
held: all three fixes are component defaults.

## 6. Verification

* `bash scripts/verify.sh` → `=== ALL PASS ===` (Relay, Lint, Format,
  TypeScript, Vite warmup, StyleX gate, Astryx theme build, Terminology).
* `pnpm --filter backend.ai-ui test` and `pnpm --filter ... react test` green,
  including the two new files (4 + 2 assertions).
* `pnpm --filter backend.ai-ui build` rerun after the last source edit.
