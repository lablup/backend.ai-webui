# QA round 2 — agent D · Chat composer + `@ant-design/x` removal

Scope: `react/src/components/Chat/*`, `react/src/helper/index.tsx`, the
`@ant-design/x` dependency, and the e2e locators that were coupled to it.

## Outcome

`@ant-design/x` is gone. It was the last **carrier package** in
`REMAINDER.md` bucket 3 — the one dependency that put `antd` (peer),
`@ant-design/icons`, `@ant-design/cssinjs`, `@ant-design/colors` and
`@rc-component/*` into the production graph regardless of how much
first-party code got converted.

```
$ pnpm why @ant-design/x
(empty)

$ pnpm why antd
antd@6.5.0
├── backend-ai-webui-react@26.8.0-alpha.0 (dependencies)
└── backend.ai-ui@26.8.0-alpha.0 (dependencies)
```

`antd` remains only as a **first-party direct dependency** of the two
workspaces (the parked Form engine). That is the expected end state for this
ticket: the carrier is removed, not antd itself. `pnpm install` dropped 82
packages.

## The premise that changed

The old `ChatSender.tsx` header carried a FRONTIER note from ticket 23:

> `Attachments` and `Sender` … neither has an Astryx equivalent (NONE verdict
> by inspection: no chat-composer or file-dropzone component in
> `@astryxdesign/core`).

That is no longer true at Astryx **0.3.0**, which ships a first-class chat
family under `@astryxdesign/core/Chat`:

| Astryx component | Replaces |
|---|---|
| `ChatComposer` | `Sender` (layout shell, submit/stop, status, slots) |
| `ChatComposerInput` | `Sender`'s auto-growing input (Enter/Shift+Enter, IME guard, paste-file handling) |
| `ChatComposerDrawer` | `Sender.Header` (collapsible panel above the input, with a count badge) |
| `ChatSendButton` | `Sender`'s send/stop toggle |
| `Thumbnail` / `Token` | `Attachments`' file items and `FileCard` |

So the composer was **rebuilt on the shipped pattern** rather than
hand-composed out of `TextArea` + `InputGroup` + `IconButton`. Discovery:
`astryx search "chat"`, `astryx component ChatComposer`,
`astryx template ChatComposerFullFeatured`, `astryx template
ChatComposerAttachments`.

## Composition

```
ChatComposer  (value / onChange / onSubmit / onStop / isStopShown / isDisabled,
               elevation="none")
├── headerActions : hidden <input type="file"> + IconButton(paperclip)
├── drawer        : ChatComposerDrawer(count, label, isCollapsed)
│                     ├── Thumbnail(onRemove)   — image attachments
│                     └── Token(icon, onRemove) — everything else
├── input         : ChatComposerInput(handleRef, label, hasHistory=false,
│                                     pasteAsToken=false, onFiles)
└── sendButton    : ChatSendButton(isStopShown, isDisabled=!canSend, onSend, onStop)
```

## Functionality parity

