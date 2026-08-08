/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Public surface of the self-hosted form engine (to-astryx ticket 34).

 ┌───────────────────────────────────────────────────────────────────────┐
 │ PARKED — NOT WIRED INTO THE RUNNING APP (user decision, 2026-08-08).  │
 │                                                                       │
 │ Ticket 34 pointed `form-engine/index.ts` at this module, so every     │
 │ `import { Form } from '../form-engine'` resolved here and every       │
 │ `<Form.Item>` in the repo rendered the BAI visual shell over this     │
 │ engine. That flip is reverted: `./index.ts` is now a thin re-export    │
 │ of **antd's** form surface, so the app runs antd's engine AND antd's  │
 │ `Form.Item` visuals again while the UI-component migration continues. │
 │                                                                       │
 │ Nothing here was deleted. The engine still compiles, still lints, and │
 │ is still exercised by the 29-case acceptance suite                    │
 │ (`react/src/form-engine/formEngineAcceptance.test.tsx`), which imports│
 │ this module directly rather than through the alias.                   │
 │                                                                       │
 │ RE-ENABLING is a one-file edit: make `./index.ts` `export * from      │
 │ './engine'` (plus the two named/`default` lines below), restore       │
 │ `<FormConfigProvider>` in `react/src/components/DefaultProviders.tsx` │
 │ in place of `<ConfigProvider form={{…}}>`, point                      │
 │ `react/src/form-engine/index.ts` back at `backend.ai-ui`, and swap    │
 │ the alias-driven `.ant-form-*` e2e selectors back to the             │
 │ `[data-bai-form-item*]` anchors. See                                  │
 │ `.scratch/astryx-migration/issues/34-form-engine.md`.                 │
 └───────────────────────────────────────────────────────────────────────┘

 A DROP-IN replacement for the slice of antd's form API this repository uses.
 Migrating a call site is an import rewrite and nothing else:

   - import { Form } from 'antd';
   + import { Form } from '../form-engine';

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
  FormConfigProvider,
  // Consumed outside the engine: BAICheckbox reads the item's validation
  // status, and a custom item shell can publish sub-item metas. These were
  // deep imports out of `antd/es/form/context` before ticket 34.
  FormItemInputContext,
  NoStyleItemContext,
  type FormConfig,
  type FormItemStatusContextValue,
  type RequiredMark,
} from './context';
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
