/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useTanQuery } from './reactQueryAlias';
import { useBAISettingUserState } from './useBAISetting';
import { useUpdatableState } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useEffect } from 'react';

/**
 * AgentProfile schema, aligned with lablup/agent-catalog.
 * https://github.com/lablup/agent-catalog/blob/main/schemas/agent-profile.schema.json
 */
export type AgentCategory =
  | 'code_assistant'
  | 'research_analyst'
  | 'document_creator'
  | 'data_analyst'
  | 'custom_agent'
  | 'utility';

export type ToolPermission =
  | 'always_allow'
  | 'ask_once'
  | 'ask_always'
  | 'never_allow';

export interface ToolConfig {
  enabledTools?: string[];
  disabledTools?: string[];
  toolPermissionOverrides?: Record<string, ToolPermission>;
  customToolConfigs?: Record<string, unknown>;
}

export interface ModelPreferences {
  preferredModelId?: string | null;
  minContextWindow?: number | null;
  requiresToolCalling?: boolean;
  requiresVision?: boolean;
}

export interface AgentSettingsOverrides {
  maxIterations?: number | null;
  maxToolCalls?: number | null;
  defaultTimeout?: number | null;
  contextCompressionThreshold?: number | null;
  allowedPaths?: string[] | null;
}

export interface ProfileTranslation {
  name?: string;
  description?: string;
  systemPrompt?: string;
  instructions?: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  description?: string;
  version?: string;
  author?: string;
  icon?: string;
  category?: AgentCategory;
  systemPrompt?: string;
  instructions?: string;
  toolConfig?: ToolConfig;
  modelPreferences?: ModelPreferences;
  settingsOverrides?: AgentSettingsOverrides;
  translations?: Record<string, ProfileTranslation>;
  tags?: string[];
  isBuiltin?: boolean;
  isCommunity?: boolean;
  sourceUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Runtime-only marker added by the hook so the UI can tell built-in profiles
 * (shipped in ai-agents.json) from custom profiles (stored in user settings).
 */
export type AIAgent = AgentProfile & { isCustom?: boolean };

export interface AIAgentsBundle {
  version: number;
  updatedAt: string;
  profiles: AgentProfile[];
}

/**
 * WebUI-specific endpoint binding stored alongside (but separate from) the
 * portable AgentProfile. The profile stays catalog-compatible; this sidecar
 * carries the inference endpoint a user has paired with a given profile id.
 */
export interface AgentEndpointBinding {
  endpoint?: string;
  endpoint_id?: string;
  endpoint_url?: string;
  endpoint_token?: string;
}

export type AgentEndpointBindings = Record<string, AgentEndpointBinding>;

const TIMEOUT_24_HOURS = 24 * 60 * 60 * 1000;
const EMPTY_BINDINGS: AgentEndpointBindings = {};

/**
 * Pre-FR-2854 entries in `extra_ai_agents` followed the bespoke shape
 *   { meta:{title,avatar,descriptions,tags}, config:{system_prompt,default_model},
 *     params, endpoint, endpoint_id, endpoint_url, endpoint_token, ... }
 * Detect and convert them into AgentProfile + endpoint sidecar.
 */
interface LegacyAIAgent {
  id?: string;
  meta?: {
    title?: string;
    avatar?: string;
    descriptions?: string;
    tags?: string[];
  };
  config?: {
    system_prompt?: string;
    default_model?: string;
  };
  endpoint?: string;
  endpoint_id?: string;
  endpoint_url?: string;
  endpoint_token?: string;
}

const isLegacyAgent = (a: unknown): a is LegacyAIAgent =>
  !!a && typeof a === 'object' && ('meta' in a || 'config' in a);

const migrateLegacy = (
  legacy: LegacyAIAgent,
): { profile: AgentProfile; binding: AgentEndpointBinding | null } => {
  const now = new Date().toISOString();
  const fallbackId =
    legacy.id ?? `migrated-${Math.random().toString(36).slice(2, 12)}`;
  const profile: AgentProfile = {
    id: fallbackId,
    name: legacy.meta?.title ?? fallbackId,
    description: legacy.meta?.descriptions ?? '',
    icon: legacy.meta?.avatar ?? '🤖',
    category: 'custom_agent',
    systemPrompt: legacy.config?.system_prompt ?? '',
    instructions: '',
    tags: legacy.meta?.tags ?? [],
    modelPreferences: legacy.config?.default_model
      ? { preferredModelId: legacy.config.default_model }
      : {},
    toolConfig: {},
    settingsOverrides: {},
    translations: {},
    isBuiltin: false,
    isCommunity: false,
    sourceUrl: null,
    createdAt: now,
    updatedAt: now,
  };
  const binding: AgentEndpointBinding | null =
    legacy.endpoint ||
    legacy.endpoint_id ||
    legacy.endpoint_url ||
    legacy.endpoint_token
      ? {
          endpoint: legacy.endpoint,
          endpoint_id: legacy.endpoint_id,
          endpoint_url: legacy.endpoint_url,
          endpoint_token: legacy.endpoint_token,
        }
      : null;
  return { profile, binding };
};

export const useAIAgent = () => {
  'use memo';

  const [key, checkUpdate] = useUpdatableState('first');

  const [extraAgents, setExtraAgents] =
    useBAISettingUserState('extra_ai_agents');
  const [endpointBindings, setEndpointBindings] =
    useBAISettingUserState('agent_endpoints');

  const { data: bundle, isLoading } = useTanQuery<AIAgentsBundle>({
    queryKey: ['useAgents', key],
    queryFn: () =>
      fetch('resources/ai-agents.json').then((response) => response.json()),
    staleTime: TIMEOUT_24_HOURS,
  });

  // One-time migration: convert any pre-FR-2854 legacy entries to the
  // AgentProfile shape and move endpoint fields into the sidecar.
  useEffect(() => {
    if (!extraAgents || extraAgents.length === 0) return;
    if (!extraAgents.some((a) => isLegacyAgent(a))) return;

    const migratedProfiles: AgentProfile[] = [];
    const migratedBindings: AgentEndpointBindings = {};
    for (const entry of extraAgents) {
      if (isLegacyAgent(entry)) {
        const { profile, binding } = migrateLegacy(entry);
        migratedProfiles.push(profile);
        if (binding) migratedBindings[profile.id] = binding;
      } else {
        migratedProfiles.push(entry as AgentProfile);
      }
    }
    setExtraAgents(migratedProfiles);
    setEndpointBindings((prev) => ({ ...(prev ?? {}), ...migratedBindings }));
  }, [extraAgents, setExtraAgents, setEndpointBindings]);

  const builtInAgents: AIAgent[] = (bundle?.profiles ?? []).map((p) => ({
    ...p,
    isCustom: false as const,
  }));

  const userAgents: AIAgent[] = (extraAgents ?? [])
    .filter((p): p is AgentProfile => !isLegacyAgent(p))
    .map((p) => ({ ...p, isCustom: true as const }));

  // Merge: user agents take precedence over built-in agents by ID.
  const agents = _.uniqBy([...userAgents, ...builtInAgents], 'id');

  const upsertAgent = (agent: AIAgent) => {
    setExtraAgents((prev) =>
      _.uniqBy(
        [_.omit(agent, 'isCustom') as AgentProfile, ...(prev ?? [])],
        'id',
      ),
    );
  };

  const deleteAgent = (agentId: string) => {
    setExtraAgents((prev) => (prev ?? []).filter((a) => a.id !== agentId));
    setEndpointBindings((prev) => {
      if (!prev || !(agentId in prev)) return prev;
      const next = { ...prev };
      delete next[agentId];
      return next;
    });
  };

  const upsertEndpointBinding = (
    agentId: string,
    binding: AgentEndpointBinding | null,
  ) => {
    setEndpointBindings((prev) => {
      const next = { ...(prev ?? {}) };
      if (
        binding === null ||
        (!binding.endpoint &&
          !binding.endpoint_id &&
          !binding.endpoint_url &&
          !binding.endpoint_token)
      ) {
        delete next[agentId];
        return next;
      }
      next[agentId] = binding;
      return next;
    });
  };

  const getEndpointBinding = (
    agentId: string,
  ): AgentEndpointBinding | undefined => endpointBindings?.[agentId];

  return {
    agents,
    builtInAgents,
    endpointBindings: endpointBindings ?? EMPTY_BINDINGS,
    getEndpointBinding,
    isLoading,
    refresh: () => checkUpdate(),
    upsertAgent,
    deleteAgent,
    upsertEndpointBinding,
  };
};
