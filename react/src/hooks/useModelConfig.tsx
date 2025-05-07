import { useUpdatableState } from '.';
import { ServiceLauncherFormValue } from '../components/ServiceLauncherPageContent';
import { useTanQuery } from './reactQueryAlias';
import { useCallback } from 'react';

export interface ModelConfig {
  models: ServiceLauncherFormValue[];
}

const TIMEOUT_24_HOURS = 24 * 60 * 60 * 1000;

export const useModelConfig = () => {
  const [key, checkUpdate] = useUpdatableState('first');

  const { data: modelConfig, isLoading } = useTanQuery<ModelConfig>({
    queryKey: ['useModelConfig', key],
    queryFn: () => {
      return fetch('resources/model_config.json').then((response) =>
        response.json(),
      );
    },
    staleTime: TIMEOUT_24_HOURS, // 24 hours
  });

  return {
    agents: modelConfig?.models ?? [],
    isLoading,
    refresh: useCallback(() => checkUpdate(), [checkUpdate]),
  };
};
