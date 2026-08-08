/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `form-engine` alias for the react app — currently pointed at **antd** (user
 decision, 2026-08-08).

 Ticket 34's codemod rewrote every form import under `react/src` from `'antd'`
 to `'../form-engine'` (109 files) and pointed this module at the self-hosted
 engine in `packages/backend.ai-ui/src/form-engine/`. That flip is reverted:
 the app runs antd's form ENGINE and antd's `Form.Item` VISUALS again, so the
 remaining UI-component migration proceeds without also changing form
 behaviour.

 Reverting needed no call-site edits — the indirection is the whole point.
 `<Form.Item>` renders `.ant-form-item*` DOM again; a call site that wants the
 BAI-rendered label/error shell asks for it explicitly with `<BAIFormItem>`
 (`../components/BAIFormItem`), which binds to antd's `Form.Item noStyle` and
 therefore also runs on the antd engine.

 The engine is PARKED, not removed: `packages/backend.ai-ui/src/form-engine/`
 still compiles and is still pinned by the 29-case acceptance suite in
 `./formEngineAcceptance.test.tsx`, which reaches it directly rather than
 through this alias. To re-enable it, point this module (and BUI's
 `form-engine/index.ts`) back at the engine and restore
 `<FormConfigProvider>` in `DefaultProviders.tsx`; the full checklist lives in
 the banner atop `packages/backend.ai-ui/src/form-engine/engine.ts` and in
 `.scratch/astryx-migration/issues/34-form-engine.md`.

 RE-EXPORTS ONLY, and only the measured surface — same two constraints as the
 BUI-side alias, and for the same reasons. See the header of
 `packages/backend.ai-ui/src/form-engine/index.ts`.
 */
export { Form, Form as default } from 'antd';

// Deep import into antd internals, kept in this ONE module rather than spread
// across call sites. antd ships no `exports` map so the path is reachable;
// antd is pinned at 6.5.0 — re-verify on any antd bump.
export { FormItemInputContext, NoStyleItemContext } from 'antd/es/form/context';
export type { RequiredMark } from 'antd/es/form/Form';

export type {
  ErrorListProps,
  FormInstance,
  FormItemProps,
  FormListFieldData as ListField,
  FormListOperation as ListOperations,
  FormListProps,
  FormProps,
  Rule,
  RuleObject,
  RuleRender,
} from 'antd/es/form';
export type {
  InternalNamePath,
  NamePath,
  Store,
  StoreValue,
} from 'antd/es/form/interface';
