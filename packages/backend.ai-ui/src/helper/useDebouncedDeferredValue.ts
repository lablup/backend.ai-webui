import { useDebounce } from 'ahooks';
import type { DebounceOptions } from 'ahooks/lib/useDebounce/debounceOptions';
import { useDeferredValue } from 'react';

const useDebouncedDeferredValue = <T>(
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
