import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook that executes a callback function at a specified interval.
 *
 * @param callback The function to be executed at the specified interval.
 * @param delay The delay (in milliseconds) between each execution of the callback function. If `null`, the interval is cleared(pause).
 */
export function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => any>(() => {});

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

/**
 * Custom hook that provides a value updated at a specified interval.
 *
 * @param calculator - A function that calculates the value.
 * @param delay - The delay in milliseconds between updates.
 * @param triggerKey - An optional key that triggers an immediate update when changed.
 * @returns The updated value.
 */
export const useIntervalValue = (
  calculator: () => any,
  delay: number,
  triggerKey?: string,
) => {
  const [result, setResult] = useState(calculator());

  useEffect(() => {
    if (triggerKey) {
      setResult(calculator());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  useInterval(() => {
    const newResult = calculator();
    if (newResult !== result) setResult(newResult);
  }, delay);

  return result;
};
