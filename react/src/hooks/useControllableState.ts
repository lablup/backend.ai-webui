import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SetStateAction } from 'react';

export interface Options {
  defaultValuePropName?: string;
  valuePropName?: string;
  trigger?: string;
}

export type Props = Record<string, any>;

export interface StandardProps<T> {
  value: T;
  defaultValue?: T;
  onChange: (val: T) => void;
}
/**
 * Custom hook to  manage this kind of state. managed by itself or controlled by it's parent
 * useControllableState is based on useControllableValue.
 * However if the value is undefined, the component is treated as an uncontrolled component
 */

function useControllableState<T = any>(
  props: StandardProps<T>,
): [T, (v: SetStateAction<T>) => void];
function useControllableState<T = any>(
  props?: Props,
  options?: Options,
): [T, (v: SetStateAction<T>, ...args: any[]) => void];
function useControllableState<T = any>(
  props: Props = {},
  options: Options = {},
) {
  const {
    defaultValuePropName = 'defaultValue',
    valuePropName = 'value',
    trigger = 'onChange',
  } = options;

  const value = props[valuePropName] as T;

  let isControlledRef = useRef(value !== undefined);
  let isControlled = value !== undefined;

  useEffect(() => {
    let wasControlled = isControlledRef.current;
    if (wasControlled !== isControlled) {
      console.warn(
        `WARN: A component changed from ${wasControlled ? 'controlled' : 'uncontrolled'} to ${
          isControlled ? 'controlled' : 'uncontrolled'
        }.`,
      );
    }
    isControlledRef.current = isControlled;
  }, [isControlled]);

  const initialValue = useMemo(() => {
    if (isControlled) {
      return value;
    }
    if (Object.prototype.hasOwnProperty.call(props, defaultValuePropName)) {
      return props[defaultValuePropName];
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stateRef = useRef(initialValue);
  if (isControlled) {
    stateRef.current = value;
  }

  const update = useUpdate();

  function setState(v: SetStateAction<T>, ...args: any[]) {
    const r = isFunction(v) ? v(stateRef.current) : v;

    if (!isControlled) {
      stateRef.current = r;
      update();
    }
    if (props[trigger]) {
      props[trigger](r, ...args);
    }
  }

  return [stateRef.current, useMemoizedFn(setState)] as const;
}

export default useControllableState;

function isFunction(value: unknown): value is (...args: any) => any {
  return typeof value === 'function';
}

type noop = (this: any, ...args: any[]) => any;

type PickFunction<T extends noop> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>;

function useMemoizedFn<T extends noop>(fn: T) {
  const isDev =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(
        `useMemoizedFn expected parameter is a function, got ${typeof fn}`,
      );
    }
  }

  const fnRef = useRef<T>(fn);

  fnRef.current = useMemo<T>(() => fn, [fn]);

  const memoizedFn = useRef<PickFunction<T>>();
  if (!memoizedFn.current) {
    memoizedFn.current = function (this, ...args) {
      return fnRef.current.apply(this, args);
    };
  }

  return memoizedFn.current as T;
}

function useUpdate() {
  const [, setState] = useState({});

  return useCallback(() => setState({}), []);
}
