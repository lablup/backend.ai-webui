/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Public surface of the self-hosted form engine (to-astryx tickets 34 + 35).

 ┌───────────────────────────────────────────────────────────────────────┐
 │ LIVE. `./index.ts` re-exports this module, so every                   │
 │ `import { Form } from '../form-engine'` in the repository — 115 files │
 │ — resolves here. The app runs this engine and this `Form.Item`.       │
 │                                                                       │
 │ It was parked between 2026-08-08 and 2026-08-09 (runtime temporarily  │
 │ pointed back at antd while the UI-component migration ran). Ticket 35 │
 │ unparked it, localized `validateMessages` out of antd's locale bundle │
 │ into BUI's own catalogs, and moved `DefaultProviders` onto            │
 │ `<FormConfigProvider>`. antd is now UNINSTALLED repo-wide, so there   │
 │ is nothing left for a form module to import even by accident.         │
 │                                                                       │
 │ The 29-case acceptance suite                                          │
 │ (`react/src/form-engine/formEngineAcceptance.test.tsx`) used to run   │
 │ every case against BOTH antd and this engine, keeping the antd row    │
 │ green as a live oracle. With antd gone the antd row is dropped and    │
 │ the engine row is a plain regression suite — the assertions are       │
 │ unchanged and carry the oracle's verdict forward.                     │
 │ See `.scratch/astryx-migration/issues/34-form-engine.md`.             │
 └───────────────────────────────────────────────────────────────────────┘

 SPELLING NOTE for this directory. Several modules here are behavioural ports
 and name their upstream in prose. Write those package names WITHOUT the
 leading `@` scope-and-slash (`rc-component's \`form\``, not the npm
 specifier), and antd class names without their leading dot. These files open
 with an `@license` block, which terser preserves, so their header comments
 land verbatim in `build/web` — and `scripts/antd-zero-gate.sh` part (b) reads
 an antd-family specifier or a dotted antd class there as evidence that antd is
 back. The gate cannot tell our prose from a real reintroduction, and the
 signature is worth more sharp than our comments are worth verbatim.

 A DROP-IN replacement for the slice of antd's form API this repository uses.
 Migrating a call site is an import rewrite and nothing else — the module
 specifier changes from the antd package to `'../form-engine'`, and the
 imported names do not change at all.

 `scripts/codemods/antd-form-to-engine.mjs` performs that rewrite; the
 resulting diff touches import statements only.

 `Form.Item` renders BAIFormItem's visual shell rather than antd's grid, so
 that when the alias points here, `<Form.Item>` sites become BAI-styled
 without being edited — which is the point of ticket 05's visual/engine
 split.
 */
import ErrorList from './ErrorList';
import InternalForm, { FormProvider, useForm } from './Form';
import FormItem, { useFormItemStatus } from './FormItem';
import List from './List';
import useWatch, { useFormInstance } from './useWatch';

type InternalFormType = typeof InternalForm;

interface FormInterface extends InternalFormType {
  Item: typeof FormItem;
  List: typeof List;
  ErrorList: typeof ErrorList;
  useForm: typeof useForm;
  useFormInstance: typeof useFormInstance;
  useWatch: typeof useWatch;
  Provider: typeof FormProvider;
}

type FormItemWithStatus = typeof FormItem & {
  useStatus: typeof useFormItemStatus;
};

(FormItem as FormItemWithStatus).useStatus = useFormItemStatus;

const Form = InternalForm as FormInterface;
Form.Item = FormItem;
Form.List = List;
Form.ErrorList = ErrorList;
Form.useForm = useForm;
Form.useFormInstance = useFormInstance;
Form.useWatch = useWatch;
Form.Provider = FormProvider;

export default Form;
export { Form };

// Named exports, for call sites that import a piece directly.
export {
  FormItem,
  List as FormList,
  ErrorList,
  FormProvider,
  useForm,
  useWatch,
  useFormInstance,
};
export { default as BAIFormItem } from './FormItem';
export {
  default as BAIFormItemVisual,
  type BAIFormItemVisualProps,
} from './FormItemVisual';
export {
  // Consumed outside the engine: BAICheckbox reads the item's validation
  // status, and a custom item shell can publish sub-item metas. These were
  // deep imports out of `antd/es/form/context` before ticket 34.
  FormItemInputContext,
  NoStyleItemContext,
  FormConfigContext,
  type FormConfig,
  type FormItemStatusContextValue,
  type RequiredMark,
} from './context';
export {
  FormConfigProvider,
  useFormValidateMessages,
} from './FormConfigProvider';
export { FormStore } from './FormStore';
export { defaultValidateMessages } from './messages';

export type { FormProps, FormRef } from './Form';
export type { FormItemProps } from './FormItem';
export type {
  ListProps as FormListProps,
  ListField,
  ListOperations,
} from './List';
export type { ErrorListProps } from './ErrorList';
export type { WatchOptions } from './useWatch';
export type {
  FormInstance,
  FieldData,
  FieldError,
  Meta,
  NamePath,
  InternalNamePath,
  Rule,
  RuleObject,
  RuleRender,
  RuleType,
  Store,
  StoreValue,
  ValidateErrorEntity,
  ValidateMessages,
  ValidatorRule,
} from './interface';
