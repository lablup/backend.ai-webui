import { useEffect, useRef, type RefObject } from 'react';

/**
 * DOM-target plumbing shared by BUI's event-listener-based hooks
 * (`useEventListener`, `useHover`).
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `utils/domTarget.ts`,
 * `utils/depsAreSame.ts` and `utils/createEffectWithTarget.ts`.
 */

export type TargetValue<T> = T | undefined | null;

export type TargetType = HTMLElement | Element | Window | Document;

export type BasicTarget<T extends TargetType = Element> =
  (() => TargetValue<T>) | TargetValue<T> | RefObject<TargetValue<T>>;

const isBrowser = typeof window !== 'undefined' && !!window.document;

export function getTargetElement<T extends TargetType>(
  target?: BasicTarget<T>,
  defaultElement?: T,
): TargetValue<T> {
  if (!isBrowser) {
    return undefined;
  }
  if (!target) {
    return defaultElement;
  }
  if (typeof target === 'function') {
    return target();
  }
  if ('current' in target) {
    return target.current;
  }
  return target;
}

function depsAreSame(oldDeps: unknown[], deps: unknown[]): boolean {
  if (oldDeps === deps) {
    return true;
  }
  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], deps[i])) {
      return false;
    }
  }
  return true;
}

/**
 * `useEffect`, but the effect also re-runs when the *resolved DOM element*
 * behind `target` changes.
 *
 * A `RefObject` target mutates without re-rendering, so a normal dep array
 * cannot observe it. The effect below therefore runs on every commit with no
 * dep array and diffs the resolved elements (and `deps`) by hand — exactly
 * what ahooks' `createEffectWithTarget` does.
 */
export function useEffectWithTarget(
  effect: () => void | (() => void),
  deps: unknown[],
  target: BasicTarget<TargetType> | Array<BasicTarget<TargetType>>,
): void {
  const hasInitRef = useRef(false);
  const lastElementRef = useRef<Array<TargetValue<TargetType>>>([]);
  const lastDepsRef = useRef<unknown[]>([]);
  const unLoadRef = useRef<(() => void) | undefined>(undefined);

  const runEffect = () => {
    const cleanup = effect();
    unLoadRef.current = typeof cleanup === 'function' ? cleanup : undefined;
  };

  // Deliberately dep-array-free — see the doc comment above.
  useEffect(() => {
    const targets = Array.isArray(target) ? target : [target];
    const els = targets.map((item) => getTargetElement(item));

    if (!hasInitRef.current) {
      hasInitRef.current = true;
      lastElementRef.current = els;
      lastDepsRef.current = deps;
      runEffect();
      return;
    }

    if (
      els.length !== lastElementRef.current.length ||
      !depsAreSame(lastElementRef.current, els) ||
      !depsAreSame(lastDepsRef.current, deps)
    ) {
      unLoadRef.current?.();
      lastElementRef.current = els;
      lastDepsRef.current = deps;
      runEffect();
    }
  });

  useEffect(() => {
    return () => {
      unLoadRef.current?.();
      unLoadRef.current = undefined;
      // Reset so react-refresh / StrictMode remounts re-attach cleanly.
      hasInitRef.current = false;
    };
  }, []);
}
