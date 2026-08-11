# Phase 3 / ticket B — the BUI modal family on Astryx `Dialog`

Scope: `packages/backend.ai-ui/src/components/` — `BAIModal`, `BAIModal.css`
(deleted), `BAIUnmountAfterClose`, `BAIDeleteConfirmModal`, `BAIBulkErrorModal`,
plus the two react-side CSS files and the one hook that reached into the antd
modal DOM. Excluded per brief: Form-family internals (PARKED), sibling scopes
(A display primitives, C select, D table incl. `BAITableColumnCSVExportModal`).

Result: `BAIModal` renders `Dialog` + `Layout` + `DialogHeader` +
`LayoutContent` + `LayoutFooter` underneath, while the antd-`Modal`-shaped prop
surface is preserved — **zero of the 124 `<BAIModal>` call sites changed**, and
the 11 files that declare `interface X extends ModalProps` and spread the bag
straight into `<BAIModal>` still compile.

---

## PILOT-DECISIONs

### 1. `draggable` is DROPPED (accepted-and-ignored)

`react-draggable` moved antd's absolutely-positioned modal wrapper. Astryx
`Dialog` is a native `<dialog>` promoted to the CSS **top layer**; there is no
wrapper to translate, and `position` is a static prop, not a live offset.

**Usage count checked first, as instructed:**
`git grep -n 'draggable' -- react packages` returned **zero application call
sites** — the only hits were `BAIModal.tsx` itself, `BAIModal.stories.tsx`, and
unrelated `draggable={false}` on `<img>`/`<div>` elements. Two of the three
story usages were a "Draggable Feature" demo.

Decision: **drop the behaviour, keep the prop.** `draggable?: boolean` still
type-checks so no consumer breaks; the `react-draggable` import, the
`GripVertical` handle, the `bounds`/`disabled` state and the `handleDrag`
bounds arithmetic (~60 LOC) are gone, and the `Draggable Feature` story is
removed. Implementing a hand-rolled pointer-drag was rejected: it is not
"trivially clean" against a top-layer `<dialog>` (it needs a transform layer
plus its own viewport clamp) and it would be dead code for zero users.

### 2. `centered` accepted and ignored

Astryx dialogs centre themselves unless `position` is set. Same call already
ratified for the app-shim (ticket 04) and `BAIModalAstryx` (ticket 16). 29 call
sites pass it; none change.

### 3. `destroyOnHidden` / `destroyOnClose` are unconditional

`BAIModal` renders nothing while `open` is false — stricter than antd's default
(`destroyOnHidden: false`) and identical to the ticket-16 wrapper's decision.
65 call sites already asked for it explicitly.

### 4. A minimized modal stays modal

antd's `windowActions` minimize dropped the mask and injected
`html body { overflow-y: auto !important }` to defeat the portal's scroll lock,
so the page behind stayed usable. A native `<dialog>` opened with `showModal()`
**always** paints a `::backdrop` and the platform owns the inertness — there is
no supported way to keep a modal `<dialog>` open and let the page behind
receive input.

Minimize is therefore reimplemented as: collapse to the header row (content and
footer slots unmounted), `width: 320`, parked at `minimizedPlacement` via
`Dialog.position`. Maximize → near-viewport `width`/`maxHeight`; fullscreen →
`Dialog variant="fullscreen"`. Application usage of `windowActions` before this
change: **zero** (stories only), so the narrowing lands on no user.

The `ScrollBehaviorWhenMinimized` story is removed and `MinimizedState`'s
description records the narrowing.

### 5. Accepted-and-ignored props (each names a mechanism the platform now owns)

