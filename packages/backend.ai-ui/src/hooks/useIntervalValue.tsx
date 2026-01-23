import { useEffect, useEffectEvent, useState } from 'react';

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
  const [isPageVisible, setIsPageVisible] = useState(() =>
    typeof document === 'undefined' ? true : !document.hidden,
  );

  const tick = useEffectEvent(() => {
    callback();
  });

  // Handle page visibility changes if pauseWhenHidden is true
  useEffect(() => {
    // If pauseWhenHidden is false or we're not in a browser environment, do nothing
    if (!pauseWhenHidden || typeof window === 'undefined') return;
    const handler = () => {
      const isVisibleNow = !document.hidden;
      setIsPageVisible(isVisibleNow);
      if (isVisibleNow && delay !== null) {
        tick();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [pauseWhenHidden, delay]);

  // Determine the effective delay based on page visibility
  const effectiveDelay = pauseWhenHidden && !isPageVisible ? null : delay;

  // Set up the interval
  useEffect(() => {
    if (effectiveDelay !== null) {
      const id = setInterval(tick, effectiveDelay);
      return () => clearInterval(id);
    }
  }, [effectiveDelay]);
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

  const updateCalculator = useEffectEvent(() => {
    setResult(calculator());
  });

  useEffect(() => {
    if (triggerKey) {
      updateCalculator();
    }
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
