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
