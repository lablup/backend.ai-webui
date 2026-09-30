/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AIAgent } from '../../hooks/useAIAgent';
import { APICallError } from 'ai';
import type { UIMessage } from 'ai';

export interface ChatProviderData {
  basePath?: string;
  // A custom OpenAI-compatible endpoint. Set together with an empty
  // `deploymentId`; its API key is kept out of this (persisted) record — see
  // `customEndpointKeyStore.ts`.
  baseURL?: string;
  deploymentId?: string;
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

export function isCustomEndpointProvider(provider: ChatProviderData) {
  return !!provider.baseURL;
}

export function normalizeCustomEndpointURL(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined;
    }
    return url.toString().replace(/\/+$/, '');
  } catch {
    return undefined;
  }
}

export function getCustomEndpointHost(baseURL?: string) {
  if (!baseURL) return undefined;
  try {
    return new URL(baseURL).host;
  } catch {
    return baseURL;
  }
}

export function getLatestUserMessage(messages: Array<ChatMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}
