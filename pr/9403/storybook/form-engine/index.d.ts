/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `form-engine` alias — pointed at the SELF-HOSTED engine (to-astryx ticket 35).

 Ticket 34's codemod rewrote every form import in the repo from `'antd'` to
 `'../form-engine'`, so this one module decides which implementation the whole
 application runs on:

   this file re-exports './engine'      → self-hosted engine + BAI item shell
   this file re-exports antd            → antd engine + antd `Form.Item` DOM

 It re-exports `./engine`. `<Form>`, `<Form.Item>`, `Form.useForm()`,
 `Form.List`, `Form.Provider`, `Form.useWatch` and `Form.Item.useStatus` are
 all the engine's, and `Form.Item` IS `BAIFormItem` — the visual shell ticket
 05 split out — so every `<Form.Item>` site renders `[data-bai-form-item]`
 rather than `.ant-form-item*`, without being edited.

 (Between 2026-08-08 and 2026-08-09 this file pointed at antd instead, to hold
 form behaviour still while the UI-component migration ran. That is over; the
 antd leg is gone from both alias modules.)

 ONE CONSTRAINT on what may be written here:

   RE-EXPORTS ONLY — never read a property off an imported binding at module
   scope (`const FormItem = Form.Item`). Tests that replace a whole module
   with `vi.mock(...)` (e.g.
   `react/src/components/MyResourceWithinResourceGroup.test.tsx`) hand back a
   mock without `Form`; an eager property read throws at import time while a
   re-export is lazy and costs those tests nothing. This module rides the BUI
   barrel into almost every suite, so the whole suite depends on it staying
   lazy. (`./engine.ts` itself does assemble the compound component — that is
   the engine's own module and is never mocked.)
 */
export * from './engine';
export { default } from './engine';
