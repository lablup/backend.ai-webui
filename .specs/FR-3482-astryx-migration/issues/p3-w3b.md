# Phase 3 · wave 3 · partition B — accumulated defects, adapter fold-back, QR

Scope: the four defect areas carried out of waves 1–2, the type-only sweep, and
a report-only triage of BUI infrastructure. No page or component conversions —
those belong to the sibling partition.

Everything below is measured. The probe is
`.scratch/astryx-migration/p3-w3b-probe.mjs`; its output is
`shots/p3-w3b/measure-before.json` and `measure-after.json`.

---

## D1 — header-band overlays inherited the on-dark media context

**Symptom (two bug reports, one cause).** The Downloads modal rendered dark in
light mode. The "My Account Information" modal's form labels were invisible.

**Measured before.** Every dialog opened from the user dropdown, in *light*
mode:

```
bg: rgb(20,20,20)   colorScheme: dark   mediaAncestors: ["div=dark"]
```

and inside "My Account", the antd form labels:

```
"Full Name(optional)"  color: rgb(20,20,20)
```

i.e. `rgb(20,20,20)` text on an `rgb(20,20,20)` surface.

**Root cause.** `WebUIHeader` wrapped the whole `<UserDropdownMenu>` in
`<MediaTheme mode="dark">` so the trigger and its popover would sit correctly
on the orange band. `MediaTheme` renders a real `<div data-astryx-media="dark">`
and the theme's on-media tokens are ordinary CSS custom properties on that
element — they inherit to every descendant.

`UserDropdownMenu` also mounts three modals (`DownloadModal`,
`AboutBackendAIModal`, `UserProfileSettingModal`), and **Astryx `Dialog` is a
native, non-portalled `<dialog>`** — `Dialog.tsx:458` calls `showModal()` on an
element rendered in place. Promotion to the top layer does not change DOM
ancestry, so the dialogs stayed inside the media context and kept
`--color-background-surface` on its dark value in both modes.

The label defect is the same cause seen from the other side: the antd form
engine follows the *real* app mode, so in light mode it correctly painted dark
labels — onto a surface that had been forced dark by the media context. In dark
mode the two happened to agree, which is why only light mode looked broken.

**PILOT-DECISION — scope the media context to the content that is actually on
the band, rather than resetting it further down.**

Three mechanisms were considered:

| Option | Rejected because |
|---|---|
| Wrap the modals in `<MediaTheme mode={appMode}>` | `MediaTheme` declares *surface luminance*, not app mode. A modal on the page surface has no media context; giving it one applies `onLight`/`onDark` token overrides it should not have. |
| Wrap the modals in a nested `<Theme mode={appMode}>` | Would work — a nested `Theme` re-declares the tokens — but it registers a theme, injects CSS and runs root-detection, all to undo a context we chose to put there. Treating the symptom. |
| Portal the modals to `document.body` | Fights Astryx's deliberate design; `Dialog` is non-portalled on purpose (top layer makes a portal unnecessary). |

So the boundary moved instead. `WebUIHeader`'s `MediaTheme` now wraps only the
theme-toggle and help buttons; `UserDropdownMenu` declares its own
`<MediaTheme mode="dark">` around *just* the `<DropdownMenu>`. The panel keeps
its dark surface — it is a DOM descendant of the trigger, which is what legacy's
`ReverseThemeProvider` also produced — and the modals mount outside.

**One residual, also measured.** The header row carries an inline
`color: var(--color-on-dark)` for the antd-engine `ProjectSelect` value, and
`color` inherits. `Dialog` sets `background-color` but not `color`
(`Dialog.tsx:128`), so bare text in a dialog would still have come out white.
The overlay group is therefore wrapped in
`{ display: 'contents', color: 'var(--color-text-primary)' }` — the same
two-declaration, zero-layout wrapper Astryx's own `Theme` and `MediaTheme`
render.

**Measured after.**

