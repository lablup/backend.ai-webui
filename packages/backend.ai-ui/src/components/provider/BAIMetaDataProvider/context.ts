import type { DeviceMetaData, ImageMetaData } from './types';
import { createContext } from 'react';

export const BAIDeviceMetaDataContext = createContext<
  DeviceMetaData | undefined
>(undefined);

export const BAIImageMetaDataContext = createContext<ImageMetaData | undefined>(
  undefined,
);