| Behavior | Legacy (`@ant-design/x`) | Now | Status |
|---|---|---|---|
| Send on Enter | `Sender submitType="enter"` | `ChatComposerInput` Enter handler | **kept** |
| Shift+Enter newline | `Sender` | `ChatComposerInput` (Enter only fires without Shift) | **kept** |
| IME-safe Enter | rc-textarea composition guard | `isComposing` / keyCode 229 guard | **kept** (better: explicit) |
| Send button enablement | non-empty text | non-empty text **or** ≥1 attachment | **kept** (explicit `isDisabled`, since Astryx's context `canSend` is text-only) |
| Stop while streaming | `Sender loading` → cancel | `isStopShown` + `onStop`; stop stays clickable while `isDisabled` | **kept** |
| Disabled composer | `Sender disabled` | `ChatComposer isDisabled` | **kept** |
| Autofocus | `senderRef.current.focus()` | `ChatComposerInput handleRef.focus()` | **kept** |
| Attach via button | `Attachments` prefix + `Badge dot` | paperclip `IconButton` → hidden `<input type="file">`; the drawer's own count badge replaces the dot | **kept** (simplified) |
| Attach via paste | rc-upload paste | `ChatComposerInput onFiles` | **kept** |
| Attach via drag-drop onto the whole card | `getDropContainer` | native `dragover`/`drop` listeners on the same `dropContainerRef` | **kept** |
| "Drop file here" full-card overlay | `Attachments placeholder(type==='drop')` | — | **DROPPED**, see PILOT-DECISION 1 |
| Remove an attachment | `Attachments` item close button | `Thumbnail onRemove` / `Token onRemove` | **kept** |
| Image preview of a pending attachment | `Attachments` thumbnail | `Thumbnail` + object URL (revoked on change) | **kept** |
| Attachment panel open/collapse | `Sender.Header open/onOpenChange` | `ChatComposerDrawer isCollapsed/onCollapsedChange` | **kept** |
| Cross-pane sync of text + attachments | jotai atoms over `UploadFile[]` | same atoms over plain `File[]` | **kept** (simpler payload) |
| Sent-message file bubble | `FileCard` | `Token` (icon + name + `href`) | **kept**, see PILOT-DECISION 2 |
| Token counter placement | `ChatMessages` overlay | unchanged | **kept** |
| ArrowUp/Down message recall | not present | disabled (`hasHistory={false}`) | **not adopted**, PILOT-DECISION 3 |
| Long paste → chip | not present | disabled (`pasteAsToken={false}`) | **not adopted**, PILOT-DECISION 3 |

## PILOT-DECISIONs

### 1. The full-card "Drop file here" drag overlay is dropped; the drop target is kept.

`Attachments` rendered a full-bleed overlay with a `DropFileHere` title
whenever a file was dragged anywhere over the chat card. Astryx has no
overlay drop-zone primitive: `FileInput mode="dropzone"` is a *persistent
labelled field*, not a transient overlay, and `Overlay` is for media
surfaces. Reproducing the affordance means hand-rolling drag-state chrome and
absolute positioning inside a card that is `display:flex; overflow:hidden` —
disproportionate, and exactly the kind of bespoke CSS this migration is
removing.

What is kept is the *function*: `dropContainerRef` still plumbs the chat card
down to the composer, which attaches native `dragover`/`drop` listeners to
it. Dropping files anywhere on the card still attaches them, and the feedback
is the drawer expanding with the new tokens/thumbnails. The
`chatui.DropFileHere` / `chatui.UploadFilesDescription` i18n keys are now
unused; left in place rather than churning 22 locale files.

### 2. `FileCard` → `Token` in sent messages.

`@ant-design/x`'s `FileCard` (icon + name + description + download link) has
no Astryx card equivalent. `Token` carries the same three affordances —
leading icon, file name, `href` to the attachment — in a smaller,
list-friendly shape that sits better inside a message bubble. The redundant
`description` (the call site passed the file name twice) is dropped; the
name is still the accessible description.

### 3. Astryx composer features the legacy surface never had stay off.

`ChatComposerInput` defaults to ArrowUp/Down message recall
(`hasHistory`) and to converting any paste over 200 characters into a
collapsed chip (`pasteAsToken`). Neither existed in the `Sender` this
replaces, and both change muscle memory in a pane where users routinely paste
long prompts. Both are explicitly disabled, so this is a like-for-like
composer. They are one prop away if the team wants them later.

### 4. The composer input is now a `contenteditable` div, so the e2e locators moved.

`ChatComposerInput` renders its placeholder as an `aria-hidden` sibling, not
a `placeholder` attribute, and its editable surface is a `div`, not a
`textarea`. Three consequences for `e2e/chat/`:

- `getByPlaceholder('Type your message here...')` → `getByLabel(...)`. The
  input is given `label={t('chatui.SenderPlaceholder')}`, so the accessible
  name and the visible hint are the same string and the locator text is
  unchanged.
- `toHaveValue(x)` → `toHaveText(x)` (13 assertions in `chat-sync.spec.ts`
  and `chat.spec.ts`).
- `toBeEnabled()` / `toBeDisabled()` → `toHaveAttribute('contenteditable',
  'true' | 'false')`. This matters: `toBeEnabled()` on a non-form element is
  vacuously true, so leaving it would have turned
  `chat-attachment.spec.ts`'s readiness barrier into a silent no-op.

`input[type="file"]` locators are unchanged — the picker is still a hidden
native input.

### 5. Two layout facts the swap exposed (both measured live, then fixed).

- **`ChatInput`'s wrapper had `align="center"`.** `Sender` was `width: 100%`
  by default, so centring it was invisible. `ChatComposer` sizes to its
  content, so under `align-items: center` it collapsed to **64px wide**
  (measured in the DOM). The wrapper is now `align="stretch"`; the composer
  measures 1230px in the same layout.
- **The composer is taller than `Sender` was** (drawer + header row + input +
  footer row vs. one input row), and a chat pane is vertically tight — several
  panes sit side by side in compare mode. Two adjustments: `density="compact"`,
  and the attach button moved from `headerActions` to `footerActions`, which
  removes the 28px header row entirely and puts attach and send on the same
  line (the shape most chat composers use). Composer body: 82px at rest.

### 6. `createDataTransferFiles()` deleted from `react/src/helper/index.tsx`.

It existed only to convert `UploadFile[]` back into a `FileList` and had
**zero call sites** (verified across the whole repo). It was also the sole
reason `helper/index.tsx` — a 380-file taint hub — appeared in `REMAINDER.md`
bucket 2. Deleting it closes that file. `ChatInput` now carries plain
`File[]` end to end, so nothing needs the conversion.

### 7. `CARRIER_PACKAGES` in the remainder gate is now empty, not deleted.

`scripts/migration-gates/antd-remainder-report.mjs` hard-codes the carrier
list ("listed explicitly rather than derived, because the derivation is what
makes them interesting"). The `@ant-design/x` entry is removed and the array
kept, with both renderers taught to say "none" — so a future carrier can be
recorded the same way instead of the bucket silently disappearing.

## Gate results

| Gate | Result |
|---|---|
| `pnpm why @ant-design/x` | empty |
| `node scripts/migration-gates/antd-remainder-report.mjs` | `CARRIER PACKAGES: (none)`; render 46 → 44 files, type-only 5 → 3 |
| `bash scripts/verify.sh` | `=== ALL PASS ===` |
| `react` vitest | 63 files / 1168 tests passed |
| `backend.ai-ui` vitest | 22 files / 446 passed, 1 skipped |
| `pnpm run build:react-only` | PASS |

## Live proof

`node .scratch/astryx-migration/qa2-d-chat.mjs` (dev server on 5940, cluster
`10.82.0.130:8090`). Screenshots in `.scratch/astryx-migration/shots/qa2-d/`,
raw assertions in `shots/qa2-d/results.json`.

The cluster's only deployment reports "Endpoint URL is not valid.", so there
is no served model to talk to. The script therefore runs two passes:

- **Unmocked** (`light-00-composer-disabled.png`) — the genuinely disabled
  composer: `contenteditable="false"`, dimmed body, dimmed send and attach
  buttons, error banner above.
- **Mocked** — `endpointUrl` is rewritten in the GraphQL response to a fake
  origin whose `/models` and completions endpoints Playwright fulfills. Every
  composer assertion then passes in **light and dark**: `contenteditable`
  flips to `true`, typing round-trips, Shift+Enter keeps the first line and
  adds a second without submitting, the attachment appears in the drawer as a
  removable `Thumbnail`, removal empties the drawer, Enter clears the composer,
  and both the user message and the streamed assistant reply land in the
  thread.

**`pageErrors: []` on every pass.** The console errors that remain are
pre-existing and unrelated (Google Fonts CSP, Relay `Group`/`UserGroup`
`__typename` warnings, one 404).

`qa2-d-measure.mjs` is the DOM measurement that produced the two layout facts
in PILOT-DECISION 5.

---

## QA3 follow-up — the composer was clipped by its card

User report after QA2 merged: on the Chat page the composer is cut off at the
bottom of the card. Reproduced at 1440x900 (`shots/qa3/chat-before-default.png`)
— the send button is sliced in half by the card edge.

### Root cause: `height: 100%` on a flex sibling

Measured chain (`shots/qa3-chat-probe.mjs`, viewport 900):

```
astryx-stack (VStack, overflow:hidden)  top=220 bottom=864  clientH=644 scrollH=692
  HStack (title row)                    top=220             h=48
  BAIFlex (chat column, height:100%)    top=268 bottom=912  h=644
    astryx-card (ChatCard)              top=268 bottom=912
      astryx-chat-composer              top=825 bottom=899   <- past 864
```

`scrollH - clientH = 48px`, exactly the title row's height. The chat column is
a flex child of the `VStack` and asked for `height: 100%`. A percentage height
resolves against the *container*, not against what is left after the siblings,
so the column claimed the VStack's full 644px on top of the 48px title row and
overflowed by precisely that much. The VStack's `overflow: hidden` then ate the
bottom 48px — which is where the composer lives.

This is not new to the Astryx composer; the old `@ant-design/x` `Sender` was
short enough that the 48px it lost fell in its own bottom padding. The taller
composer just made a long-standing budget error visible.

### Fix — at the layout-composition level, three files

- `ChatPage.tsx` — the chat column and the `VStack` itself go from
  `height: '100%'` to `flex: 1` + `minHeight: 0`. Growing into the space that
  is actually left is the only sizing that stays correct when a sibling exists.
- `ChatCard.tsx` — the messages/composer column drops the vestigial
  `height: '50%'` for `minHeight: 0`, so the virtualized list's min-content
  height cannot push the composer through the card's `overflow: hidden`.
- `ChatMessages.tsx` — `minHeight: 0` on the transcript pane, so it is the pane
  that absorbs shrink.
- `ChatInput.tsx` — `flexShrink: 0` on the composer row (the one control that
  must never be compressed), plus `maxHeight: 60%` + `overflowY: auto` so a
  large attachment set scrolls instead of starving the transcript.

The composer itself is untouched — no shrinking, no density change.

### Verification

`node .scratch/astryx-migration/shots/qa3-chat-measure.mjs` — **8/8 states fit,
0 pageerrors**: {900, 700} x {light, dark} x {plain, attachment drawer open}.
In every state `stackOverflow = 0px` and the composer's bottom edge sits 11px
*above* the card's clipping edge.

`shots/qa3/chat-after-attached-700-light.png` is the tight case: 700px viewport
with the attachment drawer open — the drawer, the input, the attach button and
the send button are all fully inside the card, and the transcript pane gave up
the height.
