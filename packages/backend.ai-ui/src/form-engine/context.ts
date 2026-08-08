/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 React contexts for the self-hosted form engine (to-astryx ticket 34).

 Collapses what upstream splits across `@rc-component/form`'s `FieldContext` /
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
   * Locale-aware message templates. The app injects antd-shaped `${label}`
   * templates here (`DefaultProviders.tsx`); the engine's own defaults use
   * `${name}` and only apply when nothing is provided.
   */
  validateMessages?: ValidateMessages;
  requiredMark?: RequiredMark;
}

/** What antd sourced from `<ConfigProvider form={{...}}>`. */
export const FormConfigContext = React.createContext<FormConfig>({});

export const FormConfigProvider: React.FC<
  FormConfig & { children?: React.ReactNode }
> = ({ children, ...config }) => {
  const parent = React.useContext(FormConfigContext);
  const value = React.useMemo(
    () => ({ ...parent, ...config }),
    // Spread config members explicitly so a fresh object literal at the call
    // site does not re-provide (and re-render every form) on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parent, config.validateMessages, config.requiredMark],
  );
  return React.createElement(FormConfigContext.Provider, { value }, children);
};

// ============================ Per-form UI context ===========================

export interface FormItemLayoutContextValue {
  form?: FormInstance;
  layout: 'vertical' | 'horizontal';
  requiredMark?: RequiredMark;
  disabled?: boolean;
  name?: string;
}

export const FormItemLayoutContext =
  React.createContext<FormItemLayoutContextValue>({
    layout: 'vertical',
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
