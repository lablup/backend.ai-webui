import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SetStateAction } from 'react';

export interface Options<T> {
  defaultValue?: T;
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

function useControllableState_deprecated<T = any>(
  props: StandardProps<T>,
): [T, (v: SetStateAction<T>) => void];
function useControllableState_deprecated<T = any>(
  props?: Props,
  options?: Options<T>,
): [T, (v: SetStateAction<T>, ...args: any[]) => void];
function useControllableState_deprecated<T = any>(
  props: Props = {},
  options: Options<T> = {},
) {
  const {
    defaultValue,
    defaultValuePropName = 'defaultValue',
    valuePropName = 'value',
    trigger = 'onChange',
  } = options;

  const value = props[valuePropName] as T;

  const isControlledRef = useRef(value !== undefined);
  const isControlled = value !== undefined;

  useEffect(() => {
    isControlledRef.current = isControlled;
  }, [isControlled]);

  const initialValue = useMemo(() => {
    if (isControlled) {
      return value;
    }
    if (Object.prototype.hasOwnProperty.call(props, defaultValuePropName)) {
      return props[defaultValuePropName];
    }
    return defaultValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stateRef = useRef(initialValue);
  if (isControlled) {
    stateRef.current = value;
  }

  const update = useUpdate();

  function setState(v: SetStateAction<T>, ...args: any[]) {
    const r = _.isFunction(v) ? v(stateRef.current) : v;

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

export default useControllableState_deprecated;

type noop = (this: any, ...args: any[]) => any;

type PickFunction<T extends noop> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>;

function useMemoizedFn<T extends noop>(fn: T) {
  const fnRef = useRef<T>(fn);

  fnRef.current = useMemo<T>(() => fn, [fn]);

  const memoizedFn = useRef<PickFunction<T>>(null);
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
