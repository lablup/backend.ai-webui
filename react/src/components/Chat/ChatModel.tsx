import { AIAgent } from '../../hooks/useAIAgent';
import {
  ChatCard_endpoint$data,
  ChatCard_endpoint$key,
} from './__generated__/ChatCard_endpoint.graphql';

export type ChatProviderType = {
  baseURL?: string;
  basePath: string;
  agentId?: string;
  endpointId?: string;
  modelId?: string;
  apiKey?: string;
  credentials?: RequestCredentials;
};

export type ChatType = {
  id: string;
  conversationId: string;
  label: string;
  sync: boolean;
  provider: ChatProviderType;
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

export type ChatOptions = {
  models: BAIModel[];
  modelId: string;
  endpoint?: ChatCard_endpoint$data | null;
  endpointKey?: ChatCard_endpoint$key | null;
  agents: AIAgent[];
  agentId?: string;
};

export class ChatModelError extends Error {
  status: number;

  constructor(status: number) {
    super(ChatModelError.errorMessage(status));
    this.name = 'ModelsError';
    this.status = status;
  }

  static errorMessage(status: number) {
    switch (status) {
      case 401:
        return 'Unauthorized. Please check your token.';
      case 404:
        return 'Not Found. Please check your base URL.';
      case 500:
        return 'Internal Server Error. Please try again later.';
      case 503:
        return 'Service Unavailable. Please try again later.';
      default:
        return `An unknown error occurred. Please try again. with status ${status}`;
    }
  }
}
