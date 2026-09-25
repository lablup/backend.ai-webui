import useBAILogger from '../../../../hooks/useBAILogger';
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

export type WebMCPToolDep = string | number | boolean | null | undefined;

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
 * - The tool re-registers when its name, description, schema, annotations or
 *   `deps` change. `execute` always runs against the latest render's closure.
 * - Input is validated against `inputSchema` before `execute` sees it; bad
 *   input and thrown errors come back as `{ error: { code, message } }`.
 */
const useWebMCPTool = (
  tool: WebMCPTool | null,
  deps: ReadonlyArray<WebMCPToolDep> = [],
): void => {
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
          deps,
        ])
      : null;

  // The browser calls `execute` long after the effect ran, so the latest tool
  // is read from a ref: `useEffectEvent` is only safe inside effects.
  const latestTool = useRef(tool);
  useEffect(() => {
    latestTool.current = tool;
  });

  const reportRegisterError = useEffectEvent((error: unknown) => {
    logger.warn('[WebMCP] registerTool failed', error);
  });

  useEffect(() => {
    if (registrationKey === null) return;
    const modelContext = getWebMCPModelContext();
    const definition = latestTool.current;
    if (!modelContext || !definition) return;

    const controller = new AbortController();
    const descriptor: WebMCPToolDescriptor = {
      name: definition.name,
      description: definition.description,
      inputSchema: definition.inputSchema,
      ...(definition.annotations
        ? { annotations: definition.annotations }
        : {}),
      execute: async (input) => {
        const current = latestTool.current;
        if (!current) {
          return webMCPError('tool_unavailable', 'This tool is not available.');
        }
        const parsed = validateWebMCPInput(current.inputSchema, input);
        if (!parsed.ok) return webMCPInvalidInput(parsed.issues);
        try {
          return await current.execute(parsed.value);
        } catch (error) {
          return webMCPError(
            'execution_failed',
            error instanceof Error ? error.message : String(error),
          );
        }
      },
    };
    try {
      Promise.resolve(
        modelContext.registerTool(descriptor, { signal: controller.signal }),
      ).catch(reportRegisterError);
    } catch (error) {
      reportRegisterError(error);
    }
    return () => controller.abort();
  }, [registrationKey]);
};

export default useWebMCPTool;
