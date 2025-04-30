import { APICallError } from 'ai';
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

export interface ChatParameters {
  maxTokens: number;
  temperature: number;
  topP: number;
  topK: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export type ChatMessage = UIMessage;

export interface ChatData {
  id: string;
  conversationId: string;
  sync: boolean;
  usingParameters: boolean;
  parameters: ChatParameters;
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
};

export function getAIErrorMessage(error: unknown): string {
  try {
    if (APICallError.isInstance(error)) {
      if (!error.responseBody) {
        return error.message;
      }

      const errorBody = JSON.parse(error.responseBody || '{}');

      return errorBody.message;
    } else if (error instanceof Error) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    }
  } catch {}

  return 'Unknown error:' + error;
}

export const defaultChatParameters = {
  maxTokens: 4096,
  temperature: 0.7,
  topP: 1,
  topK: 1,
  frequencyPenalty: 1,
  presencePenalty: 1,
};

export function getLatestUserMessage(messages: Array<ChatMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}
