/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * WebMCP wiring shared by `useWebMCPTool` and the tools built on it (FR-3764).
 *
 * WebMCP is a **dev-only, opt-in** surface: nothing here does anything unless
 * the dev server was started with `VITE_WEBMCP=on`, which is also the only
 * thing that makes `react/vite-plugins/webmcp.ts` serve the polyfill and the
 * local-relay embed. Reading the flag through a function (rather than inlining
 * `import.meta.env`) is what lets tests toggle it.
 */
import type { CallToolResult, ModelContext } from '@mcp-b/webmcp-types';

/** `VITE_WEBMCP=on` — any other value (including unset) keeps WebMCP off. */
export const isWebMCPEnabled = (): boolean =>
  import.meta.env.VITE_WEBMCP === 'on';

/**
 * `document.modelContext` if the `@mcp-b/global` polyfill installed it. The
 * WebMCP types declare the property as always present, so the cast is what
 * keeps the absent case (flag off, or a browser without the polyfill)
 * expressible.
 */
export const getModelContext = (): ModelContext | undefined =>
  (document as { modelContext?: ModelContext }).modelContext;

/** JSON payload a `bai_*` tool returns alongside its text rendering. */
export type WebMCPPayload = Record<string, string | number | boolean | null>;

/**
 * A failed tool call: human-readable text for the model plus a machine-readable
 * `{ code }` so callers can branch without parsing prose.
 */
export const webmcpError = (code: string, message: string): CallToolResult => ({
  content: [{ type: 'text', text: message }],
  structuredContent: { code, message },
  isError: true,
});

/** A successful tool call carrying both the JSON payload and its text form. */
export const webmcpResult = (payload: WebMCPPayload): CallToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  structuredContent: payload,
});
