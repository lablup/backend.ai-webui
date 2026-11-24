/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSyncExternalStore } from 'react';

// Base URL of the custom endpoint connected since this page loaded. Memory
// only, so a reload asks to connect a custom endpoint again.
let connectedBaseURL: string | undefined;
const listeners = new Set<() => void>();

export function setCustomConnectionThisLoad(baseURL?: string) {
  connectedBaseURL = baseURL;
  listeners.forEach((listener) => listener());
}

export function useCustomConnectionThisLoad() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => connectedBaseURL,
  );
}
