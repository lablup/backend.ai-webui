import { DeviceMetaData } from './types';
import { ReactNode } from '../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIResourceSlotsProviderProps {
    /** Slots reported by the server; the host app fetches them. */
    resourceSlots?: DeviceMetaData;
    children?: ReactNode;
}
/**
 * The server's configured resource slots. Its request is authenticated, so the
 * host mounts this inside the signed-in subtree — the login screen must not
 * fire a signed request.
 *
 * Must be nested under `BAIMetaDataProvider`.
 */
declare const BAIResourceSlotsProvider: ({ resourceSlots, children, }: BAIResourceSlotsProviderProps) => import("react").JSX.Element;
export default BAIResourceSlotsProvider;
