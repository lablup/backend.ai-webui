import { RefObject } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * DOM-target plumbing shared by BUI's event-listener-based hooks
 * (`useEventListener`, `useHover`).
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `utils/domTarget.ts`,
 * `utils/depsAreSame.ts` and `utils/createEffectWithTarget.ts`.
 */
export type TargetValue<T> = T | undefined | null;
export type TargetType = HTMLElement | Element | Window | Document;
export type BasicTarget<T extends TargetType = Element> = (() => TargetValue<T>) | TargetValue<T> | RefObject<TargetValue<T>>;
export declare function getTargetElement<T extends TargetType>(target?: BasicTarget<T>, defaultElement?: T): TargetValue<T>;
/**
 * `useEffect`, but the effect also re-runs when the *resolved DOM element*
 * behind `target` changes.
 *
 * A `RefObject` target mutates without re-rendering, so a normal dep array
 * cannot observe it. The effect below therefore runs on every commit with no
 * dep array and diffs the resolved elements (and `deps`) by hand — exactly
 * what ahooks' `createEffectWithTarget` does.
 */
export declare function useEffectWithTarget(effect: () => void | (() => void), deps: unknown[], target: BasicTarget<TargetType> | Array<BasicTarget<TargetType>>): void;
