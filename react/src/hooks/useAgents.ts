import { useUpdatableState } from '.';
import { useTanQuery } from './reactQueryAlias';
import { useCallback } from 'react';

export interface AgentMeta {
  title: string;
  avatar?: string;
  background?: string;
  descriptions?: string;
  tags?: string[];
}

export interface AgentConfig {
  system_prompt: string;
  [key: string]: any; // for additionalProperties: true
}

export interface AgentParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  [key: string]: any; // for additionalProperties: true
}

export interface Agent {
  id: string;
  model: string;
  model_id: string;
  config: AgentConfig;
  meta: AgentMeta;
  params?: AgentParams;
}

export interface Agents {
  agents: Agent[];
}

const TIMEOUT_24_HOURS = 24 * 60 * 60 * 1000;

export const useAgents = () => {
  const [key, checkUpdate] = useUpdatableState('first');

  const { data: agentsData, isLoading } = useTanQuery<Agents>({
    queryKey: ['useAgents', key],
    queryFn: () => {
      return fetch('resources/agents.json').then((response) => response.json());
    },
    staleTime: TIMEOUT_24_HOURS, // 24 hours
  });

  return {
    agents: agentsData?.agents ?? [],
    isLoading,
    refresh: useCallback(() => checkUpdate(), [checkUpdate]),
  };
};
