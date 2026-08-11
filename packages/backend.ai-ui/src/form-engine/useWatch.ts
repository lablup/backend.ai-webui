/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `Form.useWatch` + `Form.useFormInstance` (to-astryx ticket 34).

 30 `useWatch` call sites, 12 of which pass `{ preserve: true }` — that option
 reads the RAW store rather than the registered-field projection, so a value
 whose field is currently unmounted is still observed. Paths are ABSOLUTE even
 inside a `Form.List` (answers/08 §1.3), which falls out naturally here
 because `useWatch` reads from the form instance, never from `prefixName`.

 Change detection is by JSON stringification, matching upstream. That is what
 lets a watcher on an object path settle instead of re-rendering forever on
 every new object identity the store produces.
 */
import { FieldContext, FormItemLayoutContext, HOOK_MARK } from './context';
import type {
  FormInstance,
  InternalFormInstance,
  StoreValue,
} from './interface';
import { getNamePath, getValue, type NamePath, type Store } from './namePath';
import * as React from 'react';

function stringify(value: any): string | number {
  try {
    return JSON.stringify(value);
  } catch {
    return Math.random();
  }
}

function isFormInstance(form: any): form is InternalFormInstance {
  return form && !!form._init;
}

export interface WatchOptions<Form = FormInstance> {
  form?: Form;
  /** Read the raw store, including values whose field is unmounted. */
  preserve?: boolean;
}

function useWatch<Values = StoreValue>(
  dependencies: NamePath | ((values: Store) => Values),
  formOrOptions?: FormInstance | WatchOptions,
): Values {
  const options: WatchOptions = isFormInstance(formOrOptions)
    ? { form: formOrOptions }
    : ((formOrOptions ?? {}) as WatchOptions);
  const form = options.form as InternalFormInstance | undefined;

  const fieldContext = React.useContext(FieldContext);
  const formInstance = (form || fieldContext) as InternalFormInstance;
  const isValidForm = !!formInstance && !!formInstance._init;

  const read = (values?: Store, allValues?: Store) => {
    const watchValue = options.preserve
      ? (allValues ?? formInstance.getFieldsValue(true))
      : (values ?? formInstance.getFieldsValue());
    return typeof dependencies === 'function'
      ? (dependencies as any)(watchValue)
      : getValue(watchValue, getNamePath(dependencies as NamePath));
  };

  // Seed from the store rather than from `undefined`. Upstream starts empty
  // and syncs in a mount effect; reading here removes that extra render (and
  // the `undefined` flash a `useWatch`-gated subtree shows because of it).
  // Fields that register AFTER this hook still reach us: `registerField`
  // notifies every watcher, and that notification is batched onto a
  // macrotask, by which point the subscription below is in place.
  const [value, setValue] = React.useState<any>(() =>
    isValidForm
      ? read()
      : typeof dependencies === 'function'
        ? (dependencies as any)({})
        : undefined,
  );

  /**
   * Stable across renders while always reading the latest `dependencies` /
   * `value` / `options`. That combination is the whole point: the watcher is
   * registered ONCE (re-registering on every render would churn the store's
   * subscriber set), yet a selector function redefined inline at the call
   * site must still be the one that runs.
   */
  const triggerUpdate = React.useEffectEvent(
    (values?: Store, allValues?: Store) => {
      if (!isValidForm) return;
      const nextValue = read(values, allValues);
      // Compare by serialisation, not identity: the store hands back a fresh
      // object on every write, so identity comparison would never settle.
      if (stringify(value) !== stringify(nextValue)) {
        setValue(nextValue);
      }
    },
  );

  // A selector function has no stable serialisation, so it identifies itself.
  const flattenDeps =
    typeof dependencies === 'function'
      ? dependencies
      : JSON.stringify(dependencies);

  React.useEffect(() => {
    if (!isValidForm) return undefined;
    const registerWatch =
      formInstance.getInternalHooks(HOOK_MARK)?.registerWatch;
    const cancel = registerWatch?.((values, allValues) => {
      triggerUpdate(values, allValues);
    });
    // Re-read once the WATCHED PATH itself changes (not the value — the store
    // notifies us for that). This matters for dynamic paths such as
    // `useWatch(['rows', index, 'slot'])`, where removing a list row shifts
    // the index: without this the hook keeps reporting the OLD row's value
    // until some unrelated write happens to notify the watchers.
    //
    // The `set-state-in-effect` exemption below is narrow: the `useState`
    // seed above already covers mount, so this only fires on a genuine path
    // change. It is a synchronisation against an external store, and there is
    // no render-time source to derive it from — the value lives in the form
    // store, not in props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    triggerUpdate();
    return cancel;
  }, [isValidForm, formInstance, flattenDeps]);

  return value;
}

export default useWatch;

/** The nearest `<Form>`'s instance, or `undefined` outside one. */
export function useFormInstance<Values = any>(): FormInstance<Values> {
  const { form } = React.useContext(FormItemLayoutContext);
  return form as FormInstance<Values>;
}
