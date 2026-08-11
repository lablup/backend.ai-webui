/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 React contexts for the self-hosted form engine (to-astryx ticket 34).

 Collapses what upstream splits across rc-component's `form` `FieldContext` /
 `FormContext` / `ListContext` and antd's `form/context` (`FormContext`,
 `NoStyleItemContext`, `FormItemInputContext`) into one module, so the
 engine's provider tree is legible in a single read.
 */
import type {
  FieldData,
  FormInstance,
  InternalFormInstance,
  InternalHooks,
  Meta,
  ValidateMessages,
} from './interface';
import type { InternalNamePath } from './namePath';
import * as React from 'react';

/** Guard for `getInternalHooks`; keeps the engine-private API out of reach. */
export const HOOK_MARK = 'BAI_FORM_INTERNAL_HOOKS';

const noop = () => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      '[BAIForm] Field used outside of a <Form>. Wrap it in a Form, or pass an explicit `form` instance.',
    );
  }
  return undefined as any;
};

/**
 * Carries the live `FormInstance` down to every `Field`. Also carries
 * `prefixName`, which is what makes `Form.List` children address their fields
 * RELATIVELY while `dependencies` and `useWatch` stay ABSOLUTE — the
 * asymmetry called out as acceptance test 10.
 */
export const FieldContext = React.createContext<InternalFormInstance>({
  getFieldValue: noop,
  getFieldsValue: noop,
  getFieldError: noop,
  getFieldWarning: noop,
  getFieldsError: noop,
  isFieldsTouched: noop,
  isFieldTouched: noop,
  isFieldValidating: noop,
  isFieldsValidating: noop,
  resetFields: noop,
  setFields: noop,
  setFieldValue: noop,
  setFieldsValue: noop,
  validateFields: noop,
  submit: noop,
  scrollToField: noop,
  focusField: noop,
  getFieldInstance: noop,
  getInternalHooks: () => null,
} as unknown as InternalFormInstance);

export interface ListContextValue {
  /** Map an absolute field path to `[stableKey, restPath]` for the row it belongs to. */
  getKey: (namePath: InternalNamePath) => [React.Key, InternalNamePath];
}

export const ListContext = React.createContext<ListContextValue | null>(null);

// ============================== Form.Provider ===============================

export interface FormProviderContextValue {
  validateMessages?: ValidateMessages;
  triggerFormChange: (
    name: string | undefined,
    changedFields: FieldData[],
  ) => void;
  triggerFormFinish: (name: string | undefined, values: any) => void;
  registerForm: (name: string | undefined, form: FormInstance) => void;
  unregisterForm: (name: string | undefined) => void;
}

export const FormProviderContext =
  React.createContext<FormProviderContextValue>({
    triggerFormChange: () => {},
    triggerFormFinish: () => {},
    registerForm: () => {},
    unregisterForm: () => {},
  });

// ========================= App-level form configuration =====================

export type RequiredMark =
  | boolean
  | 'optional'
  | ((label: React.ReactNode, info: { required: boolean }) => React.ReactNode);

export interface FormConfig {
  /**
   * Locale-aware message templates, `${label}`-based. `FormConfigProvider`
   * defaults them to BUI's own localized table (ticket 35); the engine's
   * built-in defaults use `${name}` and only apply when nothing is provided
   * at all (tests, Storybook, a `<Form>` with no provider above it).
   */
  validateMessages?: ValidateMessages;
  requiredMark?: RequiredMark;
  /**
   * The suffix `requiredMark="optional"` appends (5 call sites). antd read it
   * from `locale.Form.optional`; `FormConfigProvider` defaults it to BUI's own
   * `form.Optional` catalog entry, ported from the same antd strings.
   */
  optionalLabel?: React.ReactNode;
}

/** What antd sourced from `<ConfigProvider form={{...}}>`. */
export const FormConfigContext = React.createContext<FormConfig>({});

// The PROVIDER lives in `./FormConfigProvider.tsx`, not here. It is the one
// piece of the engine that reads BUI's i18next instance, and this module is
// engine core (`Field`, `FormStore`, `FormItem` all import it) — keeping the
// i18n import out of the core is why the two are split.

// ============================ Per-form UI context ===========================

/**
 * What antd carries on its own `FormContext` — the per-form visual settings a
 * `Form.Item` inherits unless it states its own. Everything here is a real
 * `<Form>` prop with a call site in this repo (see
 * `.scratch/astryx-migration/form-prop-census.txt`); the ones with none
 * (`feedbackIcons`, `classNames`, `styles`, `variant`) are deliberately absent.
 */
export interface FormItemLayoutContextValue {
  form?: FormInstance;
  layout: FormLayout;
  requiredMark?: RequiredMark;
  disabled?: boolean;
  name?: string;
  size?: FormSize;
  colon?: boolean;
  labelAlign?: 'left' | 'right';
  labelCol?: FormItemCol;
  wrapperCol?: FormItemCol;
  labelWrap?: boolean;
}

export type FormLayout = 'vertical' | 'horizontal' | 'inline';
export type FormSize = 'small' | 'middle' | 'large';

/** antd `Col` props, reduced to the shapes this repo's call sites use. */
export interface FormItemCol {
  span?: number;
  offset?: number;
  flex?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const FormItemLayoutContext =
  React.createContext<FormItemLayoutContextValue>({
    // antd's default, and now the engine's: 29 `<Form>` call sites declare no
    // `layout` at all, and the three that pair that with `labelCol` only make
    // sense horizontally. Defaulting to vertical silently re-laid all of them.
    layout: 'horizontal',
  });

// ========================== Item status / bubbling ===========================

export interface FormItemStatusContextValue {
  status?: 'success' | 'warning' | 'error' | 'validating' | '';
  errors?: React.ReactNode[];
  warnings?: React.ReactNode[];
  hasFeedback?: boolean;
  isFormItemInput?: boolean;
}

/** Read by `Form.Item.useStatus()` and by BAIFormItem's bridge. */
export const FormItemInputContext =
  React.createContext<FormItemStatusContextValue>({});

export type SubItemMeta = Partial<Meta> & {
  name: InternalNamePath;
  destroy?: boolean;
};

/**
 * How a rendering `Form.Item` collects the errors of the `noStyle` items
 * nested inside it. 25 layout-only items in this repo depend on it; without
 * it their children's messages vanish (answers/08 §3).
 */
export const NoStyleItemContext = React.createContext<
  ((meta: SubItemMeta, uniqueKeys: React.Key[]) => void) | null
>(null);

export type { InternalHooks };
