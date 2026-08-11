# p3-c — flip select consumers to the Astryx select stack, retire legacy wrappers

**Target:** to-astryx (phase 3, wave 1, agent C)
**Blocked by:** 26 (`BAIComplexSelect` core), 27 (18 `*SelectAstryx` siblings)
**Status:** done

Ticket 26 built the core, ticket 27 built the siblings but deliberately left
every app call site on the antd wrappers (frontier rule). This ticket moves the
frontier: it flips the call sites and deletes the legacy wrappers behind them.

---

## FLIP RECIPE (binding for every call site)

The `*SelectAstryx` outer contract is the antd wrapper's contract **except**
for the props `BAIComplexSelect` does not have. Mechanically:

| antd wrapper prop | Astryx sibling | Action |
|---|---|---|
| — | `label: string` **(required)** | **ADD.** Astryx fields require an accessible name. Reuse the surrounding `Form.Item` / `BAICard` / column label's i18n key. |
| — | `isLabelHidden` | **ADD** whenever something else already prints that label (`Form.Item label=`, a card title, a filter row). Omit only when the select should render its own visible label. |
| `mode="multiple"` | `multiple` | rename |
| `mode="tags"` | — | not applicable to any flipped site (§2.D) |
| `disabled` | `isDisabled` | rename |
| `loading` | `isLoading` | rename |
| `showSearch` | `hasSearch` | default is `true` — just drop it |
| `filterOption={false}` | — | drop (server search is the only search) |
| `status="error"` | `status={{ type: 'error' }}` | reshape |
| `style={{ width: N }}` | `width={N}` | `width` is `number \| string` |
| `style={{ minWidth: N }}` | `width={N}` | fixed budget replaces the min (frame-first) |
| `style={{ flex: 1 }}` | — | drop; `width` already defaults to `'100%'`, which fills the flex track |
| `allowClear` | — | **DROP** (P26-8). Clearing is the form's own reset. |
| `open` / `onOpenChange` (driving) | `onOpenChange` (observing) | drop any code that *opens* the popup |
| `ref.focus()` | — | **DROP** (P26-8). The `refetch` ref survives. |
| `optionRender` / `labelRender` / `tagRender` | `description` / `extra` on the option | already handled inside the sibling (P26-3) |
| `notFoundContent` | — | drop (P26-7) |
| `maxTagCount` | `maxTriggerTokens` | rename (or drop for the default 3) |
| `onChange(value, option)` | `onChange(value)` | drop the 2nd arg — **except** `BAIUserSelectAstryx` / `BAIAdminProjectSelectAstryx`, see P3C-1 |
| `*SelectRef` type | `*SelectAstryxRef` | rename the `useRef` type argument |

Everything else (`value`, `onChange` first arg, `placeholder`, `filter`,
`valuePropName`, `currentProjectId`, `excludeDeleted`, `requiredPermission`,
`onResolvedNamesChange`, `queryRef`, `runtimeVariantId`, …) is unchanged.

**Never** drop pagination, and **never** delete a selected-value resolution
query — the Astryx trigger reads its text from the value.

---

## PILOT-DECISIONs

