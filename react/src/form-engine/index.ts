/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Self-hosted form engine — react-app entry (to-astryx tickets 34 + 35).

 The engine lives in `packages/backend.ai-ui/src/form-engine/` so BUI (a
 separate workspace package that cannot import from `react/src`) shares one
 implementation. This module only re-exports it, mirroring `app-shim` and
 `theme-shim`: the 109 files under `react/src` that the ticket-34 codemod
 pointed at `../form-engine` keep working unchanged, and the codemod keeps
 targeting this directory for `react/src` files.

 `Form` here is a drop-in for antd's: `Form.Item`, `Form.List`,
 `Form.ErrorList`, `Form.Provider`, `Form.useForm`, `Form.useWatch`,
 `Form.useFormInstance` and `Form.Item.useStatus` all resolve to the engine.
 `Form.Item` IS `BAIFormItem`, so `<Form.Item>` renders the BAI visual shell —
 no `.ant-form-item*` DOM anywhere on a form screen, and no antd form
 stylesheet injected for it.

 RE-EXPORTS ONLY, and only the measured surface — same constraint as the
 BUI-side alias, and for the same reason. See the header of
 `packages/backend.ai-ui/src/form-engine/index.ts`.
 */
export {
  Form,
  Form as default,
  FormItem,
  FormList,
  ErrorList,
  FormProvider,
  FormConfigProvider,
  FormConfigContext,
  FormItemInputContext,
  NoStyleItemContext,
  useForm,
  useWatch,
  useFormInstance,
  useFormValidateMessages,
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
  type InternalNamePath,
  type Rule,
  type RuleObject,
  type RuleRender,
  type Store,
  type StoreValue,
  type ValidateErrorEntity,
  type ValidateMessages,
  type ValidatorRule,
  type BAIFormItemVisualProps,
} from 'backend.ai-ui';
