# Ticket 27 conversion brief — migrating the select family onto `BAIComplexSelect`

Produced by ticket 26. Read this together with
`.scratch/astryx-migration/issues/26-complex-selector.md` ("Implementation
notes"), MIGRATION-SPEC §0 (simplicity policy: when antd has a feature Astryx
does not, DROP it and record a `PILOT-DECISION`, do not rebuild it) and
MAPPING.md §3.1.

Foundation shipped by ticket 26 — **use it, do not rebuild it**:

| Path | What it is |
|---|---|
| `packages/backend.ai-ui/src/components/BAIComplexSelect.tsx` | the Astryx `ComplexSelector`-based select core (scroll→`loadNext`, server search, keyboard/ARIA subset, `labelInValue` value contract) |
| `packages/backend.ai-ui/src/components/fragments/BAIUserSelectAstryx.tsx` | the worked example: Relay offset pagination + label resolution + single/multiple, ~250 LOC |
| `react/theme-probe/select26.{html,tsx}` + `shoot26.mjs` | the live harness that measured both acceptance criteria |
| i18n keys `comp:BAIComplexSelect.Search` / `.NoResults` | present in all 21 BUI locales |

---

## 1. Target API

```ts
import { BAIComplexSelect } from 'backend.ai-ui';

<BAIComplexSelect
  label="Owner"          // REQUIRED string — accessible name (Astryx Field)
  isLabelHidden          // set this inside Form.Item / BAIFormItem
  value={labelInValue}   // {label,value} | {label,value}[] | null
  onChange={...}
  options={[{ value, label /* string */, description?, extra?, disabled? }]}
  multiple
  hasSearch searchValue={s} onSearch={setS}   // server search (antd onSearch)
  endReached={loadNext} isLoadingNext={...} total={count}
  onOpenChange={setOpen}                       // re-exposes the popup state
  isLoading isDisabled isRequired status={{type,message}}
  header={...} footer={...} emptyContent={...}
/>
```

Value contract is **byte-identical to antd `labelInValue`**, so no
`getValueProps`/`normalize` is needed at any `Form.Item`/`BAIFormItem` call
site. Measured end-to-end in ticket 26 (`measure-26.json`, `B_*` rows).

### antd → BAIComplexSelect prop table

| antd `Select` / `BAISelect` | `BAIComplexSelect` | Note |
|---|---|---|
| `options` | `options` | `label` narrows `ReactNode` → **`string`** |
| `optionRender` | `description` / `extra` per option | P26-3 — rich content moves into slots |
| `labelRender` | — | dropped; the trigger prints `value.label` |
| `tagRender` | — | dropped (P26-4) |
| `labelInValue` | (always on) | the only value shape |
| `mode="multiple"` | `multiple` | |
| `mode="tags"` | — | **no free-entry**; see §2 pattern D |
| `showSearch` | `hasSearch` | |
| `onSearch` + `filterOption={false}` | `onSearch` + `searchValue` | server search is the only search |
| `endReached` / `onPopupScroll` | `endReached` | same `<= 30px` predicate, same edge-triggering |
| `atBottomThreshold` / `atBottomStateChange` | same names | |
| `loading` | `isLoading` | |
| `disabled` | `isDisabled` | |
| `allowClear` | — | dropped; clear via the form's own reset |
| `open` / `onOpenChange` | `onOpenChange` **(read-only)** | `ComplexSelector` owns the popover; you can observe but not drive it |
| `notFoundContent` | `emptyContent` | ReactNode, but prefer the default text |
| `header` / `footer` (`popupRender`) | `header` / `footer` | `footer` defaults to "Total N items" when `total` is passed |
| `placeholder` | `placeholder` | |
| `status="error"` | `status={{ type: 'error', message }}` | Astryx renders the message too |
| `virtual` | — | deferred, see §4 |
| `ref` → `RefSelectProps.focus()` | — | no imperative handle; wrappers keep their own `refetch` ref |

---

## 2. Conversion recipes, per current select pattern

### A. Relay-paginated, name-valued (`valuePropName: 'email'|'name'`) — the 17-wrapper majority

Current shape: `useLazyPaginatedQuery` + `endReached={loadNext}` +
`labelInValue` + a second "value query" resolving the selected key to a label.

