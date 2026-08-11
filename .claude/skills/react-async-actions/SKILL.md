---
name: react-async-actions
description: >
  Use when wiring an async button (submit, delete, save, toggle), batch
  mutation, or showing success/error feedback. Covers `BAIButton.action`,
  `Promise.allSettled` + `_.groupBy`, the app-shim's `App.useApp()`
  (message/modal — there is no `notification` on it), `upsertNotification` for
  long-running work, and `updateFetchKey()` for refresh.
---

# Async Action Handling

Patterns from `UserManagement.tsx` (toggle status / purge / bulk update),
`FolderCreateModal.tsx` (submit + notification), FR-1384 (#4165) graceful
fallback, FR-1494 (#4359, #4353) session notifications, FR-603 (#3270) folder
creation notification, FR-1630 (#4484) invitation error handling.

## Activation Triggers

- Wiring an async button (submit, delete, save, toggle)
- Batch operations across selected items
- Showing success/error feedback after a mutation
- Deciding between `message`, `upsertNotification`, and `modal.error`
- Recovering / displaying structured errors from backend calls

## Gotchas

- **`BAIButton action={async () => { doWork(); }}`** drops loading state — the inner promise isn't returned. Either `await doWork()` or `return doWork()`.
- **`action` + `onClick` on the same `BAIButton`**: `onClick` fires first and synchronously; `action`'s loading state only covers the async half. Don't combine.
- **Menu item `onClick` returning a Promise**: you MUST `resolve()` in every branch including errors — the menu spinner only clears on settle.
- **`App.useApp()` returns `{ message, modal }` — no `notification`.** Destructuring `notification` from it yields `undefined` and blows up at call time. Notifications live behind jotai in `useBAINotification.tsx`; use `useSetBAINotification()` instead (§5).
- **`App.useApp()` never returns `{}`.** It hands back a module-level constant, so it works anywhere, provider or not. What must be mounted is **`<BAIAppProvider>`, once at the app root** (`react/src/components/DefaultProviders.tsx`) — it owns Astryx's `LayerProvider` (the toast viewport) and the imperative-modal host. Without it the calls are silently swallowed because there is nowhere to render.
- **`message.loading` throws on purpose.** Astryx's Toast has no loading concept and the repo had zero call sites, so the app-shim keeps the gap loud rather than faking it. For pending feedback use `BAIButton.action` (§1) or `upsertNotification` (§5).
- **`Promise.allSettled` returns `{ status, value|reason }`.** Use `_.groupBy(results, 'status')` for typed access — don't hand-roll `.filter(r => r.status === 'fulfilled')`.
- **`upsertNotification` with the same `key` replaces** the previous entry (intended for progress updates). Different keys create separate entries; forgetting this creates ghost notifications.
- **`useErrorMessageResolver.getErrorMessage`** only resolves structured `ESMClientErrorResponse`. Raw `Error` / network failures fall through to `.message`.
- **`updateFetchKey()` only refreshes the orchestrator that owns the hook.** Child components with their own `useLazyLoadQuery` don't refresh. Place the fetch key at the right ownership level.

## 1. `BAIButton` with `action` — the only supported async-button pattern

`BAIButton.action` wraps your async callback in a React transition and tracks
the returned promise. It disables the button and shows loading automatically.

```tsx
<BAIButton
  type="primary"
  action={async () => {
    await commitMutation({ variables: { id } });
    updateFetchKey();
  }}
>
  {t('button.Save')}
</BAIButton>
```

### 1.1 Rules

- **Never** pair `action` with `onClick`. Pick one.
- **Never** manage loading manually with `useState` + `onClick`.
- The `action` function must `await` or `return` a promise — don't fire-and-forget.
- `message.success` / error notifications happen **inside** the action, not in
  a separate `.then()` after it returns.

```tsx
// ❌ Manual loading — brittle, races on unmount
const [loading, setLoading] = useState(false);
<Button loading={loading} onClick={async () => {
  setLoading(true);
  await save();
  setLoading(false);
}}>Save</Button>

// ❌ Mixes action + onClick — confusing, loading state covers only `action`
<BAIButton action={save} onClick={() => setExtraState(true)}>Save</BAIButton>

// ✅ Canonical
<BAIButton type="primary" action={async () => { await save(); setExtraState(true); }}>
  Save
</BAIButton>
```

### 1.2 Promise-returning row action (inside a menu item)

Menu items that should block-and-spin until completion can return the promise:

```tsx
actions={[{
  key: 'toggle-status',
  onClick: () => new Promise<void>((resolve) => {
    commitModifyUser({
      variables: { email, props: { status: nextStatus } },
      onCompleted: (res, errors) => {
        if (res.modify_user?.ok === false || errors?.[0]) {
          message.error(res.modify_user?.msg || errors?.[0]?.message || t('error.UnknownError'));
          logger.error(res.modify_user?.msg, errors?.[0]?.message);
          resolve();
          return;
        }
        message.success(t('credential.StatusUpdatedSuccessfully'));
        updateFetchKey();
        resolve();
      },
      onError: (error) => {
        message.error(error?.message);
        logger.error(error);
        resolve();
      },
    });
  }),
}]}
```

Note the **always resolve** pattern — the menu's loading state only clears when
the promise settles, so never throw out of the handler without resolving.

## 2. `message` / `modal` come from the app-shim

```tsx
import { App } from '../app-shim';   // NOT 'antd' — antd is not installed

const { message, modal } = App.useApp();
```

`packages/backend.ai-ui/src/app-shim/` is the project's own replacement for
antd's `App` (host alias: `react/src/app-shim/`, ~116 call sites). It keeps
antd's call shape — `message.success(content, duration?, onClose?)`,
`modal.confirm({ title, content, onOk })` — on top of Astryx's `LayerProvider`
and `useToast`, which is why the migration was a pure import swap. Adjust the
`../` depth to your file.

`App.useApp()` returns a module-level constant, so **it works outside any
provider** — there is no `<App>` context to be missing. What must exist is
`<BAIAppProvider>` mounted once at the app root; it owns the toast viewport and
the imperative-modal host that these calls render into.

The named exports work too — `import { message, modal } from '../app-shim'` is
legitimate, and the shim's own tests use it. `App.useApp()` remains the
convention in components purely because it is what the ~116 existing call sites
read like; there is no context to lose by importing directly.

| Use | Helper | Example |
|---|---|---|
| Confirmation prompt | `modal.confirm` | before a reversible action |
| Destructive delete prompt | `BAIDeleteConfirmModal` | see `.claude/rules/destructive-confirmation.md` |
| Error with details | `modal.error` | backend returned structured failure |
| Inline success | `message.success` | save/update succeeded |
| Inline error | `message.error` | mutation failed |
| Background task update | `upsertNotification` | folder creation, session start (multi-stage) |

`modal` also exposes `info` / `success` / `warning`, and every `modal.*` call
returns a thenable that resolves when the dialog closes.

### 2.1 There is no `notification` on `App.useApp()`

antd's `App` returned `{ message, modal, notification }`; the shim returns
`{ message, modal }`. Notifications were already isolated behind a jotai store
before the migration, so they were deliberately left out of the shim's
contract. Reach for `useSetBAINotification()` (§5) instead — destructuring
`notification` here gets you `undefined`.

### 2.2 `message.success` over `message.info` on success

If it's an "it worked" confirmation, use `message.success`. `message.info` is
reserved for neutral advisory.

This still matters even though Astryx's Toast is only two-tone underneath
(`info` / `error`): `success` and `warning` collapse onto `info` with a leading
glyph inside the shim. Keep calling the semantically correct one — the
collapsing is an implementation detail that a future Astryx Toast extension is
expected to undo.

## 3. Batch operations: `Promise.allSettled` + `_.groupBy`

FR-1384 (#4165) introduced this pattern to handle backends that partially
succeed — always use `Promise.allSettled` for any multi-item mutation.

```tsx
const results = await Promise.allSettled(
  selectedItems.map((item) => mutate(item)),
);

const grouped = _.groupBy(results, 'status') as {
  fulfilled?: PromiseFulfilledResult<T>[];
  rejected?: PromiseRejectedResult[];
};

if (grouped.rejected?.length) {
  const firstReason = grouped.rejected[0].reason;
  message.error(
    t('common.PartialFailure', {
      ok: grouped.fulfilled?.length ?? 0,
      failed: grouped.rejected.length,
      reason: getErrorMessage(firstReason),
    }),
  );
  logger.error('batch partial failure', grouped.rejected);
}
if (grouped.fulfilled?.length) {
  message.success(
    t('common.BatchSucceeded', { count: grouped.fulfilled.length }),
  );
}
updateFetchKey();
```

### Typed helper in repo

```ts
export type StartSessionResults = {
  fulfilled?: PromiseFulfilledResult<SessionCreationSuccess>[];
  rejected?: PromiseRejectedResult[];
};
```

`useStartSession` returns this shape. Reuse that pattern for new hooks that
run multi-item operations.

## 4. Error resolution: `useErrorMessageResolver`

For errors from BAI client calls that come back with a structured
`ESMClientErrorResponse`, resolve the message through the helper:

```tsx
import { useErrorMessageResolver } from 'backend.ai-ui';

const { getErrorMessage } = useErrorMessageResolver();

onError: (error) => {
  message.error(getErrorMessage(error));
  logger.error(error);
}
```

This also handles i18n-aware backend error code mapping. Don't try to
`.message` the raw error — it often loses the structured info.

## 5. Long-running work: `upsertNotification`

For work that outlives the modal (folder provisioning, session start, mount
operations), push an entry into the global notification store instead of
spinning a `message`:

```tsx
import { useSetBAINotification } from '../hooks/useBAINotification';

const { upsertNotification } = useSetBAINotification();

upsertNotification({
  key: `folder-create-success-${result.id}`,  // unique key so progress updates replace
  icon: 'folder',
  message: `${result.name}: ${t('data.folders.FolderCreated')}`,
  toText: t('data.folders.OpenAFolder'),
  to: { search: new URLSearchParams({ folder: result.id }).toString() },
  open: true,
});
```

- `key` is stable across updates — subsequent calls with the same key
  replace the entry (progress bars, stage transitions).
- `to` / `toText` embed a deep-link CTA.
- `open: true` shows the popover; omit for silent insert.

FR-1760 (#4753) removed duplicated onclick handler bindings — when writing
notification `to` links, never attach ad-hoc `onClick` handlers; the stored
route handles navigation.

## 6. Triggering a refetch after mutation

Three levels, from cheapest to heaviest:

### 6.1 Relay store auto-update (preferred)

When a mutation's `updater`/return fields cover the shape the UI reads, Relay
automatically re-renders the affected components. Add the needed fields to the
mutation's selection and trust the store.

### 6.2 `updateFetchKey()` — re-issue the list query

When the mutation changes list-level data (add/remove/rename row):

```tsx
const [fetchKey, updateFetchKey] = useFetchKey();

onCompleted: () => {
  message.success(t('...'));
  updateFetchKey();  // bumps fetchKey → useLazyLoadQuery re-runs
}
```

The orchestrator already wires `fetchKey` into `useLazyLoadQuery`. Don't also
invalidate by router navigation.

### 6.3 Imperative `fetchQuery` for side-effects outside the current query

When you need latest data but the current component doesn't own the query
(e.g. BAINotification callback):

```tsx
fetchQuery<MyQuery>(relayEnv, graphql`...`, { id: globalId })
  .toPromise()
  .then((result) => {
    // Relay store updates automatically for matched node IDs
  });
```

## 7. Don't swallow errors

`.catch(() => {})` and empty catch blocks are banned (security scanner flags
them, FR-1748). Either:

```tsx
// ✅ explicit ignore with a return
try { await thing(); } catch { return undefined; }

// ✅ log + surface
try { await thing(); } catch (e) {
  logger.error('thing failed', e);
  message.error(getErrorMessage(e));
}
```

FR-1748 (#4740) scanned the repo for empty catches and removed them. Don't
bring them back.

## Related Skills

- **`react-form`** — submit handler and form validation
- **`react-modal-drawer`** — submit button inside modal footer
- **`react-suspense-fetching`** — `updateFetchKey()` to trigger orchestrator refetch
- **`relay-patterns`** — mutation updater and optimistic responses
- **`react-relay-table`** — row-level and bulk-action buttons bound to a table

## 8. Verification Checklist

- [ ] Every async button uses `BAIButton.action`, not `onClick + loading`.
- [ ] `action` is never combined with `onClick` on the same `BAIButton`.
- [ ] Batch mutations use `Promise.allSettled` + `_.groupBy(results, 'status')`.
- [ ] Errors flow through `useErrorMessageResolver.getErrorMessage` before hitting `message.error`.
- [ ] Long-running work uses `upsertNotification` with a stable `key`; not a dangling `message`.
- [ ] Mutations end in `updateFetchKey()` when they change list-level data.
- [ ] Success feedback uses `message.success`, not `message.info`.
- [ ] No empty `catch` blocks; no direct `console.*` calls — `useBAILogger`.
