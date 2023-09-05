import { useSuspendedBackendaiClient, useUpdatableState } from '.';
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
  // const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const baiClient = useSuspendedBackendaiClient();
  const { data: resourceSlots } = useTanQuery<{
    cpu?: string;
    mem?: string;
    'cuda.shares'?: string;
    'cuda.device'?: string;
  }>({
    queryKey: ['useResourceSlots', key],
    queryFn: () => {
      return baiClient.get_resource_slots();
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
