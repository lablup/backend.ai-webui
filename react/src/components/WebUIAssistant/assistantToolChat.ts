/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PREPARE_SESSION_INPUT_SCHEMA } from '../../helper/webmcpPrepareSessionSchema';
import { getAIErrorMessage, type ChatMessage } from '../Chat/ChatModel';
import { manualSectionURL, type ManualSection } from './manualSearch';
import {
  waitForTool,
  waitForToolsToSettle,
  type PageToolRegistry,
} from './pageToolRegistry';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  extractReasoningMiddleware,
  generateId,
  jsonSchema,
  streamText,
  tool,
  wrapLanguageModel,
  type ModelMessage,
  type ToolSet,
} from 'ai';
import type { WebMCPToolDescriptor } from 'backend.ai-ui';
import * as _ from 'lodash-es';

/**
 * The page tools the assistant offers the model. A small model's context
 * cannot hold every list tool's description, so the list tools are left out.
 */
export const ASSISTANT_PAGE_TOOLS = [
  'bai_get_current_page',
  'bai_navigate',
  'bai_get_current_dashboard',
  'bai_prepare_dashboard',
  'bai_prepare_session',
] as const;

export const SEARCH_MANUAL_TOOL = 'search_manual';
const PREPARE_SESSION_TOOL = 'bai_prepare_session';
const SESSION_LAUNCHER_PATH = '/session/start';

/** Model calls per answer: a navigation, a read and a few changes. */
export const MAX_TOOL_STEPS = 8;

const MAX_MANUAL_RESULTS = 3;
const MAX_MANUAL_CHARS = 1500;

/** The manual search as the model calls it; the excerpts carry their URL to cite. */
export const searchManualResult = (
  sections: ReadonlyArray<ManualSection> | null,
  manualBaseURL: string,
) =>
  sections === null
    ? { error: 'The user manual could not be loaded.' }
    : {
        results: sections.slice(0, MAX_MANUAL_RESULTS).map((section) => ({
          title: `${section.pageTitle} › ${section.heading}`,
          url: manualSectionURL(manualBaseURL, section),
          text: section.text.slice(0, MAX_MANUAL_CHARS),
        })),
      };

/** The registered page tools the assistant offers, in a stable order. */
export const offeredPageTools = (
  registered: ReadonlyArray<WebMCPToolDescriptor>,
): Array<WebMCPToolDescriptor> =>
  _.compact(
    ASSISTANT_PAGE_TOOLS.map((name) =>
      registered.find((descriptor) => descriptor.name === name),
    ),
  );

const unavailable = {
  error: {
    code: 'tool_unavailable',
    message: 'This tool is not available on the current page.',
  },
};

// The user is in this tab, so the links a browser agent hands over only cost the model context.
const LINK_KEYS = ['webui_url', 'path'];

/** A page tool's result as the model reads it: without the links for another browser. */
export const modelOutputOf = (output: unknown): unknown =>
  _.isPlainObject(output) ? _.omit(output as object, LINK_KEYS) : output;

/**
 * `bai_prepare_session` away from the launcher: opens it, then calls the
 * launcher's own tool. A small model skips the navigation step on its own.
 */
const prepareSessionAnywhere = (registry: PageToolRegistry) =>
  tool({
    description:
      'Open the session launcher and fill its form for the user to review. Does NOT start the session: the user reviews the form and presses Launch. Omitted fields keep the launcher defaults.',
    inputSchema: jsonSchema(PREPARE_SESSION_INPUT_SCHEMA as object),
    execute: async (input) => {
      const navigate = registry.get('bai_navigate');
      if (!navigate) return unavailable;
      const opened = (await navigate.execute({
        path: SESSION_LAUNCHER_PATH,
      })) as { error?: unknown };
      if (opened?.error) return opened;
      // The launcher is a lazy route: its tool registers after the navigation settles.
      const prepare = await waitForTool(registry, PREPARE_SESSION_TOOL);
      return prepare ? prepare.execute(input) : unavailable;
    },
    toModelOutput: (output) => ({
      type: 'json',
      value: modelOutputOf(output) as never,
    }),
  });

export const toolSetOf = (
  registry: PageToolRegistry,
  searchManual: (query: string) => unknown,
): ToolSet => ({
  [SEARCH_MANUAL_TOOL]: tool({
    description:
      'Search the Backend.AI WebUI user manual. Use it for any question about how to do something in the WebUI, and answer from the results. Returns { results: [{ title, url, text }] }.',
    inputSchema: jsonSchema<{ query: string }>({
      type: 'object',
      properties: {
        query: { type: 'string', description: 'What to look up, in English.' },
      },
      required: ['query'],
      additionalProperties: false,
    }),
    execute: async ({ query }) => searchManual(query),
  }),
  ..._.fromPairs(
    offeredPageTools(registry.list()).map((descriptor) => [
      descriptor.name,
      tool({
        description: descriptor.description,
        inputSchema: jsonSchema(descriptor.inputSchema as object),
        // The latest registration: a navigation may have replaced the page's tools.
        execute: async (input) => {
          const current = registry.get(descriptor.name);
          return current ? current.execute(input) : unavailable;
        },
        toModelOutput: (output) => ({
          type: 'json',
          value: modelOutputOf(output) as never,
        }),
      }),
    ]),
  ),
  ...(!registry.get(PREPARE_SESSION_TOOL) && registry.get('bai_navigate')
    ? { [PREPARE_SESSION_TOOL]: prepareSessionAnywhere(registry) }
    : {}),
});

