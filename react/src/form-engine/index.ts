/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Self-hosted form engine — react-app entry (to-astryx ticket 34).

 The engine lives in `packages/backend.ai-ui/src/form-engine/` so BUI (a
 separate workspace package that cannot import from `react/src`) shares one
 implementation. This module only re-exports it, mirroring `app-shim` and
 `theme-shim`: `react/src` files that the ticket-34 codemod pointed at
 `../form-engine` keep working unchanged, and the codemod keeps targeting this
 directory for `react/src` files.

 `Form` here is a drop-in for antd's: `Form.Item`, `Form.List`,
 `Form.ErrorList`, `Form.Provider`, `Form.useForm`, `Form.useWatch`,
 `Form.useFormInstance` and `Form.Item.useStatus` all resolve to the engine.
 */
export {
  Form,
  FormItem,
  FormList,
  ErrorList,
  FormProvider,
  FormConfigProvider,
  useForm,
  useWatch,
  useFormInstance,
  BAIFormItem,
  BAIFormItemVisual,
  defaultValidateMessages,
  type FormConfig,
  type RequiredMark,
  type FormProps,
  type FormRef,
  type FormItemProps,
  type FormListProps,
  type ListField,
  type ListOperations,
  type ErrorListProps,
  type FormInstance,
  type FieldData,
  type FieldError,
  type NamePath,
  type Rule,
  type RuleObject,
  type RuleRender,
  type ValidateErrorEntity,
  type ValidateMessages,
  type ValidatorRule,
  type BAIFormItemVisualProps,
} from 'backend.ai-ui';
