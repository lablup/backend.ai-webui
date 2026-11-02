/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `form-engine` alias: the form engine lives in `@lablup/ui-common/Form`
 (ADR 0009), and every `import { Form } from '../form-engine'` resolves there
 through this module. `BAIFormItem` / `BAIFormItemVisual` are the engine's
 `FormItem` / `FormItemVisual` under their BUI names.

 RE-EXPORTS ONLY — never read a property off an imported binding at module
 scope (`const FormItem = Form.Item`). Tests that replace a whole module with
 `vi.mock(...)` hand back a mock without `Form`; an eager read throws at
 import time, while a re-export is lazy. This module rides the BUI barrel into
 almost every suite.
 */
export * from '@lablup/ui-common/Form';
export { default } from '@lablup/ui-common/Form';
export { FormItem as BAIFormItem, FormItemVisual as BAIFormItemVisual, type FormItemVisualProps as BAIFormItemVisualProps, } from '@lablup/ui-common/Form';