| # | Decision |
|---|---|
| **P3C-1** | The second `option` argument of `onChange` is restored on the two siblings that render inside `BAIGraphQLPropertyFilter` / `BAIPropertyFilter` `renderInput` — `BAIUserSelectAstryx` and `BAIAdminProjectSelectAstryx`. Ticket 27 dropped it everywhere as unused, but those two call sites genuinely need it: `onAddCondition(value, label)` puts a human-readable email / project name on the filter chip while the raw UUID goes into the GraphQL filter, and the label is not derivable at the call site. The argument carries the `labelInValue` pair the wrapper already holds, so nothing is rebuilt. `BAIStorageHostSelectAstryx` also renders in a `renderInput` but does **not** need it — a storage host's value *is* its display name. Every other sibling keeps the single-argument contract. |
| **P3C-2** | Call sites that sized a select with `style={{ minWidth: N }}` become `width={N}`. Astryx fields have no `style`/`className` escape hatch (`ComplexSelector` exposes `width` + `contentXstyle` only), and a fixed budget is the frame-first rule the rest of this migration follows. `style={{ flex: 1 }}` sites simply drop the prop — `width` already defaults to `'100%'`. |
| **P3C-3** | `VFolderMountFormItem` no longer rebuilds its id→name map from the dropped `onChange` `option` argument. `BAIVFolderSelectAstryx.onResolvedNamesChange` already emits exactly that map from the value-resolution query, for newly selected keys as well as pre-existing ones, so the default mount path is now written from that one source instead of two racing ones. |
| **P3C-4** | `RoleFormModal.ScopeIdSelect` stops being typed on antd `SelectProps`. It is a scope-type-keyed router over ten different selects; typing it on `SelectProps` forced every branch to accept antd props it no longer has. It now declares the narrow contract its two call sites actually use (`value` / `onChange` / `placeholder` / `label` / `isDisabled` / `scopeType`) and passes `label` + `isLabelHidden` down to each branch. |
| **P3C-6** | **Bug found and fixed while flipping** (not a policy choice, recorded so it is not re-introduced): `BAIAdminResourceGroupSelectAstryx` — the only class-C (`usePaginationFragment`) sibling — declared its `queryRef` as the **legacy** `BAIAdminResourceGroupSelect_resourceGroupsFragment$key` while its own `graphql` tag defines `BAIAdminResourceGroupSelectAstryx_resourceGroupsFragment`. The two are structurally identical, so tsc happily accepted a consumer that spread the legacy fragment into the Astryx component — which would then find no data at runtime. Both consumers (`RoleFormModal`, `AgentSettingModal`) now spread the Astryx fragment. A cursor-paginated sibling is the one place where the fragment name is part of the call site's contract, so this class of mistake cannot be caught by the flip recipe alone. |
| **P3C-5** | Legacy wrappers whose only remaining consumers were their own `*.stories.tsx` are retired together with those stories. Rewriting a Storybook file against the Astryx sibling is a ticket-32 concern, and keeping a dead antd wrapper alive purely so a story can render it defeats the retirement. `BAIUserSelectAstryx.stories.tsx` (ticket 26) is the pattern for the replacement stories. |
| **P3C-7** | The `mode="tags"` bridge is hoisted out of the five files that each grew a private copy of it (`AdminDeploymentPresetModelConfigItem`, `DeploymentSettingModal`, `UserSettingModal`, `AdminModelCardSettingModal`, `AgentEditorModal`) and becomes `AstryxFormTagsInput` in `components/astryxFormControls.tsx`, re-exported from `components/astryx-bui/astryxFormControls.tsx` like its eight siblings. Same shape as the reference `TagsField`: `Tokenizer` + `isLabelHidden` + `hasCreate` over a module-level empty search source, mapping the form field's `string[]` to/from `{id,label}[]` and de-duplicating on the way out (antd tags mode did). The five private copies are left in place for their own tickets — this row only records where the canonical one now lives. |
| **P3C-8** | `tokenSeparators` is dropped at every converted `mode="tags"` call site. Splitting one pasted `"80, 443"` into two chips has no `Tokenizer` equivalent; tags commit one at a time with Enter. Affected: `UpdateUsersModal` / `UserSettingModal` `container_gids` (`[',', ' ']`), `PrometheusQueryPresetEditorModal` filter+group labels (`[',']`), `UserProfileSettingModal` `allowed_client_ip` (`[',', ' ']`), `AppLauncherModal` `clientIps` (`[',', ' ']`), `PortSelectFormItem` `ports` (`[',', ' ']`). The companion props that only existed to suppress antd's dropdown — `open={false}`, `suffixIcon={null}`, `notFoundContent={null}` — map to nothing: the empty search source yields no dropdown at all. `allowClear` → `hasClear`, `maxTagCount` → dropped (Tokenizer owns chip overflow via `tokenOverflowBehavior`), `style={{ width: '100%' }}` → dropped (the adapter's `width` default). |
| **P3C-9** | `PortSelectFormItem` loses its red-chip rendering: the `tagRender` that painted an individual port chip red when the string was malformed, out of range, or duplicated, along with the `PortTag` usage inside this component and the `Form.useFormInstance()` call that fed the duplicate check. Astryx explicitly advises against per-token colors inside a `Tokenizer`, and all four conditions are already reported as field-level error messages by the four `Form.Item` `rules`, which are kept verbatim — so the chip color was a second, weaker channel for information the form already surfaces. `PortTag` stays **exported** (`SessionLauncherPreview` renders it) and so do `isValidPortStr` / `isPortRangeStr` / `parsePortRangeToNumbers` / `transformPortValuesToNumbers`. Same call made for `UserProfileSettingModal.allowed_client_ip`, whose `tagRender` reddened invalid IPs that the field's `isValidIPOrCidr` validator already names in its error message — matching what `UserSettingModal` had already decided for its own copy of that field. |

---

## Flip census — all 19 legacy wrappers flipped and retired

Every legacy antd wrapper that ticket 27 built an Astryx sibling for now has
**zero** consumers, and the wrapper file, its stories and its barrel exports are
deleted. `git grep` for each legacy name returns only i18n keys, prose comments
and e2e comments.

