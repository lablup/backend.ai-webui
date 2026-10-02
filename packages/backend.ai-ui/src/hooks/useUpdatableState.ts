/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Generic state hooks, kept out of `hooks/index.ts`: that barrel also holds
 client and Relay hooks, so importing from it pulls them in.
*/
import { useEventNotStable } from './useEventNotStable';
import { useState } from 'react';

/** A string state whose setter defaults to the current time as ISO text. */
export const useDateISOState = (initialValue?: string) => {
  'use memo';
  const [value, setValue] = useState(initialValue || new Date().toISOString());

  const update = useEventNotStable((newValue?: string) => {
    setValue(newValue || new Date().toISOString());
  });
  return [value, update] as const;
};

export const useUpdatableState = (initialValue: string) => {
  return useDateISOState(initialValue);
};
