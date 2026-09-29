/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useEffectEvent } from 'react';

/** Deep-link param the credentials page established and the palette reuses. */
export const CREATE_ACTION_PARAM = 'action';
export const CREATE_ACTION_VALUE = 'add';

/**
 * Arrival half of the `?action=add` contract: opens the page's create modal
 * once and strips the param, so a reload is not a second arrival.
 */
export const useCreateActionArrival = (open: () => void): void => {
  'use memo';

  const [action, setAction] = useQueryState(CREATE_ACTION_PARAM, parseAsString);

  const arrive = useEffectEvent(() => {
    open();
    setAction(null);
  });

  useEffect(() => {
    if (action === CREATE_ACTION_VALUE) arrive();
  }, [action]);
};
