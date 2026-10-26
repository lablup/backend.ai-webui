/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../../hooks';
import { useLocation } from 'react-router-dom';

/** Opens the page's session drawer, which reads `sessionDetail` as on the session list. */
export const useOpenSessionDetail = () => {
  'use memo';
  const location = useLocation();
  const webuiNavigate = useWebUINavigate();
  return (sessionId: string) => {
    const params = new URLSearchParams(location.search);
    params.set('sessionDetail', sessionId);
    webuiNavigate({
      pathname: location.pathname,
      hash: location.hash,
      search: params.toString(),
    });
  };
};
