import { UserStatsData, useSuspendedBackendaiClient } from '.';
import { useSuspenseTanQuery } from './reactQueryAlias';
import _ from 'lodash';

export type UsageHistoryKey = keyof Omit<UserStatsData, 'date'>;
export type Period = '1D' | '1W';

type Options = {
  staleTime: number;
  gcTime: number;
};

const templates: {
  [key in Period]: {
    interval: number;
    length: number;
  };
} = {
  '1D': {
    interval: 15 / 15,
    length: 4 * 24,
  },
  '1W': {
    interval: 15 / 15,
    length: 4 * 24 * 7,
  },
};

const useUserStats = (
  keys: UsageHistoryKey[],
  period: Period,
  options: Options = {
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 5,
  },
) => {
  const baiClient = useSuspendedBackendaiClient();

  const { data, ...rest } = useSuspenseTanQuery<UserStatsData[]>({
    queryKey: ['UsageHistory'],
    queryFn: () => {
      return baiClient.resources.user_stats();
    },
    gcTime: options.gcTime,
    staleTime: options.staleTime,
    retry: 2,
  });

  const filteredData = data
    .filter((_, i) => data.length - templates[period].length <= i)
    .map((d) => {
      return {
        date: new Date(d.date * 1000),
        data: {
          ...Object.fromEntries(
            Object.entries(_.omit(d, 'date')).filter(([k]) =>
              keys.includes(k as UsageHistoryKey),
            ),
          ),
        },
      };
    });
  return {
    data: filteredData,
    ...rest,
  };
};

export default useUserStats;