| Surface | light | dark |
|---|---|---|
| Downloads | `bg rgb(255,255,255)`, scheme `light` | `bg rgb(20,20,20)`, scheme `dark` |
| About | `bg rgb(255,255,255)`, scheme `light` | `bg rgb(20,20,20)`, scheme `dark` |
| My Account labels | `rgb(20,20,20)` on white | `rgb(255,255,255)` on `rgb(20,20,20)` |
| `mediaAncestors` | `[]` | `[]` |

Header band unchanged in both modes: `bg rgb(255,151,41)` / `rgb(232,138,40)`,
label `rgb(255,255,255)`.

> **SUPERSEDED (QA-FINDINGS `Q-3`) — "the panel keeps its dark surface" no
> longer holds.** The clause above is the one part of this decision that was
> reversed. It was justified by legacy parity: antd's `ReverseThemeProvider`
> INVERTED relative to the app, so in light mode the panel was indeed dark.
> But the same mechanism made it *light* in dark mode, and POLISH-2 had already
> abandoned inversion for the band itself (`mode="dark"` is constant there,
> because the orange band is a dark surface in both modes). Keeping the panel
> pinned dark therefore reproduced neither legacy (which flipped) nor the
> band's own rule (which is about the BAND, not about a floating surface the
> band opens) — and users read a `rgb(48,48,48)` menu on a white page in light
> mode as a bug. QA directive: the band chrome stays on-dark, but every
> floating surface it opens resolves the APP's mode.
>
> The three options in the table above are still correctly rejected — none of
> them is what the fix does. The fix removes the wrapper instead: the on-dark
> context now sits on the TRIGGER ELEMENT (`button['data-astryx-media']`),
> which is `MediaTheme`'s own mechanism at element scope, and `DropdownMenu`
> renders its `[popover]` panel as a SIBLING of the trigger — so the panel is
> outside the context with nothing to undo. Same move in
> `BAINotificationButton`, where the wrapper had also been reaching the
> `Tooltip` panel (`Tooltip` renders trigger and panel as siblings too),
> forcing `color-scheme: dark` onto Astryx's deliberately-inverted tooltip
> surface: measured `bg rgb(255,255,255)` with `--color-text-primary` pinned to
> `#ffffff`, i.e. the `Kbd` badge was white on white in BOTH modes.

---

## D2 — the user-dropdown trigger had lost its `data-testid`

Found while writing the probe: `[data-testid="user-dropdown-button"]` matched
nothing.

`DropdownMenu` renders `<Button {...button} … data-testid={testId} />` — its
own `data-testid` prop is applied **after** the spread. `UserDropdownMenu` was
passing `'data-testid': 'user-dropdown-button'` *inside* `button`, so it was
overwritten with `undefined` and the attribute was removed from the DOM
entirely.

This is not cosmetic: `loginAsAdmin` in `e2e/utils/test-util.ts` blocks on that
selector, and ~10 spec files assert on it. Fixed by moving `data-testid` onto
`<DropdownMenu>` itself. `UserDropdownMenu` is the only `DropdownMenu` call site
in the repo that passed a testid through `button`, so this is a one-site class
of bug — but worth knowing about when converting the next dropdown.

---

## D3 — folding W2-C's local `Form.Item` adapters back into the shared module

W2-C created nine local adapters to avoid cross-agent conflicts in the shared
`react/src/components/astryxFormControls.tsx`. The wave has landed, so the
recurring gaps are hoisted and the copies deleted.

**Added to `AstryxFormTextInputProps`:** `size`, `onEnter`, `onKeyDown`,
`htmlName`, `onValueChange`.
**Added to `AstryxFormSwitchProps`:** `isLoading`, `size`, `isLabelHidden`,
`onValueChange`.

`onValueChange` deserves a note — it turned out to be the *most common* reason
a call site forked. `Form.Item` owns the injected `onChange`, so a call site
that also needs a side effect (mark dirty, clear a resolved lookup, open a
confirm) had nowhere to put it and wrote its own adapter. `onValueChange` fires
with the new value immediately after the injected `onChange`.

**Folded (7):**

