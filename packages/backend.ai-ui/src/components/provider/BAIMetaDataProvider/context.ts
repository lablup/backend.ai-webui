import type { DeviceMetaData } from './types';
import { createContext } from 'react';

export type BAIDeviceMetaDataContextValue = {
  deviceMetaData: DeviceMetaData | undefined;
  resourceSlotsInRG: DeviceMetaData | undefined;
  mergedResourceSlots: DeviceMetaData | undefined;
  refresh: () => void;
  isLoading: boolean;
};

export const BAIDeviceMetaDataContext = createContext<
  BAIDeviceMetaDataContextValue | undefined
>(undefined);
