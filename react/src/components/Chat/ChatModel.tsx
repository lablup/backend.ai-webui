import type { AIAgent } from '../../hooks/useAIAgent';
import type { UIMessage } from 'ai';

export interface ChatProviderData {
  basePath?: string;
  baseURL?: string;
  endpointId?: string;
  agentId?: string;
  modelId?: string;
  apiKey?: string;
}

export type ChatMessage = UIMessage;

export interface ChatData {
  id: string;
  conversationId: string;
  sync: boolean;
  provider: ChatProviderData;
  agent?: AIAgent;
  messages: ChatMessage[];
}

export interface ChatConversationData {
  id: string;
  chats: string[];
  provider: ChatProviderData;
  label: string;
  updatedAt: string;
}

export interface ChatLifecycleEventType {
  onRequestClose?: (chat: ChatData) => void;
  onCreateNewChat?: (chat: ChatData) => void;
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

export function getLatestUserMessage(messages: Array<ChatMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}
