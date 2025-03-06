import { UserStatsData, useSuspendedBackendaiClient } from '.';
import { useSuspenseTanQuery } from './reactQueryAlias';
import { useMemo } from 'react';

export type UsageHistoryKey = keyof Omit<UserStatsData, 'date'>;
export type Period = '1D' | '1W';
export type UnitHint = 'count' | 'B' | 'KB' | 'MB' | 'GB' | 'TB';

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
    queryKey: ['UsageHistory', baiClient._config._userId],
    queryFn: () => {
      return baiClient.resources.user_stats();
    },
    gcTime: options.gcTime,
    staleTime: options.staleTime,
  });

  const filteredData = useMemo(() => {
    return Object.keys(templates).reduce(
      (acc, p) => {
        return {
          ...acc,
          [p as Period]: data
            .filter((_, i) => data.length - templates[p as Period].length <= i)
            .map((d) => ({
              date: new Date(d.date * 1000),
              data: Object.fromEntries(
                Object.entries(d).filter(([k]) =>
                  keys.includes(k as UsageHistoryKey),
                ),
              ),
            })),
        };
      },
      {} as {
        [period in Period]: {
          date: Date;
          data: Record<UsageHistoryKey, { value: number; unit_hint: string }>;
        }[];
      },
    );
  }, [data, keys]);

  return {
    data: filteredData[period],
    ...rest,
  };
};

export default useUserStats;
