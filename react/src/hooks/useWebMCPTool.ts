/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * `useWebMCPTool` — register one WebMCP tool for as long as a component is
 * mounted (FR-3764).
 *
 * The tool is registered through the spec entry point
 * `document.modelContext.registerTool(tool, { signal })`, which the
 * `@mcp-b/global` polyfill provides on the dev server. Unregistration is the
 * signal's abort, so a tool disappears from the relay's tool list the moment
 * its owner unmounts or its `deps` change — that abort/re-register pair is what
 * makes route-scoped tools work (the relay sees `list_changed`).
 *
 * Host state reaches `execute` through the caller's closure, so `deps` is the
 * caller's declaration of which state the handler captured — exactly the
 * `useCallback` contract. Pass `null` to register nothing (a tool whose
 * preconditions are not met yet).
 */
import { getModelContext, isWebMCPEnabled } from '../helper/webmcp';
import type { InputSchema, ToolDescriptor } from '@mcp-b/webmcp-types';
import { useEffect, type DependencyList } from 'react';

/**
 * A `bai_*` tool definition. `inputSchema` is a required JSON-Schema literal:
 * the WebMCP runtime advertises it to MCP clients, and it is the only argument
 * documentation a model gets.
 *
 * Naming: `bai_` + snake_case, and never scope- or tab-qualified — the relay
 * disambiguates same-named tools from different tabs on its own.
 */
export interface WebMCPTool extends ToolDescriptor {
  inputSchema: InputSchema;
}

export const useWebMCPTool = (
  tool: WebMCPTool | null,
  deps: DependencyList,
): void => {
  useEffect(
    () => {
      if (!isWebMCPEnabled() || !tool) {
        return;
      }
      const modelContext = getModelContext();
      if (!modelContext) {
        return;
      }
      const controller = new AbortController();
      void modelContext.registerTool(tool, { signal: controller.signal });
      return () => controller.abort();
    },
    // `tool` itself is deliberately NOT a dep — it is rebuilt on every render,
    // so the caller's `deps` is the registration identity. The extra flag makes
    // a null <-> non-null flip re-run without the caller having to declare it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps, tool === null],
  );
};

export default useWebMCPTool;
