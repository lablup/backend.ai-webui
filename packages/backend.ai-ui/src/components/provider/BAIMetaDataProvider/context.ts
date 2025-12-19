import { DeviceMetaData } from './types';
import { createContext } from 'react';

export const BAIDeviceMetaDataContext = createContext<
  DeviceMetaData | undefined
>(undefined);
