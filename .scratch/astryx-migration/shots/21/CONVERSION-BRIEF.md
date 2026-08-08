# Ticket 21 — Users/Credentials/ResourcePolicy antd→Astryx conversion brief

You are converting a subset of files for ticket 21 of a repo-wide antd→Astryx
migration (backend.ai-webui). Foundation tickets 01-16+18 are ALREADY MERGED
onto this branch — do not rebuild any of the infrastructure below, just USE it.

Read `.scratch/astryx-migration/issues/21-pages-users-policy.md`,
`.scratch/astryx-migration/issues/16-pages-data-vfolder.md` and
`.scratch/astryx-migration/issues/18-pages-deployments.md` "Implementation
notes" sections first — they show the exact idioms/precedent this ticket
follows. Also skim `/home/ubuntu/Workspace/.wayfinder/cn-oss-removal/MIGRATION-SPEC.md`
§0 (binding policy: Astryx direct, defaults-first, SIMPLICITY over antd parity
— when an antd feature has no Astryx equivalent, DROP it and record a
PILOT-DECISION comment in the code, do not rebuild it) and
`/home/ubuntu/Workspace/.wayfinder/cn-oss-removal/assets/antd-astryx-mapping/MAPPING.md`
(§3-4 rename tables) if you need a mapping not covered below. Verify any
Astryx component you're unsure of with `pnpm exec astryx component <Name>`
run from the `react/` directory — discover, don't guess.

## Ground rules

1. **Work only inside this git worktree** (already the cwd). Do not run `git
   stash`, do not push, do not touch other worktrees, do not run `gt`.
2. **Do not touch BAITable / `*Nodes` / `BAIAdminUserV2Table` / BAITable-backed
   list components' TABLE internals.** BAITable itself stays antd (ticket 25
   frontier). Column type imports (`ColumnsType`/`ColumnType` from
   `antd/es/table`, `AnyObject` from `antd/es/_util/type`) that exist only to
   type a `customizeColumns` callback are type-only frontier imports — leave
   them (§6 of MAPPING.md: type-only antd imports are converted in the final
   ticket, not per-page).
3. **Do not touch the Form STATE ENGINE.** `Form`, `Form.List`, `Form.useForm`,
   `Form.useWatch`, `FormInstance` from `antd` stay exactly as they are. Only
   the VISUAL layer changes: `Form.Item` → `BAIFormItem` (import from
   `../components/BAIFormItem`, default export), and the control INSIDE each
   `Form.Item`/`BAIFormItem` becomes an Astryx control via the adapters in
   `../components/astryx-bui/astryxFormControls.tsx`
   (`AstryxFormTextInput`/`AstryxFormTextArea`/`AstryxFormNumberInput`/
   `AstryxFormSelector`/`AstryxFormSwitch`/`AstryxFormCheckbox`). These
   adapters exist so a value-required, label-required, onChange(value) Astryx
   control can sit inside `Form.Item`'s clone-with-props contract — read the
   file's own header comment, it explains the 3 deltas. Import `Selector`
   directly (`@astryxdesign/core/Selector`) only for NON-form selects.
4. **Do NOT convert these frontier / cross-area components** — they stay
   exactly as-is (antd inside, if any), just re-verify your file still
   imports them correctly:
   - `KeypairResourcePolicySelect`, `UserResourcePolicySelect` (raw antd
     `Select` + `SelectProps` — ComplexSelector rebuild is tickets 26/27, not
     this ticket). If a file in your batch imports either of these, leave the
     import and JSX untouched.
   - `BAIGraphQLPropertyFilter`, `BAITable`, `BAIAdminUserV2Table`,
     `BAIRadioGroup`, `BAITabs`, `BAICard`/`BAIFlex`/`BAIButton`/`BAIText`/
     any other named import FROM the `backend.ai-ui` package barrel — these
     are BUI/frontier, owned by other tickets, leave them exactly as
     imported today.
   - `BAIUnmountAfterClose`, `AutoUpdateFetchKeyButton`, `BAIFetchKeyButton`,
     `BAISelectionLabel`, `BAINameActionCell` (plain, non-Astryx version from
     `backend.ai-ui`) — frontier, leave as-is UNLESS the file is one of the
     "pages" listed in your batch that already uses the Astryx equivalent by
     convention (check precedent files below).
