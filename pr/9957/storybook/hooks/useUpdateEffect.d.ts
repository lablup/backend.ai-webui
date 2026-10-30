import { DependencyList, EffectCallback } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
/**
 * `useEffect` that skips the mount run and only fires on subsequent updates.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `createUpdateEffect(useEffect)`.
 * The extra mount-scoped effect resets the flag so react-refresh (and
 * StrictMode's double-invoke) re-arms the "first run is the mount" rule.
 */
declare function useUpdateEffect(effect: EffectCallback, deps?: DependencyList): void;
export default useUpdateEffect;
