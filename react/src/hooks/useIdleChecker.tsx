import { BackendAIClient, useSuspendedBackendaiClient } from '.';
import {
  flattenDict,
  useSuspenseTanQuery,
  useTanMutation,
} from 'backend.ai-ui';
import _ from 'lodash';

/**
 * Sets multiple values in etcd by splitting them into batches.
 * This prevents exceeding the 16-item limit of setting API.
 *
 * @param baiClient - Backend.AI client instance
 * @param key - Config key prefix
 * @param values - Nested object of values to update
 *
 * @example
 * ```ts
 * await etcdSetMany(baiClient, 'idle', {
 *   checkers: {
 *     utilization: {
 *       threshold: '0.1'
 *     }
 *   }
 * });
 * ```
 */
export const etcdSetMany = async (
  baiClient: BackendAIClient, // TODO: Type with proper Backend.AI client type
  key: string,
  values: Record<string, any>,
): Promise<void> => {
  const flatDict = flattenDict(values);
  const entries = _.entries(flatDict);

  // Split into chunks of 10 items to safely update
  const chunks = _.chunk(entries, 10);

  for (const chunk of chunks) {
    const kvToUpdate = _.fromPairs(chunk);
    await baiClient.setting.set(key, kvToUpdate);
  }
};

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
      const path = 'idle/checkers/utilization/resource-thresholds';
      await baiClient.setting.delete(path, true);
      await etcdSetMany(baiClient, 'idle', values);
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
