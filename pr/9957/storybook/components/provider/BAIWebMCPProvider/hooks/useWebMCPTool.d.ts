import { WebMCPModelContext, WebMCPTool } from '../types';
export type WebMCPToolDep = string | number | boolean | null | undefined;
/** `document.modelContext` when the browser implements WebMCP, else `undefined`. */
export declare const getWebMCPModelContext: () => WebMCPModelContext | undefined;
/**
 * Whether tools would register right now. The browser API is only probed
 * once the host gate is on.
 */
export declare const useBAIWebMCPActive: () => boolean;
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
declare const useWebMCPTool: (tool: WebMCPTool | null, deps?: ReadonlyArray<WebMCPToolDep>) => void;
export default useWebMCPTool;
