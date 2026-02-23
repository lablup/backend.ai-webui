/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AIAgent, AIAgentParams } from '../../hooks/useAIAgent';
import { APICallError } from 'ai';
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
  maxOutputTokens: number;
  temperature: number;
  topP: number;
  topK: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export type ChatMessage = UIMessage;

export interface ChatData {
  id: string;
  sync: boolean;
  usingParameters: boolean;
  parameters: ChatParameters;
  provider: ChatProviderData;
  agent?: AIAgent;
  messages: ChatMessage[];
}

export interface ChatModel {
  id: string;
  name?: string;
  group?: string;
  created?: string;
  description?: string;
}

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
    return 'Unknown error:' + error;
  } catch {
    return 'Unknown error:' + error;
  }
}

export const DEFAULT_CHAT_PARAMETERS = {
  maxOutputTokens: 4096,
  temperature: 0.7,
  topP: 1,
  topK: 1,
  frequencyPenalty: 1,
  presencePenalty: 1,
};

export function mapAgentParamsToChatParams(
  agentParams: AIAgentParams,
): ChatParameters {
  return {
    ...DEFAULT_CHAT_PARAMETERS,
    ...(agentParams.temperature !== undefined && {
      temperature: agentParams.temperature,
    }),
    ...(agentParams.max_tokens !== undefined && {
      maxOutputTokens: agentParams.max_tokens,
    }),
    ...(agentParams.top_p !== undefined && { topP: agentParams.top_p }),
    ...(agentParams.frequency_penalty !== undefined && {
      frequencyPenalty: agentParams.frequency_penalty,
    }),
    ...(agentParams.presence_penalty !== undefined && {
      presencePenalty: agentParams.presence_penalty,
    }),
  };
}

export function getLatestUserMessage(messages: Array<ChatMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}
