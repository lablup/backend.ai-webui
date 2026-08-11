import {
  useEffect,
  useRef,
  type DependencyList,
  type EffectCallback,
} from 'react';

/**
 * `useEffect` that skips the mount run and only fires on subsequent updates.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `createUpdateEffect(useEffect)`.
 * The extra mount-scoped effect resets the flag so react-refresh (and
 * StrictMode's double-invoke) re-arms the "first run is the mount" rule.
 */
function useUpdateEffect(effect: EffectCallback, deps?: DependencyList): void {
  const isMountedRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `deps` is the caller's dependency list, forwarded verbatim; `effect` is intentionally excluded so this behaves exactly like `useEffect(effect, deps)`.
  }, deps);
}

export default useUpdateEffect;
