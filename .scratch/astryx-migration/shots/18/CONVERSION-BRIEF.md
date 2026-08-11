# Ticket 18 — Deployments area antd→Astryx conversion brief (shared)

You are converting assigned files under
`/home/ubuntu/Workspace/backend.ai-webui/.claude/worktrees/agent-a5ea53b6516db1871`
(work ONLY in this worktree, ONLY on your assigned files). Goal per file:
**zero antd imports except the Form family** (`Form`, `Form.List`,
`Form.useForm`, `Form.useWatch`, `type FormInstance`, `type FormItemProps`,
`type FormListProps` — the antd form STATE engine stays per MIGRATION-SPEC).
Everything else that renders converts to Astryx (`@astryxdesign/core/*`,
`@astryxdesign/lab`) or the local gap components.

NEVER run: git commands, pnpm install, verify.sh, dev servers. You may run
`pnpm exec tsc --noEmit` inside `react/` ONCE at the end (it is slow), and
`cd react && pnpm exec astryx component <Name>` anytime to check props
(discover, don't guess).

## Core rules (from MIGRATION-SPEC §0 + SKILL.md)

- **Defaults-first / simplicity**: use Astryx default sizes/colors. Do NOT
  chase antd pixel/feature parity. When an antd prop has no Astryx
  destination, DROP it and leave a `// PILOT-DECISION:` comment explaining
  what was dropped and why. Do not build parity shims.
- **Original layout fidelity**: reproduce the page's layout tree; don't
  "improve" layouts while porting.
- **Frontier**: BUI components (`backend.ai-ui` imports: BAICard, BAIModal,
  BAITable, BAIFlex, BAIText, BAIButton, BAIFetchKeyButton, BAI*Select,
  BAIDeleteConfirmModal, BAITag, BAIId, …) STAY AS-IS. Do not convert BUI
  internals; do not remove BUI imports. BAITable internals are ticket 25;
  Relay/infinite-scroll selects are tickets 26/27.
- Component public props that other (unconverted) files consume must keep
  their existing shape (translate internally).
- Imports: every Astryx component has its own subpath
  (`import {Button} from '@astryxdesign/core/Button';` — no barrel).
  Lab: `import {Drawer, Tour, TourStep, Stepper, Step} from '@astryxdesign/lab';`
- Keep `'use memo'` directives. Keep `theme` / `useToken` from
  `../theme-shim` (shim, allowed). Keep `App` from `../app-shim` (allowed).
  `antd-style` `createStyles` must GO in converted files — replace with a
  co-located plain CSS file imported by the component (P17), or inline
  styles; delete rules that target `.ant-*` (they die with the conversion).

## Rename tables (verified against installed 0.3.0 d.ts)

- `Typography.Text` → `Text` (`@astryxdesign/core/Text`).
  `type="secondary"`→`color="secondary"`; `strong`→`weight="semibold"`;
  `code`→`Code` (own subpath); `ellipsis={{rows,tooltip}}`→`maxLines` +
  `hasTruncateTooltip`; `copyable` → `BAICopyableText` from
  `../components/astryx-bui/BAICopyableText` (props extend Astryx TextProps;
  `copyText` prop for custom copy payload — read the file first);
  `type="danger"/"warning"` → no TextColor equivalent: use the nearest
  sensible expression (usually plain Text + PILOT-DECISION, or Banner if it
  is really an alert). `style={{color: token.colorTextSecondary}}` →
  `color="secondary"`.
- `Typography.Title` → `Heading` (`level={1..6}`) — Astryx ramp differs;
  keep the semantic level, accept the Astryx size (defaults-first).
- `Typography.Paragraph` → `<Text as="p" display="block">`.
- `Button` → 4-way (MAPPING §3.3):
  - icon + no children → `IconButton` (`icon`, REQUIRED `label` string —
    write a real accessible name; reuse existing i18n keys like
    `t('button.Delete')`; do NOT invent new i18n keys).
  - `type="link"`/`href` → `Link` (`@astryxdesign/core/Link`) or
    `Button variant="ghost"` when it's really a button affordance.
  - `type="primary"` → `Button variant="primary"`; `danger` →
    `variant="destructive"`; default/`text` with children →
    `variant="secondary"`/`"ghost"`.
  - Renames: children→`label` (string), `loading`→`isLoading`,
    `disabled`→`isDisabled`, `block`→`width="100%"`,
    size `small|middle|large`→`sm|md|lg`, async onClick → `clickAction`.
- `Tooltip` → `Tooltip` (`@astryxdesign/core/Tooltip`): `title`→`content`,
  placement `top|bottom|left|right`→`above|below|start|end`; compound
  (`topLeft` etc.) splits into `placement` + `alignment`. Astryx forbids
  wrapping a DISABLED control — use the control's `disabledMessage` when it
  exists (`Button`, `TextInput` have it; `IconButton` does NOT → drop +
  PILOT-DECISION, P18).
- `Alert` → `Banner`: `type`→`status`, `message`→`title`, `description` ok,
  `showIcon` → DROP (default), `closable`→`isDismissable`+`onDismiss`,
  `action`→`endContent`, `banner`→`container="section"`.
- `Skeleton` → `BAISkeletonAstryx` from `../components/astryx-bui/BAISkeletonAstryx`
  (or `./astryx-bui/…` relative): `<Skeleton active/>` → `<BAISkeletonAstryx/>`;
  `paragraph={{rows:n}}` → `rows={n}`; `Skeleton.Input active` →
  `variant="input"`; `<Skeleton active paragraph={false}/>` → `hasTitle`/`variant`
  per the file header docs (read the gap component first).
- `Empty` → `EmptyState` (`title` REQUIRED string; `description` optional;
  `image`→`icon`). `Result` → `EmptyState` (`subTitle`→`description`,
  `extra`→`actions`).
- `Descriptions` → `MetadataList` + `MetadataListItem`
  (`@astryxdesign/core/MetadataList`):
  - `items=[{key,label,children}]` → `<MetadataListItem label={string}>{value}</MetadataListItem>` children.
  - `column={n or responsive map}` → `columns={n}` (pick the wide-case n;
    the responsive map dies — container reflow handles narrow; PILOT-DECISION).
  - `bordered` (×many) → DROP + PILOT-DECISION (no bordered mode; Astryx
    default flat list is the design).
  - `size="small"`, `Descriptions.Item span`, `labelStyle` → `label={{position,width}}`
    where possible, otherwise DROP + PILOT-DECISION.
  - `label` must be a plain STRING.
- `Space` → `HStack`/`VStack` (`@astryxdesign/core/Stack`); gap steps are
  4px multiples: antd small=8→`gap={2}`, middle=16→`gap={4}`, large=24→`gap={6}`.
  `Space.Compact` around buttons → `ButtonGroup` (`@astryxdesign/core/ButtonGroup`).
- `Divider` → `Divider` (`@astryxdesign/core/Divider`):
  `type="vertical"`→`orientation="vertical"`; label children→`label`.
- `Dropdown menu={{items}}` → `DropdownMenu` (`@astryxdesign/core/DropdownMenu`):
  `items: [{label, onClick, isDisabled, icon}]`, `{type:'divider'}` ok.
  Trigger button becomes the `button` prop
  (`button={{label: t('button.More'), hasChevron: false, ...}}`) or the
  compound children form — check `pnpm exec astryx component DropdownMenu`.
  antd `danger: true` menu items → DROP the red tint + PILOT-DECISION.
- `Popconfirm` → `BAIPopconfirmAstryx` from `../components/astryx-bui/BAIPopconfirmAstryx`
  (props: title, description, okText, cancelText, isDanger, onConfirm …).
- `Tag` → `Badge` (`@astryxdesign/core/Badge`), color via the repo-global
  lookup ONLY: `badgeVariantForTagColor` / `badgeVariantForStatus(domain, v)`
  from `backend.ai-ui` (exported from
  `packages/backend.ai-ui/src/helper/astryxTagVariant.ts`; check the export
  exists in `packages/backend.ai-ui/src/index.ts` — if not, import via the
  package path used elsewhere on the branch). Domains: 'deployment',
  'route', 'replica', 'validation', …
- `Segmented` → `SegmentedControl` + `SegmentedControlItem`
  (`options` become children; item `label` REQUIRED string).
- `Collapse` → `Collapsible` (`@astryxdesign/core/Collapsible`):
  header→`trigger`, `defaultActiveKey`→`defaultIsOpen`.
- `Switch` (in forms) → `AstryxFormSwitch` adapter; standalone →
  `Switch` (`@astryxdesign/core/Switch`, `checked`→`value` REQUIRED bool,
  `onChange(checked, e)`).
- `Checkbox` → `AstryxFormCheckbox` adapter in forms
  (valuePropName="checked" keeps working); standalone → `CheckboxInput`
  (`checked`→`value`, `onChange(checked, e)` — VALUE first, not event;
  `CheckboxChangeEvent` type disappears).
- `Grid.useBreakpoint()` → `useBAIBreakpoint()` from `../theme-shim`
  (recipe R3 — pure swap, same `{xs..xxl}` boolean shape).
- `Drawer` → lab `Drawer` (`import {Drawer} from '@astryxdesign/lab'`):
  props `isOpen`, `onClose`, `side` ('start'|'end'|'top'|'bottom'),
  `size` (number|string), REQUIRED `label` string, `hasScrim`,
  `hasCloseButton`, children. No `title` node — render a Heading inside if
  needed. antd `open`→`isOpen`, `onClose`→`onClose`, `size="large"`→
  `size={736}` (antd large width) or default; `title`→`label` + visible
  heading.
- `Steps` → lab `Stepper`/`Step`; `Tour` → lab `Tour`/`TourStep`
  (read the d.ts under
  `react/node_modules/@astryxdesign/lab/dist/{Stepper,Tour}/*.d.ts` — the
  APIs differ substantially from antd; simplify per the simplicity policy
  and record PILOT-DECISIONs).
- `DatePicker showTime` → `DateTimeInput` (`@astryxdesign/core/DateTimeInput`).
  ⚠ values are ISO strings, not dayjs — adapt at the boundary
  (`dayjs(iso)` / `.toISOString()`); check the d.ts for exact props.

## Forms (the engine stays)

- `Form`, `Form.useForm`, `FormInstance`, `rules`, `Form.List` — UNCHANGED.
- Replace `<Form.Item>` with `<BAIFormItem>` from
  `react/src/components/BAIFormItem` — public props are antd-shaped
  (`label`, `name`, `rules`, `tooltip`, `extra`, `help`, `required`,
  `noStyle`, `dependencies`, …), so this is usually a tag+import rename.
  `Form.Item noStyle` → `BAIFormItem noStyle`.
- Replace antd form CONTROLS inside forms with the adapters from
  `react/src/components/astryx-bui/astryxFormControls.tsx`:
  `AstryxFormTextInput`, `AstryxFormTextArea`, `AstryxFormNumberInput`,
  `AstryxFormSelector` (static options only), `AstryxFormSwitch`,
  `AstryxFormCheckbox`. Every adapter needs a `label` string (the
  accessible name — same string as the BAIFormItem label). Do NOT edit the
  adapters file (other agents share it); if an adapter can't express a call
  site, use the raw Astryx control inline with `value={v ?? ''}` +
  `isLabelHidden` + a `label`, or keep antd ONLY if it is Form family.
- `InputNumber suffix="GiB"` → adapter `units="GiB"`. `style={{width:'100%'}}`
  → default (adapters default `width="100%"`).
- BUI select components (`BAI*Select`) inside forms: keep as-is (frontier).
- antd `Select` with static `options` in a form → `AstryxFormSelector`.
  With Relay data / pagination → keep IF it's a BUI wrapper; if it is a raw
  antd `Select` over dynamic options, use the raw Astryx `Selector`
  (`@astryxdesign/core/Selector`) when options are a simple array; if that
  turns complex (grouping, custom popup, infinite scroll), leave the antd
  import, add `// TODO(ticket-26): ComplexSelector` + PILOT-DECISION, and
  report it (last resort).

## Checks before you finish (your slice only)

1. `grep -n "from 'antd'" <your files>` → only Form-family symbols remain
   (or type-only frontier imports that other unconverted consumers force).
2. No `createStyles` / `.ant-*` selectors left in converted files (P6).
3. Icon-only controls all have real `label` strings (P8).
4. `'use memo'` still present; no new `console.log`.
5. Run `cd react && pnpm exec tsc --noEmit 2>&1 | grep -E "your-files"` once;
   fix your errors (ignore errors in files you don't own).
6. Report per file: what was dropped (PILOT-DECISION list), anything left
   antd and why.