| File | Local adapter | What it needed |
|---|---|---|
| `SessionListColums/SessionInfoCell.tsx` | `InlineNameInput` | `onEnter`, `onKeyDown` |
| `ComputeSessionNodeItems/EditableSessionName.tsx` | `SessionNameInput` | `size="lg"`, `onKeyDown` |
| `TOTPActivateModal.tsx` | `OTPInput` | `size`, `width`, `htmlName` |
| `VFolderMountFormItem.tsx` | `MountPathInput` | `size="sm"` |
| `VFolderTable.tsx` | `AliasInput` | `onValueChange` (+ a click guard) |
| `SessionOwnerSetterCard.tsx` | `OwnerEnabledSwitch` | nothing — pure duplication |
| `UserProfileSettingModal.tsx` | `TotpSwitch` | `isLoading`, `onValueChange` |

`VFolderTable`'s adapter also stopped click propagation so typing in the alias
field would not toggle the row. That is a layout concern, not a form-control
one; the guard moved out to a `<div onClick={stopPropagation}>` around the whole
`<Form.Item>`, which is both simpler and where it belongs.

**PILOT-DECISION — two adapters stay local, and they should.**

- `SessionFormItems/SharedMemoryFormItems.tsx` (`AutomaticShmemSwitch`): the
  visible label flips between "auto" and "manual" *as a function of the
  injected `checked`*. A shared adapter receives `label` as a prop from the
  call site, which cannot see the injected value. Modelling this would mean
  accepting `label` as a render function — a worse API for one caller.
- `SessionFormItems/ClusterModeFormItems.tsx` (`ClusterModeSegmented`): each
  option carries a help tooltip. `AstryxFormSegmentedOption` does not model a
  per-option trailing node, and widening it for one call site is the
  antd-equivalence reflex the simplicity policy forbids.

One deliberate behavioural delta: `AstryxFormTextInput` defaults `width` to
`'100%'` and raw `TextInput` has no default. `SessionInfoCell`'s inline rename
field therefore now fills its cell instead of sizing intrinsically. Verified
visually; it reads better in the table.

---

## D4 — antd `QRCode` in `TOTPActivateModal`

Wave 2 left this as a documented exception, on the explicit grounds that
closing it meant a `pnpm-lock.yaml` write that three sibling agents would have
to merge. That constraint no longer applies — the lockfile belongs to this
partition alone this wave.

**PILOT-DECISION — adopt `qrcode.react@4.2.0`.** MAPPING §2 grades antd
`QRCode` as **NONE**; neither Astryx core nor lab ships a QR renderer, and
there was no QR encoder anywhere in the dependency graph. Of the two candidates:

| | `qrcode.react` | `qrcode` |
|---|---|---|
| Runtime deps | **zero** | several (incl. a CLI + node canvas path) |
| Size unpacked | 115 KB | larger |
| React binding | native (`QRCodeSVG` / `QRCodeCanvas`) | none — hand-wire to a `<canvas>` |
| License | ISC | MIT |
| Published | 2024-12-11 | — |

`qrcode.react` wins on every axis that matters here. Because it published in
2024 it is far past the 7-day `minimumReleaseAge` quarantine, so **no
`minimumReleaseAgeExclude` entry is needed** — unlike the Astryx packages. It is
catalogued in `pnpm-workspace.yaml` like every other shared dependency;
`pnpm install` added exactly one package.

**PILOT-DECISION — the QR is pinned to literal `#000` on `#ffffff` in both
modes**, against the tokens-only rule. This is a scanner-contrast requirement,
not a styling choice: antd's `QRCode` defaulted to a *transparent* background,
which over the dark-mode dialog surface is black modules on near-black and is
unreadable by a phone camera. `marginSize={2}` keeps the mandatory quiet zone
and `size={160}` matches antd's default, so the modal's layout is unchanged.

`TOTPActivateModal.tsx` is now antd-free.

---

## D5 — the remainder report was lying, in both directions

The type-only sweep was assigned as "10 files". Eight of them were not
type-only at all — they render `<Alert>`, `<Tooltip>`, `<Typography.Text>`,
`<Input>`, `<Switch>`, `<Button>`, `<Space.Compact>`. Two parser bugs, both now
fixed in `scripts/migration-gates/`:

