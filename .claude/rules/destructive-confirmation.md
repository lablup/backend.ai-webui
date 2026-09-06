# Destructive Action Confirmation Rule

For **irreversible destructive actions** (permanent deletion, purge, force termination, data wipe), confirmation must be collected through a **modal that requires the user to type a confirmation string** — not an anchored confirm popover, not a plain `modal.confirm`, not a single-click dialog.

## Why

Anchored confirm popovers and one-click confirmation dialogs are appropriate for **reversible or low-impact** actions (inactivating, hiding, unassigning, canceling a draft). For actions the user cannot undo, a single misclick has permanent consequences. Requiring the user to type a specific string (typically the resource's name) forces a deliberate pause and prevents accidental destruction.

This convention was applied project-wide in FR-2479 ("standardize confirmation UX"), which replaced the legacy `PopConfirmWithInput.tsx` with a shared typed-confirmation modal.

> **History — the component names moved, the contract did not.** FR-2479's
> component was `BAIConfirmModalWithInput`; the shipped successor is
> `BAIDeleteConfirmModal` with `requireConfirmInput`. antd was then removed
> from the project entirely, so antd's `Popconfirm` — the reversible-tier
> component this rule used to name — is gone too; the anchored confirm is now
> `BAIPopconfirm` (Astryx `Popover` + a `Button` pair). Both tiers, and
> the boundary between them, are unchanged.

## The components

| Tier | Use | Where |
|---|---|---|
| Irreversible | `BAIDeleteConfirmModal` + `requireConfirmInput` | `backend.ai-ui` (`packages/backend.ai-ui/src/components/BAIDeleteConfirmModal.tsx`) |
| Reversible — anchored | `BAIPopconfirm` | `backend.ai-ui` (`packages/backend.ai-ui/src/components/BAIPopconfirm.tsx`) |
| Reversible — inside a table row | `BAINameActionCell` action's `popConfirm` | `packages/backend.ai-ui/src/components/Table/BAINameActionCell.tsx` |
| Reversible — imperative | `App.useApp().modal.confirm({ … })` | the **app-shim**, `packages/backend.ai-ui/src/app-shim/` |

`modal.confirm` still exists and still has antd's call shape, but it is **not antd** — it comes from the app-shim (`useApp()` / `export const App = { useApp }`), re-exported through `backend.ai-ui`. Import it as `import { App } from '../app-shim'` in `react/src/**`, never `from 'antd'`.

Icons are `lucide-react` glyphs (`Trash2`, `BanIcon`, `UndoIcon`, …). `@ant-design/icons` is gone.

## Rules

1. **Irreversible actions → `BAIDeleteConfirmModal` with `requireConfirmInput`** (from `backend.ai-ui`). The user must type `confirmText` (usually the resource's name) before the danger button enables. Examples: permanently delete a VFolder, terminate a model service endpoint, purge a user, delete an image, delete a resource preset, remove a shell script.
2. **Reversible / low-impact actions → `BAIPopconfirm`**, a `BAINameActionCell` action's `popConfirm`, or `App.useApp().modal.confirm({ … })`. Examples: deactivating (not deleting) a user, canceling an in-progress action, hiding an item, marking inactive, resetting an unsaved form.
3. **Never use an anchored confirm popover for permanent deletion**, even when the action is guarded server-side. The UX contract is about *user intent*, not backend safety.
4. Do **not** reintroduce `PopConfirmWithInput`, `BAIConfirmModalWithInput`, or any ad-hoc "modal with a text input" for destructive flows — use the shared `BAIDeleteConfirmModal`. This keeps the copy, layout, danger styling, and accessibility consistent.
5. The confirmation string should be something the user sees on screen and can copy unambiguously (e.g., the resource's `name` or `id`). Avoid opaque tokens.
6. `BAIDeleteConfirmModal` also serves the reversible tier when the action still deserves a modal (revoking a role assignment, removing a permission): pass `reversible` and it keeps the same layout but renders neither the typed-confirm input nor the "cannot be undone" warning.

## Pattern

### ❌ Wrong — an anchored confirm popover for permanent deletion

```tsx
<BAIPopconfirm
  title={t('dialog.ask.DoYouWantToDeleteSomething', { name: row.name })}
  isDanger
  onConfirm={() => deleteForever(row.id)}
>
  <IconButton icon={<Trash2 size="1em" />} label={t('button.Delete')} variant="destructive" />
</BAIPopconfirm>
```

### ❌ Wrong — single-click `modal.confirm` for permanent deletion

```tsx
const { modal } = App.useApp(); // from '../app-shim'

modal.confirm({
  title: t('dialog.ask.DoYouWantToDeleteSomething', { name: row.name }),
  okButtonProps: { danger: true },
  onOk: () => deleteForever(row.id),
});
```

### ✅ Correct — typed confirmation for permanent deletion

```tsx
import { BAIDeleteConfirmModal } from 'backend.ai-ui';
import { Trash2 } from 'lucide-react';

const [deletingTarget, setDeletingTarget] = useState<Row | null>(null);

// Trigger
<Button
  variant="destructive"
  icon={<Trash2 size="1em" />}
  label={t('button.Delete')}
  onClick={() => setDeletingTarget(row)}
/>

// Modal
<BAIDeleteConfirmModal
  open={!!deletingTarget}
  title={t('resourcePreset.DeleteResourcePreset')}
  target={t('resourcePreset.ResourcePreset')}
  items={
    deletingTarget ? [{ key: deletingTarget.name, label: deletingTarget.name }] : []
  }
  confirmText={deletingTarget?.name ?? ''}
  requireConfirmInput
  onOk={async () => {
    if (deletingTarget) await deleteForever(deletingTarget.id);
    setDeletingTarget(null);
  }}
  onCancel={() => setDeletingTarget(null)}
/>
```

### ✅ Correct — anchored confirm for a reversible action

```tsx
import { BAIPopconfirm } from 'backend.ai-ui';

<BAIPopconfirm
  title={t('dialog.ask.DoYouWantToInactivateSomething', { name: row.name })}
  isDanger
  onConfirm={() => setInactive(row.id)}
>
  <IconButton icon={<BanIcon size="1em" />} label={t('credential.Deactivate')} />
</BAIPopconfirm>
```

`onConfirm` may return a promise — it is handed to Astryx's `clickAction`, which renders the confirm button's pending state, closes the popover on resolve, and keeps it open on reject.

### ✅ Correct — reversible confirm on a table row action

`BAINameActionCell` actions take a `popConfirm` object (`BAIPopconfirmConfig`: `title`, `description`, `okText`, `cancelText`, `okButtonProps.danger`, `onConfirm`, `onCancel`). The visible icon button gets an anchored `Popover` confirm; when the action overflows into the more-menu, it falls back to a `modal.confirm` that mirrors the same copy.

```tsx
// react/src/components/AdminUserCredentialList.tsx
{
  key: 'deactivate',
  title: t('credential.Deactivate'),
  icon: <BanIcon />,
  type: 'danger' as const,
  popConfirm: {
    title: t('credential.DeactivateCredential'),
    description: record.user_id,
    okButtonProps: { danger: true },
    okText: t('credential.Deactivate'),
    cancelText: t('button.Cancel'),
    onConfirm: () => deactivate(record.access_key),
  },
}
```

## How to decide

Ask: *"If the user clicks OK by accident, can they recover the state in <30 seconds without contacting support?"*

- **Yes** → an anchored confirm (`BAIPopconfirm` / `popConfirm`) or `modal.confirm` is fine.
- **No** → `BAIDeleteConfirmModal` with `requireConfirmInput`.

Soft-delete / trash-bin flows count as reversible **only if** the UI actually exposes a restore path the user can reach on their own. If restoration requires admin intervention or database access, treat it as irreversible.

## Verification

- No `import … from 'antd'` and no `@ant-design/icons` glyph in the touched files — antd is not a dependency of this project, so an antd import fails to resolve.
- Every permanent-deletion path opens `BAIDeleteConfirmModal` with `requireConfirmInput` and a `confirmText` the user can read off the screen.
- `packages/backend.ai-ui/src/app-shim/destructiveConfirmFlow.test.tsx` still passes — it asserts the typed-confirm gate (OK disabled until the exact string is typed) end to end.
- `bash scripts/verify.sh` passes.

## Related

- `BAIDeleteConfirmModal` — `packages/backend.ai-ui/src/components/BAIDeleteConfirmModal.tsx`
- `BAIPopconfirm` — `packages/backend.ai-ui/src/components/BAIPopconfirm.tsx`
- `BAINameActionCell` / `BAIPopconfirmConfig` — `packages/backend.ai-ui/src/components/Table/BAINameActionCell.tsx`
- App shim (`App.useApp()`, `message`, `modal`) — `packages/backend.ai-ui/src/app-shim/`
- `component-props-extension.md` — the frozen antd-v6-shaped prop vocabulary section explains why `okButtonProps.danger` and friends still carry antd names on these surfaces
- FR-2479 — the refactor that standardized this convention across the project
