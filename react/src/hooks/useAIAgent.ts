import { useUpdatableState } from '.';
import { useTanQuery } from './reactQueryAlias';
import { useBAISettingUserState } from './useBAISetting';
import { useEventNotStable } from './useEventNotStable';
import _ from 'lodash';
import { useCallback, useMemo } from 'react';

export interface AIAgentMeta {
  title: string;
  avatar?: string;
  background?: string;
  descriptions?: string;
  tags?: string[];
}

export interface AIAgentConfig {
  system_prompt: string;
  default_model?: string;
  [key: string]: any; // for additionalProperties: true
}

export interface AIAgentParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  [key: string]: any; // for additionalProperties: true
}

export interface AIAgent {
  id: string;
  endpoint: string;
  endpoint_id: string;
  endpoint_url?: string;
  endpoint_token?: string;
  config: AIAgentConfig;
  meta: AIAgentMeta;
  params?: AIAgentParams;
}

export interface AIAgents {
  agents: AIAgent[];
}

const TIMEOUT_24_HOURS = 24 * 60 * 60 * 1000;

export const useAIAgent = () => {
  const [key, checkUpdate] = useUpdatableState('first');

  const [extraAIAgents, setExtraAIAgents] =
    useBAISettingUserState('extra_ai_agents');

  const { data: agentsData, isLoading } = useTanQuery<AIAgents>({
    queryKey: ['useAgents', key],
    queryFn: () => {
      return fetch('resources/ai-agents.json').then((response) =>
        response.json(),
      );
    },
    staleTime: TIMEOUT_24_HOURS, // 24 hours
  });

  const mergedAgents = useMemo(() => {
    return _.uniqBy(
      [...(extraAIAgents ?? []), ...(agentsData?.agents ?? [])],
      'id',
    );
  }, [extraAIAgents, agentsData]);

  const upsertAIAgent = useEventNotStable((agent: AIAgent) => {
    const newExtraAgents = _.uniqBy([agent, ...(extraAIAgents ?? [])], 'id');
    setExtraAIAgents(newExtraAgents);
  });

  return {
    agents: mergedAgents,
    isLoading,
    refresh: useCallback(() => checkUpdate(), [checkUpdate]),
    upsertAIAgent,
  };
};
