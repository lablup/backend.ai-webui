/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Public surface of the self-hosted form engine (to-astryx ticket 34).

 A DROP-IN replacement for the slice of antd's form API this repository uses.
 Migrating a call site is an import rewrite and nothing else:

   - import { Form } from 'antd';
   + import { Form } from '../form-engine';

 `scripts/codemods/antd-form-to-engine.mjs` performs that rewrite; the
 resulting diff touches import statements only.

 `Form.Item` renders BAIFormItem's visual shell rather than antd's grid, so
 the 277 remaining `<Form.Item>` sites become BAI-styled without being
 edited — which is the point of ticket 05's visual/engine split.
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
