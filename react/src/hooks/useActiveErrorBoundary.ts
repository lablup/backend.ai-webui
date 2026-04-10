/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { atom, useAtomValue, useSetAtom } from 'jotai';

const activeErrorBoundaryCountAtom = atom(0);

/**
 * Read whether any BAIErrorBoundary is currently in an error state
 * (caught an error and has not yet been reset).
 *
 * When `true`, the React tree may carry stale state. Navigation components
 * should fall back to a full page reload instead of SPA navigation.
 */
export const useHasActiveErrorBoundary = () => {
  return useAtomValue(activeErrorBoundaryCountAtom) > 0;
};

const incrementAtom = atom(null, (get, set) => {
  set(activeErrorBoundaryCountAtom, get(activeErrorBoundaryCountAtom) + 1);
});

const decrementAtom = atom(null, (get, set) => {
  set(
    activeErrorBoundaryCountAtom,
    Math.max(0, get(activeErrorBoundaryCountAtom) - 1),
  );
});

/**
 * Returns callbacks to increment/decrement the active error boundary count.
 *
 * Used by `BAIErrorBoundary`:
 * - `markTriggered` when it catches an error (`onError`)
 * - `markReset` when the boundary is reset (`onReset`)
 */
export const useActiveErrorBoundaryControl = () => {
  const markTriggered = useSetAtom(incrementAtom);
  const markReset = useSetAtom(decrementAtom);
  return { markTriggered, markReset };
};