| # | Retired wrapper | Astryx sibling now used | Flipped call sites |
|---|---|---|---|
| 1 | `BAIUserSelect` | `BAIUserSelectAstryx` | `RoleFormModal` (`ScopeIdSelect`), `StorageHostSettingsPanel`, `UserFolderPermissionPanelV2`, `ProjectAdminSettingModal`, `RBACManagementPage`, `KeypairSettingModal` |
| 2 | `BAIAdminContainerRegistrySelect` | `…SelectAstryx` | `RoleFormModal` |
| 3 | `BAIAdminImageSelect` (+ stories) | `…SelectAstryx` | `AdminDeploymentPresetSettingPageContent` |
| 4 | `BAIAdminKeypairResourcePolicySelect` | `…SelectAstryx` | `UserFolderPermissionPanel` |
| 5 | `BAIAdminModelServiceSelect` | `…SelectAstryx` | `RoleFormModal` |
| 6 | `BAIAdminProjectSelect` | `…SelectAstryx` | `RoleFormModal`, `StorageHostSettingsPanel`, `AdminComputeSessionListPage` |
| 7 | `BAIAdminResourceGroupSelect` (+ stories) | `…SelectAstryx` | `RoleFormModal`, `AgentSettingModal` — **both `graphql` tags repointed** (P3C-6) |
| 8 | `BAIAdminSessionSelect` | `…SelectAstryx` | `RoleFormModal` |
| 9 | `BAIAvailablePresetSelect` | `…SelectAstryx` | `DeploymentAddRevisionModal`, `ModelCardDeployModal`, `VFolderDeployModal` |
| 10 | `BAIBucketSelect` (+ stories) | `…SelectAstryx` | none (stories only — P3C-5) |
| 11 | `BAIDeploymentSelect` (BUI) | `…SelectAstryx` | none |
| 12 | `BAIKeypairSelect` | `…SelectAstryx` | `RoleFormModal` |
| 13 | `BAIObjectStorageSelect` (+ stories) | `…SelectAstryx` | none (stories only — P3C-5) |
| 14 | `BAIProjectSelect` (BUI) | `…SelectAstryx` | none |
| 15 | `BAIProjectVfolderSelect` | `…SelectAstryx` | none |
| 16 | `BAIRuntimeVariantSelect` | `…SelectAstryx` | `DeploymentAddRevisionModal`, `BAIRuntimeVariantPresetSettingModal` (BUI-internal) |
| 17 | `BAIStorageHostSelect` | `…SelectAstryx` | `RoleFormModal`, `AdminModelCard`, `ModelStoreListPageV2` |
| 18 | `BAIVFolderSelect` (+ stories) | `…SelectAstryx` | `RoleFormModal`, `VFolderMountFormItem`, `ImportArtifactRevisionToFolderModal`, `ImportHuggingFaceModelForm`, `AdminModelCardSettingModal`, `DeploymentAddRevisionModal` ×2, `BAIVFolderMountConfigInput` (BUI-internal), `BAIVFolderPathPicker.stories` |
| 19 | `DeploymentSelect` (`react/src/components/Chat/`) | `DeploymentSelectAstryx` | `ChatHeader` |

Barrel effect: 36 export statements removed from
`packages/backend.ai-ui/src/components/fragments/index.ts`. Because the legacy
names are free again, the four node types ticket 27 had to alias
(`VFolderNode`, `ProjectVfolderNode`, `RuntimeVariantNode`, `StorageHostNode`)
are **de-aliased** back to their canonical names, and `BAIVFolderPermission` now
exports from the Astryx module. `pnpm relay` pruned 36 orphaned
`__generated__` artifacts.

### Survivors — still on antd, with the reason

The 17 survivors ticket 27 listed are **unchanged** and remain survivors: they
are single-shot / non-paginated, so MAPPING §3.1 keeps them off
`BAIComplexSelect`, and their §2.E conversion to `AstryxFormSelector` is a
separate, cascading job (each one's own prop contract gains a required `label`,
which moves its consumers). Two things did move in that space:

- `RoleFormModal`'s `DOMAIN` branch and its no-scope-type fallback, which were
  static-option `BAISelect`s inside the router being rewritten anyway, are now
  `AstryxFormSelector` (proven live, below).
- the seven remaining `mode="tags"` call sites are on `Tokenizer` via the new
  shared `AstryxFormTagsInput` (P3C-7…P3C-9).

