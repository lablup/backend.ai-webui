/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUILocation, useWebUINavigate } from './index';
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

  // Read from the router, not nuqs: nuqs applies the palette's navigation in a
  // transition, which React holds back while any async action is pending.
  const location = useWebUILocation();
  const navigate = useWebUINavigate();
  const action = new URLSearchParams(location.search).get(CREATE_ACTION_PARAM);

  const arrive = useEffectEvent(() => {
    open();
    const search = new URLSearchParams(location.search);
    search.delete(CREATE_ACTION_PARAM);
    navigate(
      { search: search.toString(), hash: location.hash },
      { replace: true, state: location.state },
    );
  });

  useEffect(() => {
    if (action === CREATE_ACTION_VALUE) arrive();
  }, [action]);
};