**Copy `BAIUserSelectAstryx.tsx` and change four things:** the two `graphql`
tags, `keyOfNode`, the `options` mapper, and the placeholder i18n key. Keep:
`useControllableValue` for the value/open pair, the deferred value, the
`open ? 'network-only' : 'store-only'` fetch policy (fed by `onOpenChange`),
`useDebouncedDeferredValue` on the search string, the `useFetchKey` +
`useImperativeHandle({refetch})` ref.

The wrapper's OUTER contract stays the plain key (`string | string[]`) that
the antd wrapper exposes today — `labelInValue` lives only between the
wrapper and `BAIComplexSelect`. That is what keeps existing call sites
unchanged.

⚠️ **The "value query" is no longer optional.** antd rendered the raw value in
the trigger when no option matched; Astryx reads the trigger text from the
VALUE, and a value picked on page 1 is gone from `options` once `loadNext`
has paged past it. Every wrapper needs the resolution query (they all already
have one — do not delete it) plus the `label: resolved ?? key` fallback.

### B. Relay-paginated, id-valued (`valuePropName: 'id'`)

Same as A; the only delta is `keyOfNode` returning `toLocalId(node.id)`. The
label still comes from a display field (`name`/`email`), so the labelInValue
pair is `{ label: node.name, value: toLocalId(node.id) }`.

### C. `usePaginationFragment` (cursor) instead of `useLazyPaginatedQuery`

Only `BAIAdminResourceGroupSelect` in the current tree. `endReached` maps to
`loadNext(pageSize)` and `isLoadingNext` to the hook's own flag; nothing else
changes. Do **not** convert a cursor connection to offset while migrating.

### D. `mode="tags"` (free entry) — **do not use `BAIComplexSelect`**

`BAIComplexSelect` has no create-new path and `Tokenizer` (the Astryx
free-entry component) takes a `SearchSource`, not `options`. For the ~12
`mode="tags"` sites: if the entry list is static/local, go to
`Tokenizer` + `hasCreate` directly (MAPPING §3.1); if it is Relay-backed,
raise it as a separate decision — it is out of ticket 27's stated scope
(18 rewrite-needed wrappers), and none of the 18 are tags-mode.

### E. Small static-option selects

Already handled — they go to `AstryxFormSelector` /
`AstryxFormMultiSelector` in
`react/src/components/astryx-bui/astryxFormControls.tsx` (ticket 18/20). Do
not move them onto `BAIComplexSelect`; it is heavier and needs no options
window. The dividing line stays MAPPING §3.1: Relay-backed, >~50 options,
or scroll-loaded ⇒ `BAIComplexSelect`.

---

## 3. Dropped antd affordances — say this once per wrapper, in a comment

Record a `PILOT-DECISION` at each wrapper only when the wrapper actually used
the feature. The core already documents the general list (`P26-1..P26-7`):

- `optionRender`/`labelRender`/`tagRender` returning JSX → `description`/`extra`
- removable chips in the trigger (nested `<button>`, invalid HTML)
- `allowClear`
- controlled `open`
- imperative `focus()`
- `notFoundContent={<Skeleton.Input/>}` first-load placeholder
- printable-character type-ahead, PageUp/PageDown, shift-range selection

## 4. Virtualization — DEFERRED, and the reason matters for ticket 27

Astryx has no virtualized list, and `Selector`/`MultiSelector` mount every
option into the DOM even while closed (ticket 12 §4: 500 options → 2,513
nodes). `BAIComplexSelect` renders one DOM row per **loaded** option, so the
pagination window is the only thing keeping that bounded.

**Therefore: never convert a paginated wrapper into a "fetch everything"
wrapper while migrating it.** If a wrapper today pages 10 at a time, it must
still page 10 at a time afterwards. Revisit windowing only if a single
wrapper is ever asked to hold >~200 loaded rows.

## 5. Checklist per converted wrapper

- [ ] `graphql` tags renamed to match the new module name; `pnpm relay` run
- [ ] value query kept, with the `label ?? key` fallback
- [ ] `endReached` wired to `loadNext`, `total` wired to the connection count
- [ ] `onOpenChange` wired to the fetch-policy switch
- [ ] outer prop contract unchanged (plain keys) so call sites do not move
- [ ] the antd wrapper left in place until its last consumer is converted
      (frontier rule)
- [ ] `bash scripts/verify.sh` → `=== ALL PASS ===`
