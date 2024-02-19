import { useEffect, useRef, useState } from 'react';

export function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => any>();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    let id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export const useIntervalValue = (calculator: () => any, delay: number) => {
  const [result, setResult] = useState(calculator());

  useInterval(() => {
    const newResult = calculator();
    if (newResult !== result) setResult(newResult);
  }, delay);

  return result;
};
