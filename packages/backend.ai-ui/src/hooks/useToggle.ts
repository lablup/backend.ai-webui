import { useState } from 'react';

/**
 * Two-state toggle.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `useToggle`. Like ahooks, the
 * `defaultValue` / `reverseValue` pair is captured on the first render and
 * later changes to those arguments are ignored, so the returned `actions`
 * object keeps a stable identity for the component's whole lifetime.
 */
export interface UseToggleActions<T> {
  setLeft: () => void;
  setRight: () => void;
  set: (value: T) => void;
  toggle: () => void;
}

function useToggle<T = boolean>(): [boolean, UseToggleActions<T>];
function useToggle<T>(defaultValue: T): [T, UseToggleActions<T>];
function useToggle<T, U>(
  defaultValue: T,
  reverseValue: U,
): [T | U, UseToggleActions<T | U>];
function useToggle<D, R>(
  defaultValue: D = false as unknown as D,
  reverseValue?: R,
) {
  const [state, setState] = useState<D | R>(defaultValue);

  const [actions] = useState<UseToggleActions<D | R>>(() => {
    const reverseValueOrigin = (
      reverseValue === undefined ? !defaultValue : reverseValue
    ) as D | R;

    return {
      toggle: () =>
        setState((prev) =>
          prev === defaultValue ? reverseValueOrigin : defaultValue,
        ),
      // Wrapped in an updater so a function-typed state is stored verbatim
      // instead of being mistaken for a reducer.
      set: (value: D | R) => setState(() => value),
      setLeft: () => setState(() => defaultValue),
      setRight: () => setState(() => reverseValueOrigin),
    };
  });

  return [state, actions];
}

export default useToggle;
