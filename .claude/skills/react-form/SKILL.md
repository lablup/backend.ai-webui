---
name: react-form
description: >
  Use when writing or editing components that use `antd` `Form`/`Form.Item`,
  adding `rules` validators, extracting grouped `*FormItems`, or migrating
  `setValue` callback props to `onChange`. Covers `initialValues` vs
  `defaultValue`, required markers, and cross-field validation.
---

# React Form Patterns

Patterns for `antd` forms in backend.ai-webui, distilled from
`FolderCreateModal.tsx`, `UserSettingModal.tsx`,
`ResourceAllocationFormItems.tsx`, and FR-1720 / FR-701 / FR-1260 / FR-1671.

## Activation Triggers

- Adding or modifying a `<Form>` / `<Form.Item>`
- Writing async or cross-field validators
- Extracting a reusable `*FormItems` component
- Migrating `setValue` prop callbacks to `onChange`
- Questions about `initialValues` vs `defaultValue`, `requiredMark`, or `Form.useForm`

## Gotchas

- **`defaultValue` on `Form.Item` silently overrides** antd's controlled value (FR-1260 #3976). Always use `<Form initialValues={...}>`.
- **`required` prop is a visual marker**, not a validation rule by itself. Pair with explicit `rules={[{ required: true, message: t('...') }]}` or a validator that rejects empty values.
- **`validateFields()` on every `onChange`** causes render storms. Trigger validation only on dependent-field changes and only when the target field has a value (see FolderCreateModal's `usage_mode` handler).
- **`Form.useForm()` + `useRef<FormInstance>` in the same form** race — antd binds to only one. Pick one per form.
- **`initialValues` is shallow-merged.** Nested objects replace entirely; `{ a: { b: 1 } }` does NOT merge with `{ a: { c: 2 } }`.
- **`warningOnly: true` validators don't block submit** — `validateFields()` still resolves. Useful for soft nudges; don't rely on them as required rules.
- **`dependencies={[...]}` re-runs the CURRENT item's validator**, not the dependent field's. If both need cross-validation, put validators on both sides.
- **`<BAIButton action={async () => { handleOk(); }}>`** (without `await` or `return`) drops loading state — the promise isn't tracked.

## 1. Form Instance: Ref vs `Form.useForm`

Two supported patterns — pick based on who needs to control the form.

### 1.1 Local form: `useRef<FormInstance>` (preferred for simple modals)

```tsx
const formRef = useRef<FormInstance>(null);

<Form ref={formRef} initialValues={initialValues}>
  <Form.Item name="name" rules={[...]}>
    <Input />
  </Form.Item>
</Form>

// Trigger validation / reset from handlers
await formRef.current?.validateFields();
formRef.current?.resetFields();
```

### 1.2 Shared form: `Form.useForm()` when child components need access

```tsx
const [form] = Form.useForm();
// pass `form` to Form and children that need `form.getFieldValue(...)` / `form.setFieldsValue(...)`
```

Don't mix both in the same form. `formRef` wins for modal-scoped forms because
state naturally unmounts with the modal.

## 2. `initialValues` — never `defaultValue` on `Form.Item`

FR-1260 (#3976) removed `defaultValue` from `Form.Item` because it conflicts
with the controlled value antd injects. Always set initial values on `<Form>`.

```tsx
// ❌ Bad — stale value once the form is controlled
<Form.Item name="host" defaultValue="default">
  <StorageSelect />
</Form.Item>

// ✅ Good
<Form initialValues={{ host: 'default' }}>
  <Form.Item name="host">
    <StorageSelect />
  </Form.Item>
</Form>
```

### Merging with prop-provided initial values

```tsx
const INITIAL_FORM_VALUES: FolderCreateFormItemsType = {
  name: '',
  host: undefined,
  group: currentProject.id || undefined,
  usage_mode: 'general',
  type: 'user',
  permission: 'rw',
  cloneable: false,
};

const mergedInitialValues = {
  ...INITIAL_FORM_VALUES,
  ...initialValuesFromProps,
};
```

## 3. Validators: Prefer `rules` over manual validation in handlers

Use antd's `rules` array for every validation concern — pattern, length,
required, cross-field, async. The handler just calls `validateFields()`.

### 3.1 Cross-field validator via `({ getFieldValue })`

```tsx
<Form.Item
  name="name"
  rules={[
    { pattern: /^[a-zA-Z0-9-_.]+$/, message: t('data.AllowsLettersNumbersAnd-_Dot') },
    { max: 64, message: t('data.FolderNameTooLong') },
    ({ getFieldValue }) => ({
      validator(_rule, value) {
        if (_.isEmpty(value)) {
          return Promise.reject(new Error(t('data.FolderNameRequired')));
        }
        if (
          getFieldValue('usage_mode') === 'automount' &&
          !_.startsWith(value, '.')
        ) {
          return Promise.reject(
            new Error(t('data.AutomountFolderNameMustStartWithDot')),
          );
        }
        return Promise.resolve();
      },
    }),
  ]}
>
  <Input placeholder={t('maxLength.64chars')} />
</Form.Item>
```

### 3.2 Warning-only validator

Use `warningOnly: true` for soft warnings that don't block submission:

```tsx
{
  warningOnly: true,
  validator: async (__, value) => {
    if (!shouldDisableProject && value === 'project') {
      return Promise.reject(
        new Error(t('data.folders.ProjectFolderCreationHelp', {
          projectName: currentProject?.name,
        })),
      );
    }
    return Promise.resolve();
  },
}
```

### 3.3 Validating on open

If the modal opens with `initialValidate`, kick validation once the transition finishes:

```tsx
<BAIModal
  afterOpenChange={(open) => {
    if (open && initialValidate) {
      formRef.current?.validateFields();
    }
  }}
/>
```

Do **not** call `validateFields()` synchronously on every field change — it
causes re-render storms. FolderCreateModal only validates `name` on
`usage_mode` change if `name` already has a value:

```tsx
<Radio.Group
  onChange={() => {
    if (formRef.current?.getFieldValue('name')) {
      formRef.current.validateFields(['name']);
    }
  }}
/>
```

## 4. Required Indicators

### 4.1 Mark every required field with `required` (FR-1671)

FR-1671 (#4624) fixed missing `required` indicators. Every field that is
validated as required must also carry the `required` prop on `Form.Item` so the
label shows the indicator — otherwise the UI lies.

```tsx
// ✅
<Form.Item
  label={t('data.Foldername')}
  name="name"
  required
  rules={[ /* … */ ]}
>
  <Input />
</Form.Item>
```

### 4.2 Hide the default `*` marker when the label layout differs

```tsx
// Custom label styling — hide the default `::after` asterisk
.ant-form-item-label > label::after { display: none !important; }
```

### 4.3 `requiredMark={false}` at the `<Form>` level

When every visible field is optional or you show your own indicator pattern,
set `requiredMark={false}` on the `<Form>`.

## 5. `hidden` Field Control

For conditional rendering of fields driven by props, prefer `hidden` over
conditional rendering so form state remains consistent.

```tsx
type HiddenFormItemsType =
  | keyof FolderCreateFormItemsType
  | 'usage_mode_general'
  | 'usage_mode_model'
  | 'type_user'
  | 'type_project';

<Form.Item name="host" required hidden={_.includes(hiddenFormItems, 'host')}>
  <StorageSelect />
</Form.Item>
```

## 6. `onChange` Callback Convention (not `setValue`)

FR-1720 (#4849) standardized this. Always expose `onChange` on component-level
callback props — matches Ant Design and HTML form conventions.

```tsx
// ❌
interface SettingItemProps {
  setValue?: (v: string) => void;
}

// ✅
interface SettingItemProps {
  onChange?: (value: string) => void;
}
```

For discriminated variants, each branch overrides the `onChange` signature:

```tsx
type CheckboxSettingItemProps = Base & {
  type: 'checkbox';
  onChange?: (value?: boolean) => void;
};
type SelectSettingItemProps = Base & {
  type: 'select';
  onChange?: (value?: string) => void;
};
```

## 7. Submit Path

### 7.1 Validate → mutate → notify

```tsx
const handleOk = async () => {
  await formRef.current
    ?.validateFields()
    .then((values) => {
      return mutationToCreateFolder.mutateAsync(values, {
        onSuccess: (result) => {
          upsertNotification({ /* … */ });
          onRequestClose(result);
        },
        onError: (error) => {
          message.error(getErrorMessage(error));
        },
      });
    })
    .catch((error) => logger.error(error));
};
```

### 7.2 Button wiring — always `action`, never `onClick + isLoading`

```tsx
<BAIButton
  type="primary"
  action={async () => {
    await handleOk();
  }}
>
  {t('data.Create')}
</BAIButton>
```

See `react-async-actions` for the full `BAIButton.action` contract.

## 8. Extracting Grouped `*FormItems`

When a cluster of fields is reused or dominated by cross-field logic, extract
as `*FormItems` — a component that returns JSX, doesn't own the `<Form>`.

Examples in repo: `ResourceAllocationFormItems`, `SharedMemoryFormItems`
(FR-1492 #4303), `PortSelectFormItem`.

```tsx
// parent: owns Form
<Form ref={formRef} initialValues={...}>
  <ResourceAllocationFormItems />   {/* renders Form.Items inside */}
  <SharedMemoryFormItems />
</Form>
```

Guidelines:
- `*FormItems` components use `Form.useFormInstance()` or field path
  conventions — they do NOT own a `<Form>`.
- Group by **concern**, not by size. A cluster that shares `dependencies` or
  validators is a good candidate.
- Export a constant of initial values (`RESOURCE_ALLOCATION_INITIAL_FORM_VALUES`)
  so parents can spread it into `initialValues`.

## 9. Inline Slider / Number Edge Cases (FR-701)

For numeric sliders and inputs that accept `"0"` / negative values by
mistake, handle the unexpected input at the form level rather than the
component level. Don't scatter `if (value < 0) …` across useEffects — clamp in
the slider's props and validate via `rules`.

## Related Skills

- **`react-modal-drawer`** — form-in-modal patterns (`BAIUnmountAfterClose`, `onRequestClose`)
- **`react-async-actions`** — submit button `BAIButton.action`, error resolution, notifications
- **`react-component-basics`** — file skeleton and prop-interface conventions
- **`react-layout`** — form footer and field-row layout with `BAIFlex`

## 10. Verification Checklist

- [ ] No `defaultValue` on `Form.Item`; use `<Form initialValues={...}>`.
- [ ] Every required field has `required` on `Form.Item` (FR-1671).
- [ ] Validators live in `rules`, not in submit handlers.
- [ ] No `setValue` prop names on new components — use `onChange`.
- [ ] Submit button uses `BAIButton` with `action`, not manual `loading` state.
- [ ] `validateFields()` is called in handlers, not synchronously in every `onChange`.
- [ ] i18n strings for all `message` fields in `rules` and placeholders.
