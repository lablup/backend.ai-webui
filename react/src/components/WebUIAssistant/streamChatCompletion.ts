/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ChatMessage, getAIErrorMessage } from '../Chat/ChatModel';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  convertToModelMessages,
  extractReasoningMiddleware,
  streamText,
  wrapLanguageModel,
} from 'ai';

export interface StreamChatCompletionOptions {
  baseURL: string;
  apiKey?: string;
  modelId: string;
  messages: Array<ChatMessage>;
  system?: string;
  abortSignal?: AbortSignal;
  /** Sampling parameters forwarded to `streamText` as-is. */
  parameters?: object;
  onFinish?: (message: ChatMessage) => void;
  /** Metadata the answer message carries from its first chunk. */
  startMetadata?: object;
}

/**
 * Streams an OpenAI-compatible chat completion from the browser and returns
 * the UI-message stream `useChat`'s transport expects.
 */
export function streamChatCompletion({
  baseURL,
  apiKey,
  modelId,
  messages,
  system,
  abortSignal,
  parameters,
  onFinish,
  startMetadata,
}: StreamChatCompletionOptions): Response {
  const provider = createOpenAICompatible({
    name: 'backend-ai',
    baseURL,
    apiKey: apiKey || 'dummy',
  });
  const result = streamText({
    abortSignal,
    model: wrapLanguageModel({
      model: provider.chatModel(modelId),
      middleware: [
        extractReasoningMiddleware({ tagName: 'think' }),
        // The provider advertises no `supportedUrls`, so the SDK would try to
        // download a `data:` image attachment and fail; pass it through inline.
        {
          overrideSupportedUrls: () => ({
            'image/*': [/^data:/, /^https?:\/\//],
          }),
        },
      ],
    }),
    messages: convertToModelMessages(messages),
    system: system || undefined,
    ...parameters,
  });

  return result.toUIMessageStreamResponse({
    // The model-reported output token count lets ChatTokenCounter compute TPS
    // exactly; usage is only known on 'finish'.
    messageMetadata: ({ part }) => {
      if (part.type === 'start') return startMetadata;
      if (part.type === 'finish') {
        return { outputTokens: part.totalUsage.outputTokens };
      }
    },
    onError: (error) => getAIErrorMessage(error),
    onFinish: (event) => {
      if (!event.isAborted && event.responseMessage) {
        onFinish?.(event.responseMessage);
      }
    },
  });
}
