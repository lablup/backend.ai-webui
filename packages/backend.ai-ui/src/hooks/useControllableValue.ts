import { useLatest, useLatestCallback } from './internal/useLatest';
import { useReducer, useRef, useState, type SetStateAction } from 'react';

/**
 * The controlled / uncontrolled contract shared by every BUI form-ish
 * component.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `useControllableValue`.
 *
 * Contract (unchanged from ahooks):
 * - "Controlled" is decided by `hasOwnProperty(props, valuePropName)`, not by
 *   `props[valuePropName] !== undefined`. Passing `value={undefined}`
 *   explicitly still counts as controlled.
 * - The initial uncontrolled value is resolved **once**: `props[valuePropName]`
 *   when controlled, else `props[defaultValuePropName]` when that key is
 *   present, else `options.defaultValue`.
 * - The setter always fires `props[trigger]` (default `'onChange'`) with the
 *   resolved value plus any extra arguments, in both modes. When the value is
 *   controlled the internal state is *not* written — the parent owns it.
 * - A `trigger` naming a prop that does not exist (the `'no-trigger'` idiom
 *   used by `BAITableAstryx`) simply means "notify nobody".
 * - The setter identity is stable for the component's whole lifetime.
 */
export interface UseControllableValueOptions<T> {
  defaultValue?: T;
  /** Defaults to `'defaultValue'`. */
  defaultValuePropName?: string;
  /** Defaults to `'value'`. */
  valuePropName?: string;
  /** Defaults to `'onChange'`. */
  trigger?: string;
}

export type ControllableProps = Record<string, any>;

export interface StandardControllableProps<T> {
  value: T;
  defaultValue?: T;
  onChange: (val: T) => void;
}

function useControllableValue<T = any>(
  props: StandardControllableProps<T>,
): [T, (v: SetStateAction<T>) => void];
function useControllableValue<T = any>(
  props?: ControllableProps,
  options?: UseControllableValueOptions<T>,
): [T, (v: SetStateAction<T>, ...args: any[]) => void];
function useControllableValue<T = any>(
  defaultProps?: ControllableProps,
  options: UseControllableValueOptions<T> = {},
) {
  const props = defaultProps ?? {};
  const {
    defaultValue,
    defaultValuePropName = 'defaultValue',
    valuePropName = 'value',
    trigger = 'onChange',
  } = options;

  const value = props[valuePropName];
  const isControlled = Object.prototype.hasOwnProperty.call(
    props,
    valuePropName,
  );

  // Resolved once, on the first render only — matching ahooks' `useMemo(…, [])`.
  const [initialValue] = useState<T | undefined>(() => {
    if (isControlled) {
      return value;
    }
    if (Object.prototype.hasOwnProperty.call(props, defaultValuePropName)) {
      return props[defaultValuePropName];
    }
    return defaultValue;
  });

  /* eslint-disable react-hooks/refs -- The ref IS the state container here (a
     faithful port of ahooks): in controlled mode the parent's prop has to be
     visible in this very render, and the uncontrolled setter must be able to
     read the newest value without a dep array. `forceUpdate` below is what
     makes the render observe an uncontrolled write. */
  const stateRef = useRef<T | undefined>(initialValue);
  if (isControlled) {
    stateRef.current = value;
  }

  const [, forceUpdate] = useReducer((tick: number) => tick + 1, 0);

  const propsRef = useLatest(props);
  const isControlledRef = useLatest(isControlled);

  const setState = useLatestCallback((v: SetStateAction<T>, ...args: any[]) => {
    const next =
      typeof v === 'function'
        ? (v as (prev: T | undefined) => T)(stateRef.current)
        : v;

    if (!isControlledRef.current) {
      stateRef.current = next;
      forceUpdate();
    }

    propsRef.current[trigger]?.(next, ...args);
  });

  return [stateRef.current, setState];
  /* eslint-enable react-hooks/refs */
}

export default useControllableValue;
