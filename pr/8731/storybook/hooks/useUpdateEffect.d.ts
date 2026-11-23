import { DependencyList, EffectCallback } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * `useEffect` that skips the mount run and only fires on subsequent updates.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `createUpdateEffect(useEffect)`.
 * The extra mount-scoped effect resets the flag so react-refresh (and
 * StrictMode's double-invoke) re-arms the "first run is the mount" rule.
 */
declare function useUpdateEffect(effect: EffectCallback, deps?: DependencyList): void;
export default useUpdateEffect;
