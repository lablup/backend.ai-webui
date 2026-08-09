/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIFormItem — re-export (to-astryx tickets 05 + 34).

 Ticket 05 split the form item into a hand-rendered VISUAL shell and a STATE
 binding, and parked the binding on `<Form.Item noStyle>` because antd still
 owned the form engine. Ticket 34 replaced that engine, so both halves now
 live together in `packages/backend.ai-ui/src/form-engine/` — the visual shell
 moved there byte-for-byte as `FormItemVisual.tsx`, and `FormItem.tsx` is the
 same binding re-pointed at the engine's own `Field`.

 Two couplings disappeared with the move:
   - the `NoStyleItemContext` deep import out of antd's internals — the ONE
     unstable dependency ticket 05 called out. The engine
     owns that context now, so the antd version pin it required is moot.
   - antd's `Form.Item` no longer runs `useStyle()` behind `noStyle`, so the
     antd form stylesheet is no longer injected for form screens at all.

 This module stays so the 41 files importing `./BAIFormItem` need no edit;
 `Form.Item` from the engine IS this component, which is also why the
 remaining `<Form.Item>` sites picked up the BAI visual without being touched.
 */
export {
  BAIFormItem as default,
  BAIFormItemVisual,
  type FormItemProps as BAIFormItemProps,
  type BAIFormItemVisualProps,
} from '../form-engine';
