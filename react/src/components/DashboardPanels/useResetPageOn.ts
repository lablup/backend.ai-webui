/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useState } from 'react';

/**
 * Sends a card's table back to page 1 when `key` (its filter, range or scope,
 * as plain data) changes. Never pass the refreshed time window: it changes on
 * every refresh.
 */
export const useResetPageOn = (
  key: unknown,
  resetPage: (option: { current: number }) => void,
) => {
  'use memo';
  const serialized = JSON.stringify(key);
  const [pagedKey, setPagedKey] = useState(serialized);
  if (pagedKey !== serialized) {
    setPagedKey(serialized);
    resetPage({ current: 1 });
  }
};
