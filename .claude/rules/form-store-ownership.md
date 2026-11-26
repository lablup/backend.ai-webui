---
description: Reach a form through a ref so the Form owns its store; keep Form.useForm() only when the instance is read during render outside the Form or the input must survive a brief unmount
paths:
  - "react/**/*.{tsx,ts}"
  - "packages/backend.ai-ui/**/*.{tsx,ts}"
---

# Form Store Ownership Rule

Reach a form through a **ref** by default. Keep `Form.useForm()` only for the cases in rule 2.
Decide this first when you write a form, and again when you change one. The decision is
ADR 0040 (`docs/adr/0040-form-store-ownership.md`).

## Why

Whoever creates the form store owns it. With no `form` prop, `<Form>` creates the store
in its own state, so unmounting the `<Form>` drops it and the next mount starts from
`initialValues`. With `form={form}` from `Form.useForm()`, the store lives in the component
that called the hook. When that component stays mounted while the `<Form>` below it remounts
(a modal body, a drawer, a wizard step), the store keeps the previous input, and every key it
already holds ignores the new `initialValues`. A hook inside the content that
`BAIUnmountAfterClose` unmounts is dropped with it; the stale case is a hook above that
boundary.

## Rules

1. **Default: a ref.** `const formRef = useRef<FormInstance<Values>>(null)` and
   `<Form ref={formRef}>`; import `FormInstance` from the same `form-engine` specifier as
   `Form`, at the file's `../` depth (example: `FolderCreateModal.tsx`).
   - Use the ref in handlers that run while the `<Form>` is mounted (submit, `onOk`, a field's
     `onChange`). It is `null` while the `<Form>` is not mounted, so `formRef.current?.…` then
     does nothing, and `await formRef.current?.validateFields()` resolves `undefined`.
   - Data that arrives later goes in through `initialValues`, or through `setFieldsValue` from
     a component rendered inside the `<Form>` (`Form.useFormInstance()`), not from a parent
     effect that can run before the `<Form>` mounts.
2. **Keep `Form.useForm()` only when the instance must sit outside or outlive the `<Form>`:**
   - the declaring component reads it during render, outside the `<Form>`'s context:
     `Form.useWatch(name, form)` there (example: `VFolderDeployModal.tsx`, where the watched
     resource group sets the Deploy button's `disabled`);
   - a child rendered **outside** the `<Form>` reads it while rendering;
   - the input must survive the `<Form>` unmounting for a moment: a `BAIModal` whose `loading`
     swaps the body for `BAISkeleton`, a Suspense boundary that re-suspends, wizard steps
     rendered one at a time.
3. **A read inside the `<Form>` needs no parent instance:**
   - a `Form.Item` with a `shouldUpdate` **comparator**,
     `shouldUpdate={(prev, cur) => prev.type !== cur.type}`. A bare `shouldUpdate` re-renders on
     every store change. `dependencies` alone does not replace `Form.useWatch`: an unnamed item
     with only `dependencies` re-renders on user input but not on `setFieldValue` /
     `setFieldsValue`;
   - a child rendered inside the `<Form>` that calls `Form.useWatch(name)` (no form argument)
     or `Form.useFormInstance()`. Both read the form from context, so do not pass a `form` prop
     into such a child.
4. **A kept `Form.useForm()` owns its lifetime.** When its `<Form>` remounts for a new record,
   put that record's values in with `form.setFieldsValue(values)` in the handler that opens it
   (the parent owns the store, so this works before the `<Form>` mounts), or move the hook into
   the child that unmounts together with its `<Form>` (not for rule 2's brief-unmount case).
   - `form.resetFields()` before the `<Form>` mounts restores the previous mount's
     `initialValues`.
   - Do not use `clearOnDestroy` for this: the engine clears the store in an unmount cleanup,
     which `React.StrictMode` runs right after the first mount in development, and it erases
     input in the brief-unmount case.
5. Do not convert existing `Form.useForm()` call sites in a sweep. Apply this rule to the form
   you are writing or already changing. The rule covers `react/src` and
   `packages/backend.ai-ui/src` alike.

## Pattern

```tsx
// ❌ The parent owns the store, though nothing reads it during render
const [form] = Form.useForm<Values>();
<Form form={form} initialValues={initialValues}>…</Form>;

// ✅ The Form owns the store; handlers reach it through the ref
const formRef = useRef<FormInstance<Values>>(null);
<Form ref={formRef} initialValues={initialValues}>
  <Form.Item name="type">…</Form.Item>
  <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
    {({ getFieldValue }) => (getFieldValue('type') === 'custom' ? <CustomFields /> : null)}
  </Form.Item>
</Form>;
```
