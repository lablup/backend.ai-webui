import { useCallback, useLayoutEffect, useRef } from 'react';

export function useEventNotStable(handler: (props: any) => void) {
  // eslint-disable-next-line
  const handlerRef = useRef<Function | null>(null);

  // In a real implementation, this would run before layout effects
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  // eslint-disable-next-line
  // @ts-ignore
  return useCallback((...args) => {
    // In a real implementation, this would throw if called during render
    const fn = handlerRef.current;
    return fn ? fn(...args) : null;
  }, []);
}
