/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Alias of `@lablup/ui-common/Form` (ADR 0009); `BAIFormItem*` are its
// `FormItem*` under BUI names.
// RE-EXPORTS ONLY: a module-scope read (`const FormItem = Form.Item`) throws
// when a test replaces the module with a whole-module mock; a re-export is lazy.
export type * from '@lablup/ui-common/Form';
// A star re-export does not carry a default binding; `import Form from
// '../form-engine'` sites need this line.
export { default } from '@lablup/ui-common/Form';
export {
  ErrorList,
  Form,
  FormConfigContext,
  FormConfigProvider,
  FormItem,
  FormItemInputContext,
  FormItemVisual,
  FormList,
  FormProvider,
  FormStore,
  NoFormItemContext,
  NoStyleItemContext,
  defaultValidateMessages,
  useForm,
  useFormInstance,
  useFormValidateMessages,
  useWatch,
  FormItem as BAIFormItem,
  FormItemVisual as BAIFormItemVisual,
  type FormItemVisualProps as BAIFormItemVisualProps,
} from '@lablup/ui-common/Form';
