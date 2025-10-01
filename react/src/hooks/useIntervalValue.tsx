import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook that executes a callback function at a specified interval.
 *
 * @param callback The function to be executed at the specified interval.
 * @param delay The delay (in milliseconds) between each execution of the callback function. If `null`, the interval is cleared(pause).
 * @param pauseWhenHidden Whether to pause the interval when the page becomes hidden. Defaults to true.
 */
export function useInterval(
  callback: () => void,
  delay: number | null,
  pauseWhenHidden: boolean = true,
) {
  const savedCallback = useRef<(() => void) | null>(null);
  const [isPageVisible, setIsPageVisible] = useState(() =>
    typeof document === 'undefined' ? true : !document.hidden,
  );

  useEffect(() => {
    savedCallback.current = callback;
  });

  // Handle page visibility changes
  useEffect(() => {
    if (!pauseWhenHidden || typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsPageVisible((prev) => {
        if (delay !== null && !prev && visible) {
          // Execute callback immediately when page becomes visible again
          savedCallback.current?.();
        }
        return visible;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pauseWhenHidden, delay]);

  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    if (delay !== null) {
      // Only check visibility if pauseWhenHidden is enabled
      if (!pauseWhenHidden || isPageVisible) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }
  }, [delay, pauseWhenHidden, isPageVisible]);
}

/**
 * Custom hook that provides a value updated at a specified interval.
 *
 * @param calculator - A function that calculates the value.
 * @param delay - The delay in milliseconds between updates.
 * @param triggerKey - An optional key that triggers an immediate update when changed.
 * @param pauseWhenHidden - Whether to pause the interval when the page becomes hidden. Defaults to true.
 * @returns The updated value.
 */
export function useIntervalValue<T>(
  calculator: () => T,
  delay: number | null,
  triggerKey?: string,
  pauseWhenHidden: boolean = true,
): T {
  const [result, setResult] = useState<T>(calculator());

  useEffect(() => {
    if (triggerKey) {
      setResult(calculator());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  useInterval(
    () => {
      const newResult = calculator();
      if (newResult !== result) setResult(newResult);
    },
    delay,
    pauseWhenHidden,
  );

  return result;
}