export interface StreamToolChatOptions {
  baseURL: string;
  apiKey?: string;
  modelId: string;
  system: string;
  messages: Array<ModelMessage>;
  registry: PageToolRegistry;
  searchManual: (query: string) => unknown;
  /**
   * Tool calls run before the model's first call and put in the history as
   * its own: a small model answers without searching or reading the board first.
   */
  prefetch?: ReadonlyArray<{
    toolName: string;
    input: Record<string, unknown>;
  }>;
  abortSignal?: AbortSignal;
  maxSteps?: number;
}

/**
 * Streams an answer that may call the page's WebMCP tools. Each model call
 * gets the tools registered at that moment, so after `bai_navigate` the next
 * call sees the new page's tools (`bai_prepare_session` on the launcher).
 */
export const streamToolChat = ({
  baseURL,
  apiKey,
  modelId,
  system,
  messages,
  registry,
  searchManual,
  prefetch = [],
  abortSignal,
  maxSteps = MAX_TOOL_STEPS,
}: StreamToolChatOptions): Response => {
  const provider = createOpenAICompatible({
    name: 'backend-ai',
    baseURL,
    apiKey: apiKey || 'dummy',
  });
  const model = wrapLanguageModel({
    model: provider.chatModel(modelId),
    middleware: extractReasoningMiddleware({ tagName: 'think' }),
  });
  return createUIMessageStreamResponse({
    stream: createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        const history = [...messages];
        writer.write({ type: 'start' });
        const tools = toolSetOf(registry, searchManual);
        const calledBefore = new Set<string>();
        for (const { toolName, input } of prefetch) {
          const execute = tools[toolName]?.execute;
          if (!execute) continue;
          calledBefore.add(JSON.stringify([toolName, input]));
          const toolCallId = generateId();
          const output = await execute(input, {
            toolCallId,
            messages: history,
          });
          writer.write({ type: 'start-step' });
          writer.write({
            type: 'tool-input-available',
            toolCallId,
            toolName,
            input,
          });
          writer.write({ type: 'tool-output-available', toolCallId, output });
          writer.write({ type: 'finish-step' });
          history.push(
            {
              role: 'assistant',
              content: [{ type: 'tool-call', toolCallId, toolName, input }],
            },
            {
              role: 'tool',
              content: [
                {
                  type: 'tool-result',
                  toolCallId,
                  toolName,
                  output: {
                    type: 'json',
                    value: modelOutputOf(output) as never,
                  },
                },
              ],
            },
          );
        }
        for (let step = 0; step < maxSteps; step++) {
          const result = streamText({
            model,
            system,
            messages: history,
            tools: toolSetOf(registry, searchManual),
            abortSignal,
          });
          writer.merge(
            result.toUIMessageStream({
              sendStart: false,
              sendFinish: false,
              onError: (error) => getAIErrorMessage(error),
            }),
          );
          const [finishReason, response, toolCalls] = await Promise.all([
            result.finishReason,
            result.response,
            result.toolCalls,
          ]);
          history.push(...response.messages);
          if (finishReason !== 'tool-calls' || !toolCalls.length) break;
          // A small model repeats a call it already made until the context runs out.
          const keys = toolCalls.map((call) =>
            JSON.stringify([call.toolName, call.input]),
          );
          if (keys.every((key) => calledBefore.has(key))) break;
          keys.forEach((key) => calledBefore.add(key));
          if (toolCalls.some((call) => call.toolName === 'bai_navigate')) {
            await waitForToolsToSettle(registry);
          }
        }
        writer.write({ type: 'finish' });
      },
      onError: (error) => getAIErrorMessage(error),
    }),
  });
};

/** Whether the endpoint accepts `tools`; a server without tool calling answers 4xx. */
export const probeToolCalling = async ({
  baseURL,
  apiKey,
  modelId,
}: {
  baseURL: string;
  apiKey?: string;
  modelId: string;
}): Promise<boolean> => {
  const response = await fetch(
    `${baseURL.replace(/\/+$/, '')}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'ping' }],
        tools: [
          {
            type: 'function',
            function: {
              name: 'ping',
              description: 'Answers ping.',
              parameters: { type: 'object', properties: {} },
            },
          },
        ],
        tool_choice: 'auto',
        max_tokens: 1,
      }),
    },
  );
  return response.ok;
};
