/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../../hooks';
import { useDashboardFilterContext } from './useDashboardFilters';
import { useLocation } from 'react-router-dom';

/**
 * Opens the page's session drawer, which reads `sessionDetail` as on the
 * session list. Null on the project admin page, which mounts no drawer.
 */
export const useOpenSessionDetail = ():
  ((sessionId: string) => void) | null => {
  'use memo';
  const location = useLocation();
  const webuiNavigate = useWebUINavigate();
  const scope = useDashboardFilterContext()?.scope;
  if (scope?.kind === 'projects' && scope.projectIds !== 'all') return null;
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
