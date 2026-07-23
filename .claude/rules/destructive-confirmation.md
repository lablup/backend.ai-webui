# Destructive Action Confirmation Rule

For **irreversible destructive actions** (permanent deletion, purge, force termination, data wipe), confirmation must be collected through a **modal that requires the user to type a confirmation string** — not a `Popconfirm`, not a plain `Modal.confirm`, not a single-click dialog.

## Why

Popconfirm and one-click confirmation dialogs are appropriate for **reversible or low-impact** actions (inactivating, hiding, unassigning, canceling a draft). For actions the user cannot undo, a single misclick has permanent consequences. Requiring the user to type a specific string (typically the resource's name) forces a deliberate pause and prevents accidental destruction.

This convention was applied project-wide in FR-2479 ("standardize confirmation UX"), which replaced the legacy `PopConfirmWithInput.tsx` with the shared `BAIConfirmModalWithInput` component.

## Rules

1. **Irreversible actions → `BAIConfirmModalWithInput`** (from `backend.ai-ui`). The user must type a confirmation string (usually the resource's name) before the OK button enables. Examples: permanently delete a VFolder, terminate a model service endpoint, purge a user, delete an image, delete a resource preset, remove a shell script.
2. **Reversible / low-impact actions → `Popconfirm`** or `App.useApp().modal.confirm({ ... })`. Examples: deactivating (not deleting) a user, canceling an in-progress action, hiding an item, marking inactive.
3. **Never use `Popconfirm` for permanent deletion**, even when the action is guarded server-side. The UX contract is about *user intent*, not backend safety.
4. Do **not** reintroduce `PopConfirmWithInput` or any ad-hoc "modal with a text input" for destructive flows — use the shared `BAIConfirmModalWithInput`. This keeps the copy, layout, danger styling, and accessibility consistent.
5. The confirmation string should be something the user sees on screen and can copy unambiguously (e.g., the resource's `name` or `id`). Avoid opaque tokens.

## Pattern

### ❌ Wrong — Popconfirm for permanent deletion

```tsx
<Popconfirm
  title={t('dialog.ask.DoYouWantToDeleteSomething', { name: row.name })}
  onConfirm={() => deleteForever(row.id)}
>
  <Button danger icon={<DeleteOutlined />} />
</Popconfirm>
```

### ❌ Wrong — single-click `modal.confirm` for permanent deletion

```tsx
modal.confirm({
  title: t('dialog.ask.DoYouWantToDeleteSomething', { name: row.name }),
  okButtonProps: { danger: true },
  onOk: () => deleteForever(row.id),
});
```

### ✅ Correct — typed confirmation for permanent deletion

```tsx
import { BAIConfirmModalWithInput } from 'backend.ai-ui';

const [deletingTarget, setDeletingTarget] = useState<Row | null>(null);

// Trigger
<Button
  danger
  icon={<DeleteOutlined />}
  onClick={() => setDeletingTarget(row)}
/>

// Modal
<BAIConfirmModalWithInput
  open={!!deletingTarget}
  title={t('dialog.ask.PermanentlyDeleteSomething', { name: deletingTarget?.name })}
  content={t('dialog.warning.CannotBeUndone')}
  confirmText={deletingTarget?.name ?? ''}
  okText={t('button.Delete')}
  onOk={async () => {
    if (deletingTarget) await deleteForever(deletingTarget.id);
    setDeletingTarget(null);
  }}
  onCancel={() => setDeletingTarget(null)}
/>
```

### ✅ Correct — `Popconfirm` for reversible actions

```tsx
<Popconfirm
  title={t('dialog.ask.DoYouWantToInactivateSomething', { name: row.name })}
  onConfirm={() => setInactive(row.id)}
>
  <Button icon={<StopOutlined />} />
</Popconfirm>
```

## How to decide

Ask: *"If the user clicks OK by accident, can they recover the state in <30 seconds without contacting support?"*

- **Yes** → `Popconfirm` / `modal.confirm` is fine.
- **No** → `BAIConfirmModalWithInput`.

Soft-delete / trash-bin flows count as reversible **only if** the UI actually exposes a restore path the user can reach on their own. If restoration requires admin intervention or database access, treat it as irreversible.

## Related

- `BAIConfirmModalWithInput` — `packages/backend.ai-ui/src/components/BAIConfirmModalWithInput.tsx`
- `BAIDeleteConfirmModal` — higher-level convenience wrapper for common delete flows
- FR-2479 — the refactor that standardized this convention across the project
