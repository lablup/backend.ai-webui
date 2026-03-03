/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useTanQuery } from './reactQueryAlias';
import { useBAISettingUserState } from './useBAISetting';
import { useEventNotStable, useUpdatableState } from 'backend.ai-ui';
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
  endpoint?: string;
  endpoint_id?: string;
  endpoint_url?: string;
  endpoint_token?: string;
  config: AIAgentConfig;
  meta: AIAgentMeta;
  params?: AIAgentParams;
  isCustom?: boolean;
}

export interface AIAgents {
  agents: AIAgent[];
}

const TIMEOUT_24_HOURS = 24 * 60 * 60 * 1000;

export const useAIAgent = () => {
  const [key, checkUpdate] = useUpdatableState('first');

  const [extraAgents, setExtraAgents] =
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

  const builtInAgents = useMemo(
    () =>
      (agentsData?.agents ?? []).map((a) => ({
        ...a,
        isCustom: false as const,
      })),
    [agentsData],
  );

  const userAgents = useMemo(
    () => (extraAgents ?? []).map((a) => ({ ...a, isCustom: true as const })),
    [extraAgents],
  );

  // Merge: user agents take precedence over built-in agents by ID
  const agents = useMemo(
    () => _.uniqBy([...userAgents, ...builtInAgents], 'id'),
    [userAgents, builtInAgents],
  );

  const upsertAgent = useEventNotStable((agent: AIAgent) => {
    setExtraAgents((prev) => {
      const { isCustom: _isCustom, ...cleaned } = agent;
      return _.uniqBy([cleaned, ...(prev ?? [])], 'id');
    });
  });

  const deleteAgent = useEventNotStable((agentId: string) => {
    setExtraAgents((prev) => (prev ?? []).filter((a) => a.id !== agentId));
  });

  return {
    agents,
    builtInAgents,
    isLoading,
    refresh: useCallback(() => checkUpdate(), [checkUpdate]),
    upsertAgent,
    deleteAgent,
  };
};
