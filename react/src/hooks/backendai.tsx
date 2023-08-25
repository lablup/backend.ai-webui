import { useUpdatableState } from '.';
import { useBaiSignedRequestWithPromise } from '../helper';
import { useTanQuery } from './reactQueryAlias';

export interface QuotaScope {
  id: string;
  quota_scope_id: string;
  storage_host_name: string;
  details: {
    hard_limit_bytes: number | null;
    usage_bytes: number | null;
    usage_count: number | null;
  };
}

export const useResourceSlots = () => {
  const [key, checkUpdate] = useUpdatableState('first');
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const { data: resourceSlots } = useTanQuery({
    queryKey: ['useResourceSlots', key],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'GET',
        url: `/config/resource-slots`,
      }) as Promise<any>;
    },
    staleTime: 0,
  });
  return [
    resourceSlots,
    {
      refresh: () => checkUpdate(),
    },
  ] as const;
};
