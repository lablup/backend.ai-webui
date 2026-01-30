import { useSuspendedBackendaiClient } from '.';
import { useSuspenseTanQuery, useTanMutation } from 'backend.ai-ui';

export type IdleInfoType = {
  'app-streaming-packet-timeout'?: string;
  checkers: {
    network_timeout?: {
      threshold: string;
    };
    utilization?: {
      'resource-thresholds'?: {
        [key: string]: {
          average: string;
        };
      };
      'initial-grace-period': string;
      'time-window': string;
      'thresholds-check-operator': 'and' | 'or';
    };
  };
  enabled: string;
};

const useIdleChecker = (fetchKey = '') => {
  const baiClient = useSuspendedBackendaiClient();

  const { data: idleInfo } = useSuspenseTanQuery({
    queryKey: ['idle_checker', fetchKey],
    queryFn: async () => {
      return await baiClient.setting.list('idle').then((res) => res.result);
    },
  });
  const update = useTanMutation({
    mutationFn: async (values: IdleInfoType) => {
      await baiClient.setting.set('idle', values);
    },
  });

  const clear = useTanMutation({
    mutationFn: async () => {
      await baiClient.setting.delete('idle', true);
    },
  });

  return {
    idleInfo,
    update,
    clear,
  };
};

export default useIdleChecker;
