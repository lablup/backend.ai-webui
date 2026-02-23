/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DependencyList, useEffect, useMemo, useRef, useState } from 'react';

export const useMemoWithPrevious = <T,>(
  factory: () => T,
  deps: DependencyList,
  { initialPrev }: { initialPrev?: T } | undefined = {},
) => {
  const prevRef = useRef(initialPrev);
  const [prevResetKey, setPrevResetKey] = useState({});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const current = useMemo(factory, deps);
  const memoizedPrev = useMemo(() => {
    return prevRef.current;
    // Only update when the reset key changes and deps change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, prevResetKey]);

  useEffect(() => {
    prevRef.current = current;
    // Only update when deps change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [
    {
      previous: memoizedPrev,
      current: current,
    },
    {
      resetPrevious: () => {
        prevRef.current = initialPrev;
        setPrevResetKey({});
      },
    },
  ] as const;
};
