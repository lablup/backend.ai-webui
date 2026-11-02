import { SetStateAction } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
 *   used by `BAITable`) simply means "notify nobody".
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
declare function useControllableValue<T = any>(props: StandardControllableProps<T>): [T, (v: SetStateAction<T>) => void];
declare function useControllableValue<T = any>(props?: ControllableProps, options?: UseControllableValueOptions<T>): [T, (v: SetStateAction<T>, ...args: any[]) => void];
export default useControllableValue;