1. **Comments counted as imports.** Neither `parseSpecifiers` nor
   `classifyAntdImports` stripped comments, and this repo's migration comments
   quote the antd line they replaced (`// -import { Form } from 'antd';`).
   `app-shim/bridge.ts`, `app-shim/index.tsx` and `form-engine/engine.ts` — the
   antd-free *replacements* — were ranked as the top three antd hubs at 577–579
   taint each. Fixed by `stripComments()`, which blanks comments and template
   literals to spaces so offsets stay stable.

2. **Render files classified as type-only.** `classifyAntdImports` used
   `/import\s+([\s\S]*?)\s+from\s+['"]antd…/` — the lazy any-character clause
   can begin at *any* earlier `import` keyword and run to the antd `from`,
   swallowing whole statements. Nearly every file here opens with
   `import type { …Fragment$key } from '…'`, so the captured clause began with
   `type `, hit the `^type\s` guard, and the antd import was skipped. Fixed by
   `[^;'"]*?`, which cannot cross a statement boundary.

Net effect on the numbers (same tree, before → after the parser fix):

| | before | after |
|---|---:|---:|
| RENDER | 61 | **58** |
| type-only | 8 | **4** |
| direct antd | 69 | **64** |

Two files *were* genuinely type-only and are now antd-free:

- `react/src/helper/customThemeConfig.ts` — antd `ThemeConfig` → a local type
  naming the seed tokens the file actually uses (`colorPrimary`, `colorLink`,
  `colorError`, `colorSuccess`, `colorWarning`, `colorInfo`, `fontFamily`) plus
  an open `Record` for arbitrary theme.json tokens and a `components` map. The
  seeds must stay *named* or `theme-shim`'s `seeds={{...token}}` stops
  type-checking; the open `Record` is what lets the existing test pass
  `borderRadius: 4`.
- `react/src/pages/AdminDeploymentPage.tsx` — `CardTabListType` from
  `antd/es/card` → `NonNullable<BAICardProps['tabList']>`. Reuse over
  re-derivation: `BAICard` is already migrated and owns the shape.

The three `FairShareItems/*Alert.tsx` files import `{ Alert, AlertProps }`.
`AlertProps` is deliberately left: splitting it out removes no `from 'antd'`
(the runtime `Alert` stays), moves no gate metric, and would narrow a prop
surface that the `Alert` conversion ticket has to re-type anyway.

Remaining type-only (4), all correct as-is: `locale/index.ts` and
`theme-shim/index.tsx` (contracts, see the checklist), `Chat/ChatInput.tsx`
(`@ant-design/x`), `hooks/reactPaginationQueryOptions.tsx`.

---

## D6 — BUI infrastructure triage (report only)

Full table and the ordered antd-zero path are in
`.scratch/astryx-migration/MERGE-CHECKLIST.md`, which was rewritten against
these measurements. Summary of the 23-file bucket:

- **(a) parked form engine** — `form-engine/index.ts` only. `engine.ts` itself
  is antd-free and no longer appears in the bucket now that comments are
  stripped.
- **(b) deliberate bridge** — the 21 published `locale/*_*.ts` bundles
  (`antd/es/locale/*` feeding `<ConfigProvider locale>` *and*
  `defaultValidateMessages`), `locale/index.ts` and `theme-shim/index.tsx`
  (type-only contracts), `BAIConfigProvider.tsx`.
- **(c) convertible now** — exactly one: `useSchedulingHistoryExpandable.tsx`,
  an antd `Dropdown` + `Tooltip` kebab, ~30 lines, precedent in
  `BAINameActionCell.tsx`.

`tests/storybook-mock-utils.ts` is a scanner-scoping artifact rather than work:
test-only, not exported, not a vite lib entry, taints 0. `EXCLUDE_DIR` covers
`__tests__` but not `tests/`.

The single non-obvious finding is **the hidden prerequisite for unparking the
form engine**: localized `validateMessages`. The only source of localized
`${label}` validation templates today is
`antdLocale.Form.defaultValidateMessages`; `form-engine/messages.ts` ships
English `${name}` fallbacks only. That is ~25 templates × 21 languages, and it
gates both the unpark and the locale-bundle deletion.
