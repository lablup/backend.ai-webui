/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebMCPModelContext, WebMCPToolDescriptor } from 'backend.ai-ui';

/** The WebMCP tools the page has registered, for the WebUI Assistant's tool calls (ADR 0040). */
export interface PageToolRegistry extends WebMCPModelContext {
  list: () => ReadonlyArray<WebMCPToolDescriptor>;
  get: (name: string) => WebMCPToolDescriptor | undefined;
  subscribe: (listener: () => void) => () => void;
}

export const createPageToolRegistry = (): PageToolRegistry => {
  const tools = new Map<string, WebMCPToolDescriptor>();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  return {
    registerTool: (tool, options) => {
      if (options?.signal?.aborted) return;
      tools.set(tool.name, tool);
      notify();
      options?.signal?.addEventListener('abort', () => {
        // A newer registration under the same name stays.
        if (tools.get(tool.name) !== tool) return;
        tools.delete(tool.name);
        notify();
      });
    },
    list: () => [...tools.values()],
    get: (name) => tools.get(name),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

/** One per app: the WebMCP provider registers into it while the assistant is on. */
export const pageToolRegistry = createPageToolRegistry();

/** Resolves once no tool has (un)registered for `quietMs`, or after `timeoutMs`. */
export const waitForToolsToSettle = (
  registry: PageToolRegistry,
  { quietMs = 400, timeoutMs = 4000 } = {},
): Promise<void> =>
  new Promise((resolve) => {
    let quietTimer = window.setTimeout(done, quietMs);
    const deadline = window.setTimeout(done, timeoutMs);
    const unsubscribe = registry.subscribe(() => {
      window.clearTimeout(quietTimer);
      quietTimer = window.setTimeout(done, quietMs);
    });
    function done() {
      window.clearTimeout(quietTimer);
      window.clearTimeout(deadline);
      unsubscribe();
      resolve();
    }
  });

/** The tool once it is registered, or `undefined` after `timeoutMs`. */
export const waitForTool = (
  registry: PageToolRegistry,
  name: string,
  { timeoutMs = 8000 } = {},
): Promise<WebMCPToolDescriptor | undefined> =>
  new Promise((resolve) => {
    const found = registry.get(name);
    if (found) return resolve(found);
    const deadline = window.setTimeout(() => {
      unsubscribe();
      resolve(undefined);
    }, timeoutMs);
    const unsubscribe = registry.subscribe(() => {
      const tool = registry.get(name);
      if (!tool) return;
      window.clearTimeout(deadline);
      unsubscribe();
      resolve(tool);
    });
  });
