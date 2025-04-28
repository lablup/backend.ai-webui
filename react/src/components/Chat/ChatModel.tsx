import { AIAgent } from '../../hooks/useAIAgent';

export interface ChatProviderData {
  basePath?: string;
  baseURL?: string;
  endpointId?: string;
  agentId?: string;
  modelId?: string;
  apiKey?: string;
}

export interface ChatData {
  id: string;
  conversationId: string;
  sync: boolean;
  provider: ChatProviderData;
  agent?: AIAgent;
}

export interface ChatConversationData {
  id: string;
  chats: string[];
  provider: ChatProviderData;
  label: string;
}

export interface ChatLifecycleEventType {
  onRequestClose?: (chat: ChatData) => void;
  onCreateNewChat?: () => void;
  onChangeEndpoint?: (endpointId: string) => void;
  onChangeModel?: (modelId: string) => void;
  onChangeAgent?: (agentId: string) => void;
  onChangeSync?: (sync: boolean) => void;
}

export interface ChatModel {
  id: string;
  name?: string;
  group?: string;
  created?: string;
  description?: string;
}
