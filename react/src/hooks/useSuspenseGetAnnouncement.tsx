/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useSuspenseTanQuery } from './reactQueryAlias';

// Single source of truth for the announcement query key, shared by the
// fetchers below and by mutations that need to invalidate it.
export const ANNOUNCEMENT_QUERY_KEY = [
  'baiClient',
  'service',
  'get_announcement',
];

/**
 * Fetch the current system announcement (`{ enabled, message }`) via the
 * manager REST API. Suspends until the request resolves.
 */
export const useSuspenseGetAnnouncement = () => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  return useSuspenseTanQuery({
    queryKey: ANNOUNCEMENT_QUERY_KEY,
    queryFn: () => {
      return baiClient.service.get_announcement();
    },
  });
};
