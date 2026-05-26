import {
  BAIMetaDataContext,
  BAIMetaDataContextValue,
  BAIImageMetaDataContext,
} from './context';
import type { DeviceMetaData, ImageMetaData } from './types';
import type { ReactNode } from 'react';

export interface BAIMetaDataProviderProps {
  deviceMetaData?: DeviceMetaData;
  imageMetaData?: ImageMetaData;
  resourceSlotsInRG?: DeviceMetaData;
  mergedResourceSlots?: DeviceMetaData;
  refresh?: () => void;
  isLoading?: boolean;
  children?: ReactNode;
}

const BAIMetaDataProvider = ({
  deviceMetaData,
  imageMetaData,
  resourceSlotsInRG,
  mergedResourceSlots,
  refresh = () => {},
  isLoading = false,
  children,
}: BAIMetaDataProviderProps) => {
  'use memo';
  const value: BAIMetaDataContextValue = {
    deviceMetaData,
    resourceSlotsInRG,
    mergedResourceSlots,
    refresh,
    isLoading,
  };
  return (
    <BAIMetaDataContext.Provider value={value}>
      <BAIImageMetaDataContext.Provider value={imageMetaData}>
        {children}
      </BAIImageMetaDataContext.Provider>
    </BAIMetaDataContext.Provider>
  );
};

export default BAIMetaDataProvider;
