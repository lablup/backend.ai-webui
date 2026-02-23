/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserStatsData, useSuspendedBackendaiClient } from '.';
import { useSuspenseTanQuery } from './reactQueryAlias';

type Options = {
  fetchKey?: string;
};

const useUserUsageStats = (options?: Options) => {
  const baiClient = useSuspendedBackendaiClient();

  return useSuspenseTanQuery<UserStatsData[]>({
    queryKey: ['UsageHistory', baiClient._config._userId, options?.fetchKey],
    queryFn: () => {
      return baiClient.resources.user_stats();
    },
  });
};

export default useUserUsageStats;