Explicitly **not** done, and left for a follow-up (see REMAINDER):
`AccessKeySelect`, `KeypairResourcePolicySelect`, `PrometheusCategorySelect`,
`ResourcePresetSelect`, `StorageSelect`, `UserResourcePolicySelect`,
`UserSelect`, `ProjectSelect`, `AgentSelect`, `Chat/ModelSelect`,
`BAIDomainSelect`, `BAIResourceGroupSelect`, `BAIProjectResourcePolicySelect`,
`BAIStorageProxySelect`, `BAIAllowedHostNamesSelect`,
`BAIProjectResourceGroupSelect`, and the dead
`react/src/components/VFolderSelect.tsx` (unrendered; only its `VFolder` **type**
is still imported by `VFolderTable` / `VFolderTableFormItem`, so deleting it
means moving that type first). `StorageSelect` and `ResourcePresetSelect` are
*not* mechanical — they render ReactNode option labels (usage badge +
`TextHighlighter`, resource figures) and do client-side `filterOption`, so they
are `BAIComplexSelect` conversions with real P26-3 drops, not import swaps.

---

## Live proof

Dev server on `:5830` against the shared cluster, driven by
`.scratch/astryx-migration/p3c-select-shots.mjs` (light) and
`p3c-dark-shots.mjs` (dark). Measurements in `shots/p3-c/measure-p3c*.json`.

```
A_BAIUserSelectAstryx_roleScope   initialRows 10
                                  rowsAfterScroll [11, 11]   <- endReached -> loadNext
                                  rowsAfterSearch 2          <- server search "admin"
                                  picked "aaa1@lablup.com"
                                  triggerText "aaa1@lablup.com"   <- label read from VALUE
B_BAIAdminProjectSelectAstryx     initialRows 8, picked/triggerText "a한국어가능_cde"
                                  (id-valued: value is the UUID, label the name)
C_AstryxFormSelector (DOMAIN)     initialRows 2, picked/triggerText "default"
dark pass (themeAfterToggle "dark")
                                  initialRows 10, rowsAfterScroll [11,11],
                                  triggerText "aaa1@lablup.com"
pageErrors []   (every route, both themes)
```

Screenshots: `shots/p3-c/0{1..7}-*.png` (RBAC page, popup open showing the
search box + email label + full-name `description` + "Total 11 items" footer,
and the committed trigger) in light and dark, plus `20/21/24-*.png` for the
storage-host drawer in both themes.

**Surfaces that could not be reached on this cluster** (not failures of the
flip — the UI does not render them there): the RBAC scope-type list is
intersected with the server's permission matrix and offered only
Domain / Project / User, so the six other `ScopeIdSelect` branches never
mount; `StorageHostSettingsPanel` is behind a quota-capable backend and the
only volume is `vfs` ("This storage backend does not support quota");
`AgentSettingModal` has no row action on the agent table; and the storage
drawer renders `UserFolderPermissionPanelV2`, not the `V1` panel that holds the
multiple-mode policy select. Those seven wrappers are covered by tsc + the
ticket-27 harness only.

### Pre-existing console warnings observed (NOT from this change)

- `/admin/agent`: `Invalid prop 'ref' supplied to React.Fragment` ×2. The only
  file this change touches on that route is `AgentSettingModal`, which is not
  mounted until its modal opens.
- `BAIProjectSettingModal` (BUI, untouched here): missing `key` in a list, and
  `[antd: Form.Item] a Form.Item with a name prop must have a single child`.
- `RelayResponseNormalizer` `Group` / `UserGroup` `__typename` conflicts — a
  backend globally-unique-id violation, present before this change.

## Gate deltas

| Gate | Before | After |
|---|---|---|
| `antd-import-graph.mjs` files | 987 | 968 (−19 wrapper files) |
| direct antd | 300 | 281 (−19) |
| transitively antd-reachable | 429 | 429 |
| antd-free | 258 (26.1%) | 258 (26.7%) |

Reachability does not move because `BAISelect.tsx` — still a top-15 taint hub —
stays alive for the survivors and the property filters. Retiring the 19
wrappers is what makes *its* eventual removal a bounded job.

### `BAISelect.css` handoff from sibling A

A reported that the `.ant-badge` / `span.ant-tag` / `.ant-typography-*`
descendants inside `.bai-select` become `.astryx-badge` / `.astryx-text` once
`BAIText` / `BAITag` / `BAIBadge` are rewritten. `BAISelect` is **not** retired
here, so the rules are not dropped — the Astryx counterparts are added
**alongside** the antd ones so the block is correct on both sides of A's merge
and neither branch has to edit the other's lines. Astryx `Text` carries its
tone as a prop rather than four classes, so one `.astryx-text` selector
replaces the four `.ant-typography-*` ones.
