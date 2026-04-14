import type { DeviceMetaData } from './types';
import { createContext } from 'react';

export type BAIMetaDataContextValue = {
  deviceMetaData: DeviceMetaData | undefined;
  resourceSlotsInRG: DeviceMetaData | undefined;
  mergedResourceSlots: DeviceMetaData | undefined;
  refresh: () => void;
  isLoading: boolean;
};

export const BAIMetaDataContext = createContext<
  BAIMetaDataContextValue | undefined
>(undefined);
