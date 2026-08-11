---
name: react-modal-drawer
description: >
  Use when creating or editing a modal/drawer, adding a form inside one,
  debugging stale state or close-animation issues, or deciding between
  `BAIModal` and `modal.confirm`. Covers `BAIUnmountAfterClose` wrapping,
  `onRequestClose` convention, and id-based open state.
---

# React Modal & Drawer Patterns

Extracted from FR-1343 (#4093), FR-1404 (#4183), FR-502 (#3136),
FR-1673 (#4628), FR-1511 (#4331), FR-1685/1695 (#4656/#4664), and FR-617 (#3294).

## Activation Triggers

- Creating a new modal or drawer component
- Adding a form inside a modal/drawer
- Stale state on reopen, or animation jank on close
- Questions about `BAIUnmountAfterClose`, or `afterOpenChange` vs `afterClose`
- Routing a modal's open state via URL / id state

## Gotchas

- **`BAIUnmountAfterClose` requires a SINGLE child** (`React.Children.only`). Wrap one modal/drawer per wrapper — not a fragment, not two siblings.
- **The wrapper chains `afterClose` / `afterOpenChange`**, so your child's callback still runs. Don't duplicate unmount logic on both sides.
- **`BAIUnmountAfterClose` only works on a child that fires `afterClose` or `afterOpenChange`.** `BAIModal` does; the project's drawer shell (`BAIDrawerAstryx`) does **not** — see §8. Wrapping a drawer in it is a silent no-op that leaves the child mounted forever.
- **`BAIModal` unmounts its children whenever it is closed** — `destroyOnHidden` / `destroyOnClose` are unconditionally on (BAIModal PILOT-DECISION 3) and both props are accepted-and-ignored. Passing them changes nothing; `BAIUnmountAfterClose` is still what unmounts the *component you wrote*, including its hooks and Relay queries.
- **`BAIModal.afterClose` fires from an effect on the `open` transition**, one frame earlier than antd fired it. `BAIUnmountAfterClose` subscribes to it and works unchanged; only hand-written timing assumptions are affected.
- **`modal.confirm({ onOk: async () => { ... } })`**: the loader is shown while pending and rethrows on rejection — always wrap in try/catch inside `onOk`.
- **id-state + `useTransition`**: use `open={!!idState || isPending}` so the modal paints during the transition instead of waiting for the heavy query to resolve.
- **URL-driven modal open (FR-1846 #4921)** still needs `BAIUnmountAfterClose` — reloading while open otherwise reopens with stale query/form state.
- **`BAIModal.loading` shows the built-in skeleton**, separate from any `<Suspense fallback>` inside the body. Don't stack both on the same region.

## 1. Always Wrap with `BAIUnmountAfterClose`

Modals and drawers that own any of the following MUST be wrapped:

- A `<Form>` (state survives close → stale values next open)
- A Relay `useLazyLoadQuery` or subscription
- A mutation's intermediate `useState`
- Any `useState` that isn't reset on close

`BAIUnmountAfterClose` preserves the exit animation then unmounts the child —
so the next open starts with fresh state.

```tsx
import { BAIUnmountAfterClose } from 'backend.ai-ui';

<BAIUnmountAfterClose>
  <PurgeUsersModal
    open={openPurgeUsersModal}
    onOk={...}
    onCancel={...}
    usersFrgmt={_.compact(selectedUserList.map((u) => u?.node))}
  />
</BAIUnmountAfterClose>
```

### How it works (so you don't fight it)

Intercepts the child's `afterClose` (Modal) and `afterOpenChange` (Drawer)
callbacks. If you also provide those callbacks, they still run — the wrapper
chains them.

```tsx
// child can define its own afterClose; wrapper preserves it
<BAIUnmountAfterClose>
  <BAIModal open={open} afterClose={() => doSomething()} />
</BAIUnmountAfterClose>
```

### `destroyOnHidden` is no longer a choice — and it isn't the same thing

Historically `destroyOnHidden` / `destroyOnClose` were antd `Modal` props you
could opt into, and this skill used to warn against them. That decision is now
made for you: `BAIModal` renders **no children at all while closed**
(PILOT-DECISION 3 in `BAIModal.tsx`), which is stricter than antd's default.
Both props are still accepted for call-site compatibility and do nothing.

That does **not** make `BAIUnmountAfterClose` redundant, because the two unmount
different trees:

| | What it unmounts |
|---|---|
| `BAIModal`'s built-in behaviour | the modal's **children** — the body content you passed |
| `BAIUnmountAfterClose` | **your `*Modal` component itself** — its `useState`, its `useLazyLoadQuery`, its `<Form>` instance |

State that lives in the wrapper component (form values, a selected id, an
in-flight mutation's local state) sits *above* the children and survives a
close. Wrapping is what resets it. Keep wrapping.

## 2. `onRequestClose` — the project's close-callback convention

Instead of two separate props `onCancel` / `onOk`, most modal components in
this repo expose a single `onRequestClose(result?)` that distinguishes success
via its argument.

```tsx
interface FolderCreateModalProps extends BAIModalProps {
  onRequestClose: (response?: FolderCreationResponse) => void;
  initialValidate?: boolean;
  initialValues?: Partial<FolderCreateFormItemsType>;
}

// caller
<FolderCreateModal
  open={open}
  onRequestClose={(result) => {
    if (result) updateFetchKey();  // success path
    setOpen(false);
  }}
/>
```

When a modal MUST surface both buttons' intent (e.g. delete flow with different
follow-up), keep the `onOk` / `onCancel` pair — these are real `BAIModal` props
(the surface is antd-`Modal`-shaped by design, see
`.claude/rules/antd-v6-props.md`). PurgeUsersModal does this.

## 3. Open State: by-id beats by-boolean

If a modal depends on a specific record, drive its `open` prop from the id
state instead of a separate boolean. Two fewer `useState`s, and the record
context is always in sync.

```tsx
// ❌ Two useStates drift out of sync
const [openInfo, setOpenInfo] = useState(false);
const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

// ✅ Id IS the open state
const [emailForInfoModal, setEmailForInfoModal] = useState<string | null>(null);

<UserInfoModal
  userEmail={emailForInfoModal || ''}
  open={!!emailForInfoModal}
  onRequestClose={() => setEmailForInfoModal(null)}
/>
```

### 3.1 With `useTransition` for deferred open

When opening a modal would synchronously trigger a heavy query:

```tsx
const [isPending, startTransition] = useTransition();
const [emailForSettingModal, setEmailForSettingModal] = useState<string | null>(null);

<BAIButton
  onClick={() =>
    startTransition(() => setEmailForSettingModal(record.email))
  }
>
  Edit
</BAIButton>

<UserSettingModal
  userEmail={emailForSettingModal}
  open={!!emailForSettingModal || isPending}
  loading={isPending}
  onRequestClose={() => setEmailForSettingModal(null)}
/>
```

`open` stays truthy during the transition so the modal can paint its skeleton
instead of waiting on the heavy query to resolve.

### 3.2 Opening from URL (FR-1846)

If a modal can be opened via query param (e.g. deep-link), drive `open` from
URL state. Use `useQueryStates` with `parseAsString` — see `react-url-state`.

## 4. `afterOpenChange` vs `afterClose`

Both are `BAIModal` props. They no longer ride on a CSS transition-end event —
`BAIModal` fires them from an effect on the `open` transition, so they land a
frame earlier than antd did. Treat them as "open flipped", not "the animation
literally finished".

| Hook | Fires when | Use for |
|---|---|---|
| `afterOpenChange(true)` | Right after `open` flips to `true` | One-shot setup (e.g. `validateFields()` if `initialValidate`) |
| `afterOpenChange(false)` | Right after `open` flips to `false` | Reset local state not in the form |
| `afterClose` | Same transition, no argument | Cleanup callback; this is the one `BAIUnmountAfterClose` subscribes to |

```tsx
<BAIModal
  open={open}
  afterOpenChange={(open) => {
    if (open && initialValidate) {
      formRef.current?.validateFields();
    }
  }}
/>
```

When using `BAIUnmountAfterClose`, your `afterClose`/`afterOpenChange` still run.

## 5. Confirmation Dialogs: `modal.confirm()` for ad-hoc

Don't build a `<BAIModal open>` component for a one-shot "Are you sure?"
prompt. Use `modal.confirm()` from the app-shim's `App.useApp()`.

```tsx
import { App } from '../app-shim';   // NOT 'antd' — see react-async-actions §2

const { modal } = App.useApp();      // { message, modal }

const handleRemoveShare = () => {
  modal.confirm({
    title: t('data.folders.RemoveFolderSharing'),
    content: t('data.folders.RemoveFolderSharingDescription'),
    okButtonProps: { danger: true },
    onOk: async () => {
      await removeSharing();
      message.success(t('data.folders.RemoveFolderSharingSuccess'));
    },
  });
};
```

When the confirmation needs rich content / form / mutation with multi-stage
feedback → then build a proper `*Modal` component.

Reusable confirmation helpers that exist:
- `BAIDeleteConfirmModal` (`backend.ai-ui`) — the delete/destructive flow.
  `requireConfirmInput` adds the type-the-name gate; `reversible` keeps the
  same layout but drops the input and the "cannot be undone" warning.
- `BAIDeleteConfirmModalAstryx` — the `react/src` variant of the same.
- `BAIPopconfirmAstryx` — anchored confirm for reversible, low-impact actions.

`BAIConfirmModalWithInput` no longer exists; `BAIDeleteConfirmModal` absorbed
it. Which tier a given action belongs in is decided by
`.claude/rules/destructive-confirmation.md` — read that before choosing.

## 6. Modal Footer: prefer built-in props, custom `footer` is a last resort

**Default: use the modal's built-in OK/Cancel props.** `BAIModal` already
renders a standard OK + Cancel footer wired to `onOk` / `onCancel` (it builds
the footer itself, on Astryx `LayoutFooter` + `Button`). Customize it through
props before reaching for a custom `footer`:

| Need | Prop |
|---|---|
| Submit handler | `onOk` (async supported) |
| Cancel handler | `onCancel` |
| Submit label | `okText` |
| Cancel label | `cancelText` |
| Submit button loading | `confirmLoading` — bind to the mutation's `isInFlight` / `isPending` |
| Submit button danger / disabled / icon | `okButtonProps` |
| Cancel button styling | `cancelButtonProps` |
| Hide a button | `okButtonProps={{ style: { display: 'none' } }}` or `cancelButtonProps={{ ... }}` |

```tsx
<BAIModal
  open={open}
  title={t('data.CreateFolder')}
  okText={t('data.Create')}
  confirmLoading={isInFlightCreate}
  onOk={async () => {
    await form.validateFields();
    await commitCreate({ variables: form.getFieldsValue() });
    onRequestClose();
  }}
  onCancel={() => onRequestClose()}
>
  {/* body */}
</BAIModal>
```

This keeps button placement, sizing, spacing, and i18n consistent with every
other modal in the app, and `confirmLoading` handles the pending state without
you wiring an action button by hand.

### When to use a custom `footer` (last resort)

Only override `footer` when the built-in props genuinely cannot express the
layout, for example:

- A **third button** beyond OK/Cancel (e.g. a `Reset` on the left).
- A **non-standard layout** (e.g. left-aligned destructive action separated
  from the right-aligned confirm pair).
- A footer that must include **non-button content** (a hint, a checkbox like
  "auto-activate after create", a status badge).

If you do override `footer`, use `BAIFlex` for layout, keep the primary action
rightmost, and use `BAIButton.action` on the submit button so loading state is
automatic. Never pair `action` with `onClick`. (`<Space>` no longer exists —
it left with antd. For a row of buttons that should read as one control,
Astryx's `ButtonGroup` is the equivalent; for plain spacing use `BAIFlex gap`.)

```tsx
footer={
  <BAIFlex justify="between">
    <BAIButton danger onClick={() => formRef.current?.resetFields()}>
      {t('button.Reset')}
    </BAIButton>
    <BAIFlex gap="sm">
      <BAIButton onClick={() => onRequestClose()}>
        {t('button.Cancel')}
      </BAIButton>
      <BAIButton
        type="primary"
        action={async () => { await handleOk(); }}
      >
        {t('data.Create')}
      </BAIButton>
    </BAIFlex>
  </BAIFlex>
}
```

### Anti-pattern: re-implementing the standard footer

Don't hand-roll a `BAIFlex justify="end"` with Cancel + primary buttons inside
the modal body (or as a custom `footer={…}`) when the built-in `onOk` /
`onCancel` / `okText` / `confirmLoading` props cover it. Even if the submit
button uses `BAIButton.action` (so it has a per-click loading state), bypassing
the modal's footer slot still loses the standard footer semantics: position,
sizing, gap, i18n alignment with every other modal, and the
modal-level `confirmLoading` signal that callers expect to drive from the
mutation's `isInFlight` / `isPending`. A modal that looks correct is still
diverging from the project's footer contract.

```tsx
// ❌ Wrong — re-implements the standard footer inside the body
<BAIModal open={open} title={t('...')} footer={null}>
  <FormContent />
  <BAIFlex justify="end" gap="sm">
    <BAIButton onClick={onRequestClose}>{t('button.Cancel')}</BAIButton>
    <BAIButton type="primary" action={handleDeploy}>
      {t('modelStore.Deploy')}
    </BAIButton>
  </BAIFlex>
</BAIModal>

// ✅ Right — props give you the same footer with confirmLoading for free
<BAIModal
  open={open}
  title={t('...')}
  okText={t('modelStore.Deploy')}
  confirmLoading={isInFlightDeploy}
  onOk={handleDeploy}
  onCancel={onRequestClose}
>
  <FormContent />
</BAIModal>
```

## 7. Loading Skeleton While Data Not Ready

If the modal's header depends on a suspended query, use `loading` on the modal
to show the built-in skeleton:

```tsx
<BAIModal
  loading={isFetchingAllowedTypes}
  title={t('data.CreateANewStorageFolder')}
  // ...
/>
```

Inside the body, wrap Relay content in `<Suspense fallback={<Skeleton active />}>`.

## 8. Drawer Specifics

The project's drawer shell is **`BAIDrawerAstryx`**
(`react/src/components/astryx-bui/BAIDrawerAstryx.tsx`, conventionally imported
as `BAIDrawer`). It wraps `Drawer` from `@astryxdesign/lab` and re-creates the
header row (close button + title + `extra`) that antd's `Drawer` used to draw,
so every detail drawer reads the same way.

Its surface is intentionally small — `open`, `onClose`, `title`, `extra`,
`label`, `size`, `side`, `hasScrim`, `hasBodyPadding`, `bodyClassName`,
`headerClassName`:

- **There is no `afterOpenChange` and no `afterClose`.** The old advice to
  detect close via `afterOpenChange(false)` no longer applies.
- **Therefore `BAIUnmountAfterClose` does nothing useful around a drawer.** The
  wrapper unmounts only when the child calls one of those two callbacks; with
  no callback it never fires, and the drawer stays mounted. No drawer in the
  repo is wrapped in it today. To reset a drawer's state, unmount it yourself
  from the parent — the id-state pattern of §3 does this naturally:
  `{selectedId ? <BAIDrawer open onClose={() => setSelectedId(null)} … /> : null}`.
- `label` is required-ish: lab's `Drawer` needs a non-empty accessible name.
  It defaults to `title` when the title is a plain string, so pass `label`
  explicitly whenever `title` is JSX.
- Body padding is a boolean (`hasBodyPadding`), not a `styles.body` object.
  Pass `hasBodyPadding={false}` and pad inside the content instead.

## 9. Cross-Modal Communication

Avoid `useEffect`-driven coordination between sibling modals. Instead:

- Lift the shared state to the parent.
- On child success, call `onRequestClose(result)` — parent decides what to do.
- For data refresh, call `updateFetchKey()` on the parent's `useFetchKey` hook.

## Related Skills

- **`react-form`** — forms inside modals (validators, required markers)
- **`react-url-state`** — opening a modal from URL query params
- **`react-async-actions`** — submit button and feedback inside modal footer
- **`.claude/rules/component-props-extension.md`** — `BAIModalProps` / `BAIDrawerProps` extension pattern
- **`react-suspense-fetching`** — when the modal body owns a Relay query

## 10. Verification Checklist

- [ ] Modals with forms or Relay queries are wrapped in `BAIUnmountAfterClose` (modals only — it is a no-op on `BAIDrawer`; unmount drawers from the parent).
- [ ] Record-bound modals use id-state for `open` (not a separate boolean).
- [ ] Primary submit button uses `BAIButton.action` (not `loading={…}`).
- [ ] `onRequestClose` convention used instead of split `onOk`/`onCancel` when no distinct success-vs-cancel path is needed.
- [ ] Simple confirmations use `modal.confirm()` from the app-shim's `App.useApp()`, not an inline `<BAIModal>`.
- [ ] OK / Cancel are wired through `onOk` / `onCancel` / `okText` / `cancelText` / `okButtonProps` props — custom `footer` only when those genuinely cannot express the layout (extra button, non-button content).
- [ ] Submit pending state goes through `confirmLoading` (bound to the mutation's `isInFlight` / `isPending`), not a hand-rolled `loading` button.
- [ ] When a custom `footer` is justified, it uses `BAIFlex` (or Astryx `ButtonGroup`) and the submit button uses `BAIButton.action`.
- [ ] No `useEffect` chains between parent and modal — prefer lifted state + `onRequestClose`.
