import { BAIDeviceMetaDataContext, BAIResourceSlotsContext } from './context';
import type { DeviceMetaData } from './types';
import * as _ from 'lodash-es';
import { use, type ReactNode } from 'react';

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
const BAIResourceSlotsProvider = ({
  resourceSlots,
  children,
}: BAIResourceSlotsProviderProps) => {
  'use memo';
  const deviceMetaData = use(BAIDeviceMetaDataContext);
  const value = {
    resourceSlots,
    mergedResourceSlots: _.merge({}, deviceMetaData, resourceSlots),
  };

  return (
    <BAIResourceSlotsContext.Provider value={value}>
      {children}
    </BAIResourceSlotsContext.Provider>
  );
};

export default BAIResourceSlotsProvider;
