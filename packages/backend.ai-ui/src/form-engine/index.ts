/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `form-engine` alias — currently pointed at **antd** (user decision,
 2026-08-08).

 Ticket 34's codemod rewrote every form import in the repo from `'antd'` to
 `'../form-engine'`, so this one module decides which implementation the
 whole application runs on:

   this file re-exports antd            → antd engine + antd `Form.Item` DOM
   this file re-exports './engine'      → self-hosted engine + BAI item shell

 It re-exports antd today. The self-hosted engine in `./engine.ts` (and the
 modules behind it) is kept in the tree, compiled and tested, but is not part
 of any runtime path — see the parked banner at the top of `./engine.ts` for
 the full re-enable checklist.

 Because the indirection is the only thing that changed, no call site was
 edited to revert: `<Form>`, `<Form.Item>`, `Form.useForm()` and friends are
 antd's again, with antd's grid/label/error DOM (`.ant-form-item*`) and antd's
 validation timing.

 Call sites that want the BAI-rendered label/error visuals ask for them
 EXPLICITLY via `<BAIFormItem>` (`react/src/components/BAIFormItem.tsx`,
 tickets 05 + 18–23). That component binds to antd's `Form.Item noStyle`, so
 it too runs on the antd engine.

 TWO CONSTRAINTS on what may be written here:

 1. RE-EXPORTS ONLY — never read a property off the imported binding at module
    scope (`const FormItem = Form.Item`). Tests that replace antd wholesale
    (`vi.mock('antd', () => ({ … }))`, e.g.
    `react/src/components/MyResourceWithinResourceGroup.test.tsx`) get a mock
    without `Form`; an eager property read throws while merely re-exporting is
    lazy and costs those tests nothing. This module is pulled into almost every
    test through the BUI barrel, so the whole suite depends on it staying lazy.
 2. MEASURED SURFACE — the list below is exactly the symbols the rewritten
    files import. The engine's `Form.Item` / `Form.List` / `useForm` /
    `useWatch` / `useFormInstance` named exports have no consumers (call sites
    reach them off the `Form` compound component) and are deliberately absent;
    if one is ever needed, re-export it from its antd module
    (`antd/es/form/FormItem`, `antd/es/form/Form`, …) rather than off `Form`.
    Engine-internal exports (`FormConfigProvider`, `FormStore`,
    `BAIFormItemVisual`, …) have no antd counterpart at all.
 */
export { Form, Form as default } from 'antd';

// Form-item status contexts. antd ships no `exports` map, so its internal
// modules stay reachable; routing them through this alias keeps the deep
// import in ONE place instead of spreading it back across call sites. antd is
// pinned at 6.5.0 — re-verify this path on any antd bump.
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
