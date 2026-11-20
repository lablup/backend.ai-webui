/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useTanQuery } from '../../hooks/reactQueryAlias';
import { useMyAppConfig } from '../../hooks/useAppConfig';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useCustomEndpointApiKey } from '../Chat/customEndpointKeyStore';
import { fetchOpenAIModels } from '../Chat/openAIModels';
import { useCustomConnectionThisLoad } from './customConnectionThisLoad';
import {
  WEBUI_ASSISTANT_CONFIG_KEY,
  WEBUI_ASSISTANT_KEY_ID,
  type WebUIAssistantConnection,
} from './webUIAssistantPrompt';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  extractReasoningMiddleware,
  generateText,
  wrapLanguageModel,
  type ModelMessage,
} from 'ai';

export interface WebUIAssistantModel {
  /** The assistant is on, connected, and its endpoint lists a model. */
  isAvailable: boolean;
  /** One non-streaming completion; rejects with the SDK's error. */
  complete: (
    request: {
      system: string;
      abortSignal?: AbortSignal;
    } & ({ prompt: string } | { messages: Array<ModelMessage> }),
  ) => Promise<string>;
}

/** The WebUI Assistant's connection, for features that ask its model one question. */
export const useWebUIAssistantModel = (): WebUIAssistantModel => {
  'use memo';
  const [enabled] = useBAISettingUserState('experimental_webui_assistant');
  const [connection] = useMyAppConfig<WebUIAssistantConnection>(
    'userConfig',
    WEBUI_ASSISTANT_CONFIG_KEY,
  );
  const apiKey = useCustomEndpointApiKey(WEBUI_ASSISTANT_KEY_ID);
  const customBaseURLThisLoad = useCustomConnectionThisLoad();
  const baseURL = enabled ? connection?.baseURL : undefined;
  // The same rule as the floating assistant: a custom endpoint is reconnected on every load.
  const isConnected =
    !!baseURL &&
    (connection?.deploymentId
      ? !connection.hasApiKey || !!apiKey
      : customBaseURLThisLoad === baseURL);

  // Same key as the chat panel's model list, so the two share one request.
  const modelsQuery = useTanQuery({
    queryKey: ['webui-assistant-models', baseURL, apiKey],
    queryFn: async () => {
      const result = await fetchOpenAIModels(baseURL ?? '', apiKey);
      if (result.error) throw new Error(result.error.kind);
      return result.data;
    },
    enabled: isConnected,
    retry: false,
  });
  const modelId = modelsQuery.data?.[0]?.id;

  return {
    isAvailable: isConnected && !!modelId,
    complete: async ({ system, abortSignal, ...input }) => {
      if (!baseURL || !modelId) throw new Error('WebUI Assistant is offline');
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
        ...input,
        abortSignal,
      });
      return text;
    },
  };
};
