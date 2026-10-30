import { WebMCPModelContext, WebMCPTool } from '../types';
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
 * - The tool re-registers when its name, description, schema or annotations
 *   change. `execute` always runs against the latest render's closure.
 * - Bad input, thrown errors, results that cannot be serialized and calls after
 *   the registration ended come back as `{ error: { code, message } }`.
 */
declare const useWebMCPTool: (tool: WebMCPTool | null) => void;
export default useWebMCPTool;
