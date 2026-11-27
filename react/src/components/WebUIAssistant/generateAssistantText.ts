/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  extractReasoningMiddleware,
  generateText,
  wrapLanguageModel,
  type ModelMessage,
} from 'ai';

/** One non-streaming completion from the assistant's endpoint; rejects with the SDK's error. */
export const generateAssistantText = async ({
  baseURL,
  apiKey,
  modelId,
  system,
  messages,
  abortSignal,
}: {
  baseURL: string;
  apiKey?: string;
  modelId: string;
  system: string;
  messages: Array<ModelMessage>;
  abortSignal?: AbortSignal;
}): Promise<string> => {
  const provider = createOpenAICompatible({
    name: 'backend-ai',
    baseURL,
    apiKey: apiKey || 'dummy',
  });
  const { text } = await generateText({
    model: wrapLanguageModel({
      model: provider.chatModel(modelId),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    system,
    messages,
    abortSignal,
  });
  return text;
};
