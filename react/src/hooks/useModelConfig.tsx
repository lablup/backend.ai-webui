import { useUpdatableState } from '.';
import { ServiceLauncherFormValue } from '../components/ServiceLauncherPageContent';
import { useTanQuery } from './reactQueryAlias';
import { useCallback } from 'react';

export interface ModelConfigMeta extends ServiceLauncherFormValue {
  name?: string;
}

export interface TalkativotMeta {
  title: string;
  src: string;
}

export interface ModelConfig {
  models: ModelConfigMeta[];
  sorting: string[];
  talkativot: TalkativotMeta;
}

const TIMEOUT_24_HOURS = 24 * 60 * 60 * 1000;

export const useModelConfig = () => {
  const [key, checkUpdate] = useUpdatableState('first');

  const { data: modelConfig, isLoading } = useTanQuery<ModelConfig>({
    queryKey: ['useModelConfig', key],
    queryFn: () => {
      return fetch('resources/model_config.json').then((response) => {
        return response.json();
      });
    },
    staleTime: TIMEOUT_24_HOURS, // 24 hours
  });

  return {
    modelConfig: modelConfig?.models ?? [],
    sorting: modelConfig?.sorting ?? [],
    talkativot: modelConfig?.talkativot ?? {
      title: '',
      src: '',
    },
    isLoading,
    refresh: useCallback(() => checkUpdate(), [checkUpdate]),
  };
};
