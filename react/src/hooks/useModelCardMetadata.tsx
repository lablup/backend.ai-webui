import { ServiceLauncherFormValue } from '../components/ServiceLauncherPageContent';
import { useTanQuery } from './reactQueryAlias';
import { useUpdatableState } from 'backend.ai-ui';
import { useCallback } from 'react';

export interface ModelCard extends ServiceLauncherFormValue {
  name?: string;
}

export interface ModelCardMetadata {
  models: ModelCard[];
  sorting: string[];
}

const TIMEOUT_24_HOURS = 24 * 60 * 60 * 1000;

export const useModelCardMetadata = () => {
  const [updateKey, checkUpdateKey] = useUpdatableState('first');

  const { data: modelCardConfig, isLoading } = useTanQuery<ModelCardMetadata>({
    queryKey: ['use-model-card-metadata', updateKey],
    queryFn: () => {
      return fetch('resources/model_card_metadata.json').then((response) => {
        return response.json();
      });
    },
    staleTime: TIMEOUT_24_HOURS, // 24 hours
  });

  return {
    models: modelCardConfig?.models ?? [],
    sorting: modelCardConfig?.sorting ?? [],
    isLoading,
    refresh: useCallback(() => checkUpdateKey(), [checkUpdateKey]),
  };
};
