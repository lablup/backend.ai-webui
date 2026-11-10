import { ReactNode } from '../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIWebMCPProviderProps {
    /** Off by default: no tool is registered unless the host turns this on. */
    enabled?: boolean;
    children?: ReactNode;
}
/**
 * The runtime gate for `useWebMCPTool`. Tools register only when this is
 * `enabled` AND the browser exposes `document.modelContext`.
 */
declare const BAIWebMCPProvider: ({ enabled, children, }: BAIWebMCPProviderProps) => import("react").JSX.Element;
export default BAIWebMCPProvider;
