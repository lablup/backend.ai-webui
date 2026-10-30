import useBAILogger from '../../../../hooks/useBAILogger';
import { useEventNotStable } from '../../../../hooks/useEventNotStable';
import { BAIWebMCPContext } from '../context';
import type {
  WebMCPModelContext,
  WebMCPTool,
  WebMCPToolDescriptor,
} from '../types';
import {
  validateWebMCPInput,
  webMCPError,
  webMCPInvalidInput,
} from '../validateWebMCPInput';
import { use, useEffect, useEffectEvent, useRef } from 'react';

const UNKNOWN_FAILURE = 'The tool failed without a message.';

// The client and Relay layer reject with plain objects, not `Error`s, and the
// rejection can be anything, so reading it must not throw out of `catch`.
const errorMessage = (error: unknown): string => {
  try {
    if (typeof error === 'object' && error !== null) {
      const { message, msg, title } = error as Record<string, unknown>;
      const text = [message, msg, title].find(
        (value) => typeof value === 'string' && value !== '',
      );
      return (text as string | undefined) ?? UNKNOWN_FAILURE;
    }
    return error === undefined || error === null || error === ''
      ? UNKNOWN_FAILURE
      : String(error);
  } catch {
    return UNKNOWN_FAILURE;
  }
};

/** `document.modelContext` when the browser implements WebMCP, else `undefined`. */
export const getWebMCPModelContext = (): WebMCPModelContext | undefined => {
  if (typeof document === 'undefined') return undefined;
  const modelContext = (
    document as Document & { modelContext?: Partial<WebMCPModelContext> }
  ).modelContext;
  return typeof modelContext?.registerTool === 'function'
    ? (modelContext as WebMCPModelContext)
    : undefined;
};

/**
 * Whether tools would register right now. The browser API is only probed
 * once the host gate is on.
 */
export const useBAIWebMCPActive = (): boolean => {
  'use memo';
  const { enabled } = use(BAIWebMCPContext);
  return enabled && getWebMCPModelContext() !== undefined;
};

/**
 * Registers `tool` through `document.modelContext.registerTool` while the
 * caller is mounted, and unregisters it by aborting the registration signal.
 *
 * - Nothing happens unless `BAIWebMCPProvider` is `enabled` and the browser
 *   exposes the API. `null` registers nothing.
 * - The tool re-registers when its name, description, schema or annotations
 *   change. `execute` always runs against the latest render's closure.
 * - Bad input, thrown errors, results that cannot be serialized and calls after
 *   the registration ended come back as `{ error: { code, message } }`.
 */
const useWebMCPTool = (tool: WebMCPTool | null): void => {
  'use memo';
  const { enabled } = use(BAIWebMCPContext);
  const { logger } = useBAILogger();

  const registrationKey =
    enabled && tool
      ? JSON.stringify([
          tool.name,
          tool.description,
          tool.inputSchema,
          tool.annotations ?? null,
        ])
      : null;

  // `useEventNotStable` keeps the last closure past unmount, so a call that
  // outlives the registration has to be refused here.
  const registrationRef = useRef<AbortSignal | null>(null);

  // The browser calls this long after any effect ran, which rules out
  // `useEffectEvent`; the layout-effect refresh closes the post-commit gap.
  const execute = useEventNotStable(async (input: unknown) => {
    if (!tool || (registrationRef.current?.aborted ?? true)) {
      return webMCPError('tool_unavailable', 'This tool is not available.');
    }
    try {
      const parsed = validateWebMCPInput(tool.inputSchema, input);
      if (!parsed.ok) return webMCPInvalidInput(parsed.issues);
      const result = await tool.execute(parsed.value);
      // The platform stringifies the result after this returns.
      if (JSON.stringify(result) === undefined) {
        return webMCPError('execution_failed', 'The tool returned no result.');
      }
      return result;
    } catch (error) {
      return webMCPError('execution_failed', errorMessage(error));
    }
  });

  const register = useEffectEvent((signal: AbortSignal) => {
    const modelContext = getWebMCPModelContext();
    if (!modelContext || !tool) return;

    const descriptor: WebMCPToolDescriptor = {
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      ...(tool.annotations ? { annotations: tool.annotations } : {}),
      execute,
    };
    const reportFailure = (error: unknown) => {
      logger.warn('[WebMCP] registerTool failed', error);
    };
    try {
      Promise.resolve(modelContext.registerTool(descriptor, { signal })).catch(
        reportFailure,
      );
    } catch (error) {
      reportFailure(error);
    }
  });

  useEffect(() => {
    if (registrationKey === null) return;
    const controller = new AbortController();
    registrationRef.current = controller.signal;
    register(controller.signal);
    return () => controller.abort();
  }, [registrationKey]);
};

export default useWebMCPTool;
