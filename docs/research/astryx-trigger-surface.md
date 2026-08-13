# Research: Astryx select-family trigger surface — what ComplexSelector officially supports

Resolves the research question of [#8762](https://github.com/lablup/backend.ai-webui/issues/8762)
(part of #8761, feeds the API-design decision ticket #8764).

**Primary sources only.** All citations are to:

- the installed package `@astryxdesign/core` **0.3.0**
  (`react/node_modules/@astryxdesign/core`; `package.json` `"version": "0.3.0"`) —
  cited below as `core/dist/...`,
- the installed CLI `@astryxdesign/cli` (`react/node_modules/@astryxdesign/cli`) and its
  runtime output (`pnpm exec astryx component/template/swizzle/docs`, run from `react/`),
- this repo's wrappers `packages/backend.ai-ui/src/components/BAIComplexSelect.tsx` and
  `BAISelect.tsx`.

`core/dist` JS is the compiled source with readable structure and inlined StyleX class
strings; where a claim depends on what a class *means*, the atomic class is decoded
against `core/dist/astryx.css` and the decoded declaration is quoted.

---

## 1. ComplexSelector's exact contract

Type surface: `core/dist/ComplexSelector/ComplexSelector.d.ts`; implementation:
`core/dist/ComplexSelector/ComplexSelector.js` (315 lines total).

### 1.1 Props (d.ts:33–76)

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` **required** | "Label text for accessibility and the field label" (d.ts:34–35) |
| `value` / `onChange` | `Value` / `(value: Value) => void` | fully controlled, generic (d.ts:36–39) |
| `changeAction` | `(value: Value) => void \| Promise<void>` | "Optional async action after onChange; drives optimistic UI" (d.ts:40–41) |
| `children` | `(value, onChange, close, state) => ReactNode` **required** | the popup body render prop (d.ts:42–43) |
| `triggerLabel` | `ReactNode` | "Label/content shown in the closed trigger" (d.ts:44–45) |
| `placeholder` | `ReactNode` | shown when `triggerLabel` is omitted (d.ts:46–47); defaults to `t('@astryx.selector.placeholder')` = `'Select...'` (js:190; CLI `astryx component ComplexSelector` props table) |
| `size` | `'sm' \| 'md' \| 'lg'` default `'md'` | (d.ts:18, 66–67; js:179) |
| `width` | `SizeValue` | sizes the whole Field (d.ts:68–69; passed to `Field` js:312) |
| `placement` | `'above' \| 'below' \| 'start' \| 'end'` default `'below'` | (d.ts:70–71; js:181) |
| `contentXstyle` | `StyleXStyles` | styles the popup content container (d.ts:72–73; merged js:220) |
| plus the Field set | `isLabelHidden`, `description`, `isOptional`, `isRequired`, `isDisabled`, `isLoading`, `status`, `statusVariant`, `labelTooltip`, `data-testid` | (d.ts:48–75) |

`ComplexSelectorRenderState` = `{ isOpen, isBusy, triggerId, contentId }` (d.ts:19–28).

### 1.2 `changeAction` / busy flow (js:197–216, 269)

- `commitValue` (the `onChange` handed to the render prop) calls the consumer `onChange`
  synchronously, then — iff `changeAction` is set — runs
  `startTransition(async () => { setOptimisticValue(next); await changeAction(next); })`
  via `useTransition` + `useOptimistic` (js:197–216).
- `isBusy = isLoading || isPending` (js:199). While busy: a `<Spinner size="sm">` is
  rendered as a sibling of the trigger button inside the trigger container (js:269–270)
  and `aria-busy` is set on the button (js:252).
- The render prop receives the **optimistic** value, not the committed prop value (js:221).

### 1.3 Popup ownership — the render prop owns the body

- The popup body is exactly `children(optimisticValue, commitValue, popover.hide, state)`
  wrapped in one `<div id={contentId}>` carrying `styles.content` + `contentXstyle`
  (js:218–227). Nothing else is injected — no search box, no list, no close button
  (`hasCloseButton: false`, js:202–203).
- Upstream intent (CLI `astryx component ComplexSelector`, description + Best Practices):
  "It is intentionally one component: ComplexSelector owns the field, trigger, popover,
  focus restore, and changeAction flow, while the content render prop owns the
  selector-specific accessible structure. … **Don't** rebuild trigger ARIA, popover focus
  management, or changeAction handling in product code."

### 1.4 Trigger DOM — verified: the trigger is a `<button>` inside a clickable `<div>`

- Outer trigger container: a `<div>` holding `popover.triggerRef`, `data-testid`, the
  spread `...props`, and the **`onClick` that toggles the popover** (js:229–241).
- Inside it, a `<button id={triggerId} type="button">` with `aria-haspopup="dialog"`,
  `aria-expanded`, `aria-controls={contentId}`, `aria-describedby`,
  `aria-labelledby={labelId}`, `aria-required`, `aria-invalid`, `aria-busy`, `disabled`
  (js:242–253). The button itself has **no** onClick — activation (mouse click, or
  native Enter/Space synthetic click) bubbles to the container div's toggle handler
  (js:233–237).
- `triggerContent = triggerLabel ?? placeholder` (js:217) renders inside a single
  `<span>` inside that button (js:263–268).
- Fixed siblings of the button inside the container: the busy `Spinner` (js:269–270) and
  the chevron `Icon icon="chevronDown"` wrapper that rotates when open (js:271–288).

### 1.5 Focus restore, focus trap, keyboard

- `usePopover({ dialogLabel: label, hasCloseButton: false, hasAutoFocus: true, onHide })`
  (js:200–207). On close, `onHide` runs
  `document.getElementById(triggerId)?.focus()` — focus returns to the trigger button
  (js:204–206).
- The popup is a **modal dialog popover**: content wrapper gets `role="dialog"`,
  `aria-modal`, `aria-label={dialogLabel}` (`core/dist/Popover/usePopover.js:193–195`;
  defaults `role='dialog'`, `isModal=true`, usePopover.js:113 and d.ts:92, 100).
- Focus is trapped in the popup (`useFocusTrap`, usePopover.js:133–141) and the first
  focusable element is auto-focused on open (`hasAutoFocus` default true,
  usePopover.js:144–156).
- Keyboard on the trigger: `ArrowDown` opens when closed (js:254–259); Enter/Space are
  native button activation → bubbled click → toggle (js:233–237, 242). Escape closes
  (`hasEscapeDismiss`/light-dismiss, usePopover.js:107, 141; light dismiss default true,
  usePopover.d.ts:40–44). Everything *inside* the popup — arrows, typeahead, roving
  highlight — is the render prop's responsibility (CLI doc Best Practices: "Use Astryx
  focus hooks for custom content: useGridFocus … useListFocus …").

### 1.6 Placement / width knobs

- `placement` is passed to `popover.render(content, { placement, alignment: 'start', … })`
  — **alignment is hardcoded `'start'`**, only the side is configurable (js:289–293;
  `LayerPlacement = 'above' | 'below' | 'start' | 'end'`,
  `core/dist/Layer/useLayer.d.ts:19`).
- Popup geometry (`styles.popover` + `styles.content`, js:101–112, decoded from
  `core/dist/astryx.css`): `min-width: anchor-size(width)` (`.xrzjruh` — popup is at
  least as wide as the trigger, can grow wider), `margin-top: var(--spacing-1)`
  (`.xcsaf9d`), content `max-height: min(480px, calc(100vh - 32px))` (`.xpnbb6b`),
  `overflow: auto` (`.xysyzu8`), `padding: var(--spacing-3)` (`.x1b2ylru`).
- `width` sizes the whole `Field` (label + control + status) (d.ts:68–69, js:312);
  the trigger container itself is `width: 100%` (`.xh8yej3`, js:37).

### 1.7 Theming hooks

`themeProps(component, props)` emits a stable class plus data-attribute reflection:
`{ className: 'astryx-<component> <variant classes>', 'data-<prop>': value }`
(`core/dist/utils/themeProps.js:99–104`, `buildClassName` at 48–58,
`themeDataAttributes` at 68–79).

- Trigger container: `themeProps('complex-selector', { size, status })` →
  class `astryx-complex-selector` + `data-size="sm|md|lg"` + `data-status="…"` (js:238–241).
- Chevron: `themeProps('complex-selector-indicator-icon', { state })` →
  `astryx-complex-selector-indicator-icon` + `data-state="expanded|collapsed"` (js:284–287).
- `defineTheme` override keys `components: { 'complex-selector': { base, 'size:value' },
  'complex-selector-indicator-icon': { base, state } }` (CLI
  `astryx component ComplexSelector`, Theming section).

---

## 2. Constraints that bite a rich ReactNode `triggerLabel`

### 2.1 Interactive content nests inside a `<button>`

`triggerLabel` renders inside the trigger `<button>` (js:242–268, §1.4). Any interactive
node in it (a removable `Token`, a link, a nested button) is an interactive descendant of
a button — invalid HTML, and React warns at runtime. This repo already measured it:
`BAIComplexSelect.tsx:57–62` (PILOT-DECISION P26-4: "`ComplexSelector` renders
`triggerLabel` inside its own `<button>`, so a removable Token nests a button in a
button") and the inline comment at `BAIComplexSelect.tsx:367–371` ("invalid HTML, and
React says so at runtime (measured in the ticket-26 probe)"). Additionally, **every**
click anywhere in the trigger container bubbles to the container's toggle `onClick`
(js:233–237), so a click meant for an embedded control would also toggle the popup
unless the node stops propagation — a behavior the component does not sanction.

### 2.2 Truncation / overflow of wide content

The span wrapping `triggerLabel` carries (js:263–267, classes decoded in
`core/dist/astryx.css`): `flex-grow:1` (`.x1iyjqo2`), `min-width:0` (`.xeuugli`),
`overflow:hidden` (`.xb3r6kr`), `text-overflow:ellipsis` (`.xlyipyv`),
`white-space:nowrap` (`.xuxw1ft`), `text-align:start` (`.x1yc453h`).

Consequences for a node:

- Plain text gets a proper single-line ellipsis. Arbitrary element content gets **hard
  clipping** (`text-overflow` only elides inline text in the clipping box itself).
- `white-space: nowrap` inherits into the node's text unless the node overrides it.
- A node that establishes its own layout and wraps (e.g. `HStack wrap="wrap"` of Tokens)
  is *not* clipped vertically: the trigger container uses `min-height:
  var(--size-element-{sm|md|lg})` (js:113–124; `.x1gdqauq`/`.x1uogy3y`/`.x1xf4nls`), so
  wrapping content **grows the trigger's height**. The repo hit exactly this:
  `BAIComplexSelect.tsx:69–73` (QA2-B-1: badge chips "wrap and grow the trigger's
  height, which is exactly what Astryx's own guidance warns against for fields sitting
  in toolbars and form rows").

### 2.3 Accessible-name computation when `triggerLabel` is a node

The trigger button's name comes from `aria-labelledby={labelId}` (js:249), which points
at the Field's label element (labelId is passed to `Field` as `labelID`, js:295–301).
Under ARIA accname precedence, `aria-labelledby` **wins over element contents**, so the
`triggerLabel` content — string *or* node — never enters the button's accessible name.
The current selection is therefore not conveyed via the trigger's name at all; a rich
node trigger is effectively presentational to AT, and the selection state must be
carried by the popup content / a live region (as `BAIComplexSelect` does with its
`VisuallyHidden aria-live="polite"` count, `BAIComplexSelect.tsx:486–488`). Note the
trigger is a plain `aria-haspopup="dialog"` button, **not** a `role="combobox"` (unlike
`Selector`, whose trigger is `role="combobox"`, `core/dist/Selector/Selector.js:668`) —
so there is also no combobox "value" semantics to pick up the content.

(This nuances `BAIComplexSelect.tsx` P26-3's stated reason for string labels
(`BAIComplexSelect.tsx:52–56`) — the string is load-bearing for the live region and
option rows; the trigger's accessible name is the field label either way.)

### 2.4 Size variants

`size` only switches the container's `min-height` token (§2.2) and is reflected as
`data-size` for theming (js:238–241); font-size is fixed at
`var(--text-label-size)` on the container (js:41, `.xcr08ib`). There are no per-size
layout slots — the chevron and Spinner positions are fixed (§1.4), so a multi-part rich
trigger has exactly one flexible slot (the truncating span) to live in.

---

## 3. Sanctioned paths for a node trigger in Selector / MultiSelector / Typeahead

**There are none via props.** Verified per component:

- **Selector** — the trigger renders `selectedItem?.label ?? placeholder` inside the
  same truncating-span-in-button structure (`core/dist/Selector/Selector.js:660–694`;
  identical span class string at :691–693), and `SelectorOptionData.label` is
  `string | undefined` (`core/dist/Selector/types.d.ts:11–16`). `renderOption` customizes
  **only the popup option rows** (Selector.js:554: `renderOption ? renderOption(item) :
  <DefaultOption>`; d.ts:143–145 "Custom render function for options"). The only
  ReactNode the trigger accepts is `startIcon` (d.ts:138–140; rendered in the trigger
  container at js:654–657). `variant="ghost"` restyles, it does not change content
  (d.ts:113–120).
- **MultiSelector** — trigger rendering is enumerated by
  `triggerDisplay?: 'count' | 'labels' | 'badges'` plus `maxBadges`
  (`core/dist/MultiSelector/MultiSelector.d.ts:174–183`); `startIcon` again is the only
  node slot (d.ts:144–146). No node trigger.
- **Typeahead** — the trigger is a text input: the component "composes BaseTypeahead
  with Field or InputGroup" (`core/dist/Typeahead/Typeahead.js:7–9`, imports at :24);
  node props are `startIcon` (d.ts:47–49) and `renderItem` for **menu items**
  (d.ts:65). No node trigger.
- **Theming** cannot do it either: the `astryx-*` class / `data-*` attribute surface and
  `defineTheme` component overrides inject **CSS properties**, not DOM content
  (`core/dist/utils/themeProps.js:81–104`; CLI Theming sections list only style keys).

So the two sanctioned routes to a rich trigger are:

1. **ComplexSelector** — this *is* the designed escape hatch: `triggerLabel: ReactNode`
   plus popup ownership (§1), "intentionally one component" (CLI doc). The repo already
   standardized on it: `BAIComplexSelect.tsx:21–26` ("`ComplexSelector` is the escape
   hatch … That makes the popup ours"), and it already passes a ReactNode
   `triggerLabel` today (display-only `Token` chips in `'badges'` mode,
   `BAIComplexSelect.tsx:358–384`), within the §2.1 constraint.
2. **`astryx swizzle Selector`** — eject and own the source. Measured cost (run against
   the installed CLI): `pnpm exec astryx swizzle Selector --output <dir>` copies **6
   files, 2,054 lines** of raw StyleX TSX (`Selector.tsx` 1,375 lines,
   `SelectorOption.tsx`, `hooks.ts`, `types.ts`, `utils.ts`, `index.ts`) into
   `./components/astryx/` by default (absolute output paths are rejected). Relative
   imports are rewritten to `@astryxdesign/core/*`, so `Field`, `usePopover`, tokens,
   and `themeProps` stay shared with the package (swizzle output message; verified in
   the ejected `Selector.tsx` imports). Costs recorded by the CLI itself:
   - a StyleX compiler is **required** — without it the swizzled component "renders
     unstyled (no error)" (swizzle output; `astryx docs styling` §"StyleX Build Setup
     (required for swizzled components)", lines 242–274 of the doc output: "Pure theming
     … needs NO StyleX compiler; only swizzled/authored StyleX source does"). `react/`
     runs in StyleX mode, so this is satisfied here (react/AGENTS.md note in CLAUDE.md).
   - the ejected copy is frozen at 0.3.0: it stops receiving upstream fixes, and the CLI
     treats swizzling as an anomaly to report — "Customizing a component often signals a
     gap in the design system. Let the maintainers know" with a prefilled
     `gh issue create --repo facebook/astryx` (swizzle output).
   - ~1.4k lines of combobox keyboard/ARIA/search/clear logic become this repo's
     maintenance surface; `astryx upgrade` covers the package, not the ejected copy.

---

## 4. What the templates demonstrate

- **`SelectorShowcase`**
  (`react/node_modules/@astryxdesign/cli/assets/templates/blocks/components/Selector/SelectorShowcase.tsx`,
  21 lines): a plain string-options `Selector` (`options={['Apple', …]}`, string
  placeholder, `style={{width: 300}}`). The sibling blocks — `SelectorClearable`,
  `SelectorGhostToolbar`, `SelectorWithSections`, `SelectorWithStatus` (same directory)
  — exercise `hasClear`, `variant="ghost"`, sections, and `status` respectively; the
  separate `SelectorOption` blocks demonstrate `renderOption` **popup rows** ("adding a
  secondary description below each label", `astryx template --list` description). None
  renders anything but a string in the trigger.
- **There is no ComplexSelector template or block.** `astryx template --list` and
  `astryx search "ComplexSelector"` return no template/block for it, and
  `find node_modules/@astryxdesign/cli -iname '*complex*'` finds nothing; the CLI
  assets directory has only `MultiSelector/`, `Selector/`, `SelectorOption/` component
  blocks. The only upstream usage guidance is the component doc itself
  (`astryx component ComplexSelector`), whose sole example passes a **string**
  `triggerLabel` (also in `core/dist/ComplexSelector/ComplexSelector.d.ts:85–102`) and
  whose Best Practices are entirely about popup content structure, not trigger content.

---

## Summary for the decision ticket

1. `ComplexSelector.triggerLabel: ReactNode` is a real, typed, sanctioned surface
   (d.ts:44–45) — the only one in the select family — and the component around it
   supplies field wiring, dialog popover, focus trap/restore, and async
   `changeAction`/optimistic flow (§1).
2. A rich node trigger operates inside three hard constraints: it lives inside a
   `<button>` whose container toggles on any bubbled click (no interactive content,
   §2.1); it sits in a single nowrap/clip/ellipsis span, with vertical growth (not
   clipping) when the node wraps (§2.2); and it never contributes to the accessible
   name — the field label is the name, and selection state must be announced elsewhere
   (§2.3).
3. `Selector`/`MultiSelector`/`Typeahead` have no node-trigger path via props or
   theming; the alternatives are ComplexSelector or swizzling ~2k lines of Selector
   source with a permanent upgrade burden (§3). Upstream ships no ComplexSelector
   template; its intended-usage signal is the component doc plus string-label examples
   (§4).
