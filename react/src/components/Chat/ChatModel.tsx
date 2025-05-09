import { AIAgent } from '../../hooks/useAIAgent';

export type ChatProviderType = {
  baseURL?: string;
  basePath: string;
  agentId?: string;
  endpointId?: string;
  modelId?: string;
  apiKey?: string;
  credentials?: RequestCredentials;
};

export interface ChatParameter {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export type ChatType = {
  id: string;
  conversationId: string;
  label: string;
  sync: boolean;
  provider: ChatProviderType;
  parameter: ChatParameter;
  agent?: AIAgent;
};

export type ConversationType = {
  id: string;
  label: string;
  chats: ChatType[];
};

export interface ChatLifecycleEventType {
  onRequestClose?: (chat: ChatType) => void;
  onCreateNewChat?: () => void;
}

interface ModelPermission {
  id: string;
  object: string;
  created: number;
  allow_create_engine: boolean;
  allow_sampling: boolean;
  allow_logprobs: boolean;
  allow_search_indices: boolean;
  allow_view: boolean;
  allow_fine_tuning: boolean;
  organization: string;
  group: string | null;
  is_blocking: boolean;
}

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  root: string;
  parent: string | null;
  max_model_len: number;
  permission: ModelPermission[];
}

export type BAIModel = {
  id: string;
  label?: string;
  name?: string;
  group?: string;
  created?: string;
  description?: string;
};

export const DefaultChatParameter = {
  maxTokens: 16394 / 2,
  temperature: 0.7,
  topP: 1,
  topK: 1,
  frequencyPenalty: 1,
  presencePenalty: 1,
};

// @FIXME: use this enum to generate the parameter
type ChatParameterType =
  | 'maxTokens'
  | 'temperature'
  | 'topP'
  | 'topK'
  | 'frequencyPenalty'
  | 'presencePenalty';
