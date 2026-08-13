import { useDebounce, type DebounceOptions } from '../hooks';
import { useDeferredValue } from 'react';

export const useDebouncedDeferredValue = <T>(
  value: T,
  options: DebounceOptions = {
    wait: 200,
  },
): T => {
  const debouncedValue = useDebounce(value, options);
  const deferredValue = useDeferredValue(debouncedValue);
  return deferredValue;
};

export default useDebouncedDeferredValue;
