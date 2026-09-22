import { DeviceMetaData } from './types';
import { ReactNode } from '../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
