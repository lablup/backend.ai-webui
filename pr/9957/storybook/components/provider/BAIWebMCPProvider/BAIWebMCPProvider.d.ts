import { ReactNode } from '../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
