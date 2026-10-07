/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `form-engine` alias: the form engine lives in `@lablup/ui-common/Form`
 (ADR 0009), and every `import { Form } from '../form-engine'` resolves there
 through this module. `BAIFormItem` is the engine's `FormItem` plus a `labelExtra` slot;
 `BAIFormItemVisual` is the engine's `FormItemVisual` under its BUI name.

 RE-EXPORTS ONLY — never read a property off an imported binding at module
 scope (`const FormItem = Form.Item`). Tests that replace a whole module with
 `vi.mock(...)` hand back a mock without `Form`; an eager read throws at
 import time, while a re-export is lazy. This module rides the BUI barrel into
 almost every suite.
 */
export * from '@lablup/ui-common/Form';
// `export *` does not carry a default binding; `import Form from
// '../form-engine'` sites need this line.
export { default } from '@lablup/ui-common/Form';
export {
  default as BAIFormItem,
  type BAIFormItemProps,
} from '../components/BAIFormItem';
export {
  FormItemVisual as BAIFormItemVisual,
  type FormItemVisualProps as BAIFormItemVisualProps,
} from '@lablup/ui-common/Form';
