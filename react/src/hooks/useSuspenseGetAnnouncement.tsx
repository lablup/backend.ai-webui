/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useSuspenseTanQuery } from './reactQueryAlias';
import { queryOptions } from '@tanstack/react-query';

type BAIClient = ReturnType<typeof useSuspendedBackendaiClient>;

/**
 * Query options (key + fetcher) for the current system announcement
 * (`{ enabled, message }`), retrieved via the manager REST API. Reusable by the
 * hook below and by callers that only need the query key (e.g. cache
 * invalidation after a mutation).
 */
export const announcementQueryOptions = (baiClient: BAIClient) =>
  queryOptions({
    queryKey: ['baiClient', 'service', 'get_announcement'],
    queryFn: () => baiClient.service.get_announcement(),
  });

/**
 * Fetch the current system announcement. Suspends until the request resolves.
 */
export const useSuspenseGetAnnouncement = () => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  return useSuspenseTanQuery(announcementQueryOptions(baiClient));
};
