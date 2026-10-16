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
declare function useToggle<T = boolean>(): [boolean, UseToggleActions<T>];
declare function useToggle<T>(defaultValue: T): [T, UseToggleActions<T>];
declare function useToggle<T, U>(defaultValue: T, reverseValue: U): [T | U, UseToggleActions<T | U>];
export default useToggle;