`mask={false}` (a `<dialog>` always has a backdrop), `zIndex` (top layer),
`getContainer` (top layer, not a portal target), `forceRender` (there is no
render-but-hide mode), `wrapClassName` / `rootClassName` / `transitionName` /
`maskTransitionName` (antd's wrapper DOM and rc-motion class names are gone),
`modalRender`, `mousePosition`, `scrollLock` (Astryx `useScrollLock` owns it),
`focusTriggerAfterClose` (Astryx restores focus to the trigger itself),
`prefixCls`, `wrapProps`, `bodyStyle`/`maskStyle`, and the `(info) => …`
function form of `styles`/`classNames` (already inert in the antd-era component,
which guarded every read with `_.isFunction`).

`stickyTitle` is a special case: it is now **unconditionally true**, because the
Astryx `Layout` header slot sits outside the scrolling `LayoutContent`. The prop
is accepted and ignored rather than removed.

### 6. `afterClose` fires from the `open` transition

antd fired it on transition-end. Astryx has no exit transition, so an effect on
the `open` edge is the signal. `BAIUnmountAfterClose` — whose whole job is to
drop the subtree once that fires — keeps working unchanged; it lands one frame
earlier than antd's.

### 7. `onCancel` is called with `undefined` for Escape / backdrop

antd synthesised an event object for keyboard and mask dismissal. Astryx's
`onOpenChange(false)` carries no event. The declared signature is unchanged
(`(e: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLElement>) => void`), so
the 110 call sites still compile; the argument is simply absent on those two
paths. Every call site in the repo ignores it.

### 8. Astryx cannot express "backdrop closes, Escape does not"

`Dialog.purpose` is a three-way switch:

| resolved dismissal                    | `purpose`    |
|---------------------------------------|--------------|
| `maskClosable !== false` (antd default)| `info`      |
| backdrop blocked, Escape allowed       | `form`       |
| both blocked (`keyboard={false}` too)  | `required`   |

`mask.closable` wins over `maskClosable`, matching antd v6. `purpose="required"`
also stamps `role="alertdialog"` — accepted; the only call site that reaches it
is the login modal, which genuinely is a required flow.

### 9. `title` is a `ReactNode` passed through a `string`-typed slot

`DialogHeader.title` is typed `string` but renders its value as `Heading`
children, which are `ReactNode`. 146 call sites pass JSX titles. The node is
forwarded with a documented cast so the header keeps everything `DialogHeader`
owns — the `titleId` the parent `Dialog` points `aria-labelledby` at, the
open-focus target, the close button, the divider and the spacing. Hand-rolling
a `LayoutHeader` would have reproduced none of it. (`headerContent` remains the
escape hatch when the whole row must be replaced.)

### 10. The generated footer renders *elements*, not inline components

First implementation exposed `OkBtn` / `CancelBtn` as inline `React.FC`s and
rendered `<CancelBtn />` / `<OkBtn />`. A new component identity per render made
React unmount and re-create the buttons on every keystroke, so a captured DOM
node kept a stale `disabled` — `destructiveConfirmFlow.test.tsx` caught it
immediately. The generated footer now renders the elements directly; the
`OkBtn`/`CancelBtn` component pair exists only to satisfy antd's `footer`
render-function signature (zero call sites use it).

### 11. `okButtonProps` / `cancelButtonProps` declare NO index signature

The tempting `[key: string]: unknown` escape hatch makes a value still typed as
antd `ButtonProps` **un**assignable (an interface never satisfies an index
signature). Listing only optional keys is what keeps the 11
`extends ModalProps` + spread call sites compiling — extra source keys are
allowed, unknown keys on a fresh object literal are not, and `size` is
deliberately *absent* because antd's `SizeType` includes `'medium'`, which
would clash. antd `ButtonType` is mapped onto the Astryx variant scale
(`primary`→primary, `default`/`dashed`→secondary, `text`/`link`/`ghost`→ghost),
`danger`/`okType="danger"` → destructive.

### 12. `BAIDeleteConfirmModal` drops the form engine

The typed-confirm gate used `Form` + `Form.Item` + `Form.useWatch` purely to
observe one input — which is also the only reason this file imported the PARKED
form-engine. Astryx `TextInput` is `value` / `onChange(value)`, so a single
`useState` is the whole mechanism and the parked dependency disappears. The
locked "Form stays" decision is about form **state engines**; one gate input is
not one. (Same call the shipped `BAIDeleteConfirmModalAstryx` already made.)

Two follow-on shape changes, both matching that shipped sibling:

- "This action cannot be undone." is a `Banner status="error"` — Astryx `Text`
  has no danger colour (`primary|secondary|disabled|placeholder|accent|inherit`).
- `inputLabel` stays `ReactNode` in the contract; since `TextInput.label` is a
  plain `string` that doubles as the accessible name, a rich label renders above
  the field and the field carries the flattened text with `isLabelHidden`.

### 13. jsdom needs a `<dialog>` polyfill

jsdom ships `HTMLDialogElement` with **no** methods, so every test that opens an
Astryx dialog threw `dialog.showModal is not a function` inside the passive
effect. `packages/backend.ai-ui/setupTests.ts` now polyfills
`show`/`showModal`/`close` with the observable contract the component depends on
(`open` flips, a `close` event is dispatched, `returnValue` is recorded). Top
layer / backdrop / focus trap are browser concerns jsdom cannot model either
way and are deliberately not simulated.

---

## Reconciliation with `react/src/components/astryx-bui/`

`BAIDeleteConfirmModalAstryx` / `BAIModalAstryx` were the pilot's local
Astryx-native rebuilds, with an **Astryx-shaped** contract (`isOpen`,
`onAction`, `actionLabel`, string-only `inputLabel`). The BUI originals are now
Astryx-native too, keeping their **antd-shaped** contract.

Deliberately **not** collapsed in this ticket: the ~19 react-side call sites
that already moved to the Astryx-shaped API would all have to be rewritten, and
that is scope owned by the pages tickets, not by the modal family. To make that
collapse a rename later, BUI `BAIModalProps` now also accepts the Astryx-shaped
aliases the pilot introduced: `isOpen`, `onOpenChange`, `subtitle`,
`headerContent`, `closeLabel`, `bodyRef`, `maxHeight`.

**Queued for REMAINDER.md:** delete
`react/src/components/astryx-bui/BAIModalAstryx.tsx` and
`BAIDeleteConfirmModalAstryx.tsx` and repoint their call sites at
`backend.ai-ui`'s `BAIModal` / `BAIDeleteConfirmModal`.

---

## Blast radius outside the four target files

Three consequential edits, each caused by the conversion (P6 — a selector that
matches nothing must go):

| file | change |
|---|---|
| `react/src/components/FolderExplorerModal.css` | deleted — its only rule was `.ant-modal-title { width: 100% }`; `DialogHeader` gives the title slot `flex:1; min-width:0` for free |
| `react/src/components/StoragePermissionEditModal.css` | deleted — same rule plus a close-button reservation that a laid-out (not absolutely positioned) close button no longer needs |
| `react/src/components/FolderCreateModal.css` | dropped the dead `.folder-create-modal .ant-modal-body` padding override; the `.ant-form-item-*` rules stay (Form is PARKED) |
| `react/src/hooks/useKeyboardShortcut.ts` | `isModalOpen()` now matches `'.ant-modal, dialog[open]'` — it detected an open modal purely by antd class, and would have gone blind to every converted modal |
| `packages/backend.ai-ui/src/components/BAIBulkErrorModal.tsx` | `import type { AnyObject } from 'antd/es/_util/type'` inlined so the modal family carries no antd specifier of its own |

---

## Gate deltas

- **`ant-selector-gate`**: `BAIModal.css` deleted (36 `.ant-*` selector hits →
  0). The two react-side modal CSS files deleted, `FolderCreateModal.css`'s
  `.ant-modal-body` rule dropped, and the `.ant-modal-header` mention in
  `BAIModal.stories.tsx` removed. What remains in the family's files is prose in
  the migration note headers describing what was removed.
- **`astryx-token-gate` (P19)**: all seven `--general-modal-*` entries
  (`-header-height`, `-header-padding`, `-body-padding`, `-content-padding`,
  flagged "fallback wins forever") are gone. Nothing in the repo ever defined
  those custom properties, so no deployment hook is lost.
- **`antd-import-graph`**: the four family files carry **no direct antd
  specifier** any more (`BAIUnmountAfterClose`'s `import type { DrawerProps,
  ModalProps } from 'antd'` became a local structural interface, so the wrapper
  still serves both an Astryx `BAIModal` and a still-antd `Drawer`). They remain
  *transitively* antd-reachable through `hooks/useBAIi18n → locale/index.ts`
  (`import type { Locale } from 'antd/es/locale'`, ticket 30) and, for
  `BAIBulkErrorModal`, through `BAIAlert` / `BAITable` (siblings A / D). None of
  those are in this ticket's scope.

## Live verification

Dev server on `:5820` against `10.82.0.130:8090`, Playwright, light + dark.
Scripts: `.scratch/astryx-migration/p3b-{login,modal-shots,ok-loading,login-modal}.mjs`;
screenshots + `results.json` in `.scratch/astryx-migration/shots/p3-b/`.

| flow | component | result |
|---|---|---|
| Info modal — Resource Policy info | `BAIModal` `footer={null}` | opens, `aria-modal`, `aria-labelledby` set, **Escape closes** |
| Settings modal — Edit Keypair Resource Policy | `BAIModal` + PARKED antd `Form` | opens (800px), form renders and scrolls, **backdrop click closes** (`maskClosable` default) |
| Typed-confirm delete — Delete Policy | `BAIDeleteConfirmModal` | OK `destructive` + **disabled**; wrong string → still disabled; exact string → enabled; Cancel closes. `antNodesInside: 0` |
| Folder create | `FolderCreateModalV2` (Astryx sibling) | opens, Escape closes — no regression from the BUI change |
| Create + delete round trip | `BAIModal` `confirmLoading` → `BAIDeleteConfirmModal` | OK button goes `aria-busy=true` + disabled + spinner while the mutation is in flight, modal closes on resolve, row created; delete gate opens on the exact string, row removed |
| Login modal (non-dismissable) | `BAIModal` `closable/keyboard/maskClosable = false` | `role="alertdialog"`, **0 close buttons**, Escape does not close, backdrop click does not close |

`pageErrors: []` on every run.
