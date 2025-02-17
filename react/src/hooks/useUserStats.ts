import { UserStatsData, useSuspendedBackendaiClient } from '.';
import { useSuspenseTanQuery } from './reactQueryAlias';

type Options = {
  staleTime: number;
  gcTime: number;
};

const useUserStats = (
  options: Options = {
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 5,
  },
) => {
  const baiClient = useSuspendedBackendaiClient();

  return useSuspenseTanQuery<UserStatsData[]>({
    queryKey: ['UsageHistory', baiClient._config._userId],
    queryFn: () => {
      return baiClient.resources.user_stats();
    },
    gcTime: options.gcTime,
    staleTime: options.staleTime,
  });
};

export default useUserStats;
