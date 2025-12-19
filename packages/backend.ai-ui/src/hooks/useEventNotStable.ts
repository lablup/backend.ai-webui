import { useCallback, useLayoutEffect, useRef } from 'react';

export function useEventNotStable<Args extends unknown[], Return>(
  handler: (...args: Args) => Return,
) {
  // eslint-disable-next-line
  const handlerRef = useRef<typeof handler>(handler);

  // In a real implementation, this would run before layout effects
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  // eslint-disable-next-line
  // @ts-ignore
  return useCallback((...args: Args) => {
    // In a real implementation, this would throw if called during render
    const fn = handlerRef.current;
    return fn(...args);
  }, []);
}