5. **Tag/Badge conversions ONLY via the shared lookup module** —
   `packages/backend.ai-ui/src/helper/astryxTagVariant.ts`, imported from
   `backend.ai-ui` as `badgeVariantForStatus`, `badgeVariantForTagColor`,
   `PRIMARY_TAG_VARIANT`. Never invent a per-file color map. Import Astryx
   `Badge` from `@astryxdesign/core/Badge`. Per-file guidance (from the
   ticket-13 tag census, exact matches for this ticket's files):
   - `AdminUserCredentialList.tsx`: `<Tag color={token.colorPrimary}>admin</Tag>`
     → `<Badge variant={PRIMARY_TAG_VARIANT}>admin</Badge>`;
     `<Tag color="green">user</Tag>` → `<Badge variant="green">user</Badge>`.
   - `KeypairInfoModal.tsx` (×2 sites): same `token.colorPrimary` → main
     access-key marker → `PRIMARY_TAG_VARIANT`.
   - `BulkCreateUserFromCSVModal.tsx`: CSV row error tag uses antd preset
     `error` → `badgeVariantForTagColor('error')` (i.e. `variant="error"`).
   - Any other literal `color="green"/"blue"/"red"/...` on a `Tag` → use
     `badgeVariantForTagColor(color)`.
6. **Astryx primitives available** (import path in parens), use directly —
   these are already used across tickets 15/16/18:
   - `Text`, `Heading`, `Code` — `@astryxdesign/core/Text`
   - `Button`, `IconButton` — `@astryxdesign/core/Button`, `@astryxdesign/core/IconButton`
   - `Banner` (was `Alert`) — `@astryxdesign/core/Banner`
   - `EmptyState` (was `Empty`/`Result`) — `@astryxdesign/core/EmptyState`
   - `MetadataList`, `MetadataListItem` (was `Descriptions`) — `@astryxdesign/core/MetadataList`
   - `Tooltip` — `@astryxdesign/core/Tooltip` (`title`→`content`, `placement`
     splits into `placement`+`alignment`; never wrap a disabled control, use
     `disabledMessage` on controls that support it)
   - `HStack`, `VStack` — `@astryxdesign/core/Stack` (was `Space`)
   - `ButtonGroup` (was `Space.Compact`) — `@astryxdesign/core/ButtonGroup`
   - `Divider` — `@astryxdesign/core/Divider`
   - `DropdownMenu` (was `Dropdown` with `menu={{items}}`) — `@astryxdesign/core/DropdownMenu`
   - `Badge` — `@astryxdesign/core/Badge`
   - `Checkbox`/`CheckboxInput` outside a form — `@astryxdesign/core/CheckboxInput`
   - `Skeleton` — use the gap component `BAISkeletonAstryx` from
     `../components/astryx-bui/BAISkeletonAstryx` as the drop-in `<Skeleton
     active />` replacement (matches ticket 16/18 precedent for page-level
     loading fallback).
   - `Spin`/loading spinner (bare) → `Spinner` from `@astryxdesign/core/Spinner`.
   - `Popconfirm` → `BAIPopconfirmAstryx` from
     `../components/astryx-bui/BAIPopconfirmAstryx` (read the file — it wraps
     Astryx `Popover` with a confirm/cancel footer, matching antd
     `Popconfirm`'s `title`/`description`/`onConfirm`/`okButtonProps.danger`
     shape closely enough to be close to a rename).
   - Question-mark help icon + tooltip → `BAIQuestionIconWithTooltipAstryx`
     from `../components/astryx-bui/BAIQuestionIconWithTooltipAstryx`.
   - Typed-confirm destructive delete modal → `BAIDeleteConfirmModalAstryx`
     from `../components/astryx-bui/BAIDeleteConfirmModalAstryx` (see its
     header comment for the full prop contract: `items`, `description`,
     `confirmText`, `inputLabel`, `cannotBeUndoneText`, `onAction`,
     `actionLabel`). Per `.claude/rules/destructive-confirmation.md` this
     repo requires TYPED confirmation for permanent deletion — pass
     `requireConfirmInput` explicitly if you need it to gate even a
     single-item purge (default only forces typed input when >1 item).
   - Generic modal → `BAIModalAstryx` from `../components/astryx-bui/BAIModalAstryx`
     (see its header comment: `isOpen`/`onOpenChange` not `open`/`onCancel`,
     `actionLabel`/`onAction`/`actionVariant` not
     `okText`/`onOk`/`okButtonProps.danger`, `headerContent` for a JSX title).
   - `BAICard` from `backend.ai-ui` (the 3 page files: `AdminUsersPage.tsx`,
     `ProjectAdminUsersPage.tsx`, `ResourcePolicyPage.tsx`) is being handled
     by the orchestrator directly, NOT by you — if your batch happens to
     include one of these, skip it and say so in your report. Precedent
     (ticket 18 `AdminDeploymentPage.tsx`, verified/merged): a tabbed admin
     page KEEPS `BAICard`/`tabList`/`activeTabKey`/`onTabChange` from
     `backend.ai-ui` exactly as-is (it's frontier — BUI's own Card wrapper,
     not converted per-page-ticket) and only swaps `Skeleton` →
     `BAISkeletonAstryx`; `CardTabListType` from `antd/es/card` stays with a
     `// frontier type import (BAICard tabList shape, ticket 30)` comment.
     Do NOT invent a `BAICardAstryx` swap yourself for any file in your
     batch.
7. **`Typography.Text`** → `Text` (`@astryxdesign/core/Text`), `type="secondary"`
   → `color="secondary"`, `type="danger"`/`"warning"` → no Astryx TextColor
   equivalent (P5) — escalate to `Banner status="error"/"warning"` if it's a
   standalone warning line, or just accept `color="secondary"`/plain if it's
   a minor inline marker; record whichever you pick as a PILOT-DECISION
   comment. `strong` → `weight="semibold"`. `copyable` → `BAICopyableText`
   from `../components/astryx-bui/BAICopyableText` (already a KEPT pilot
   wrapper, do not rebuild).
8. **`Descriptions`** → `MetadataList` + `MetadataListItem`. Drop `bordered`,
   `size="small"`, per-item `span`, responsive `column` maps — MetadataList's
   defaults (MAPPING §4, defaults-first policy). This exact pattern was
   applied repeatedly in ticket 16 (`VFolderNodeDescriptionV2` /
   `SharedFolderPermissionInfoModal`) and ticket 18
   (`DeploymentRevisionDetail`) — same drop, same reasoning, do not
   re-litigate it, just apply it.
9. **`InputNumber`** (outside a `Form.Item`, i.e. standalone/controlled) →
   `NumberInput` from `@astryxdesign/core/NumberInput` directly (not the form
   adapter) — `suffix`→`units`, `formatter`/`parser`/`precision`/`stringMode`
   have no equivalent (P5, MAPPING §3.17) — if you hit one of those, drop it
   and record a PILOT-DECISION exactly like ticket 18 item 12
   (`InputNumber precision`: 0→`isIntegerOnly`, decimal precision dropped).
10. **`Button`** → `BAIButton` (from `backend.ai-ui`, already used
    everywhere in this repo pre-migration, KEEP using it — it is the
    project's async-action button wrapper, not something this migration
    touches) for buttons with `.action`/loading semantics, or plain Astryx
    `Button`/`IconButton` for simple ones. `type="primary"`→`variant="primary"`
    (BAIButton already antd-shaped `type` prop — check whether the specific
    call site already uses `BAIButton`; if it's a raw antd `<Button>` convert
    it to `BAIButton` matching the surrounding code's existing pattern, or to
    Astryx `IconButton` if it's icon-only with no `.action`/loading need).
    `Dropdown.Button`-shaped split button (primary action + `⋯` menu in
    `Space.Compact`) → `ButtonGroup` wrapping the primary `BAIButton` +
    `DropdownMenu` (`items: DropdownMenuOption[]`) — see MAPPING §5.3 recipe
    idea, or just inline it: `<ButtonGroup><BAIButton .../><DropdownMenu
    items={[...]}><IconButton icon={<Ellipsis/>} label="More"/></DropdownMenu></ButtonGroup>`.
11. Every Astryx control with a `label` prop needs a REAL accessible string
    (P2/P8) — never leave it empty. Icon-only buttons need a `label` (P8);
    steal the tooltip text or the nearest antd `title`/i18n key that already
    existed as `Tooltip title`.
12. **Do not add new i18n keys unless required** — reuse existing `t('...')`
    calls already in the file; only add new translation strings for genuinely
    new copy (e.g. an accessible `label` string where none existed — reuse
    the nearest existing string, do not invent new keys casually).
13. After editing each file, sanity check it compiles:
    `cd react && npx tsc --noEmit -p tsconfig.json 2>&1 | grep <filename>`
    (full project tsc is slow — grep to just your files; a clean full pass
    happens later via `scripts/verify.sh`). Also run
    `pnpm exec eslint <file>` from `react/` to catch import-order/unused
    issues (auto-fixable with `--fix`).
14. Leave a short **PILOT-DECISION** or **frontier** in-code comment (one or
    two lines, near the drop) whenever you drop an antd feature that has no
    Astryx equivalent, or whenever you deliberately leave a component
    unconverted because it's frontier/out-of-scope. Do not write a comment
    for a plain 1:1 rename.
15. Do NOT run `pnpm run build`, `pnpm run relay`, or `scripts/verify.sh` —
    the orchestrator runs those once across all batches at the end. Do not
    commit. Just edit files and leave them in the working tree.

## Precedent files to skim if unsure (already converted, same repo, merged)

- `react/src/components/AdminModelCard.tsx` (ticket 18) — Tag→Badge via
  lookup, Dropdown, Checkbox, Tooltip, mixed BUI+Astryx imports.
- `react/src/components/DeploymentRevisionDetail.tsx` (ticket 18) —
  Descriptions→MetadataList.
- `react/src/components/DeploymentSettingModal.tsx` (ticket 18) — Form engine
  kept + BAIFormItem + astryxFormControls, Select mode="tags"→Tokenizer.
- `react/src/pages/AdminVFolderNodeListPage.tsx` (ticket 16) — page-level
  `BAICardAstryx` usage (tabs/extra/title pattern), `AstryxAdminTheme` wrap.
- `react/src/components/DeleteForeverVFolderModalV2.tsx` (ticket 16) —
  `BAIDeleteConfirmModalAstryx` real usage.
- `react/src/components/astryx-bui/BAIPopconfirmAstryx.tsx`,
  `BAIQuestionIconWithTooltipAstryx.tsx` — read directly, small files.

Report back: for each file you touched, one line — file path, what changed,
any PILOT-DECISION taken. Also list any file you decided NOT to touch and why
(e.g. discovered it's actually frontier).
