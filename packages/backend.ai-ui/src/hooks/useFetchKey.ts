import { useEventNotStable } from './useEventNotStable';
import { useState } from 'react';

const useDateISOState = (initialValue?: string) => {
  const [value, setValue] = useState(initialValue || new Date().toISOString());

  const update = useEventNotStable((newValue?: string) => {
    setValue(newValue || new Date().toISOString());
  });
  return [value, update] as const;
};

export const INITIAL_FETCH_KEY = 'first';
export const useFetchKey = () => {
  return [...useDateISOState(INITIAL_FETCH_KEY), INITIAL_FETCH_KEY] as const;
};
