import { BAIMetaDataContext, BAIMetaDataContextValue } from './context';
import type { DeviceMetaData } from './types';
import type { ReactNode } from 'react';

export interface BAIMetaDataProviderProps {
  deviceMetaData?: DeviceMetaData;
  resourceSlotsInRG?: DeviceMetaData;
  mergedResourceSlots?: DeviceMetaData;
  refresh?: () => void;
  isLoading?: boolean;
  children?: ReactNode;
}

const BAIMetaDataProvider = ({
  deviceMetaData,
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
      {children}
    </BAIMetaDataContext.Provider>
  );
};

export default BAIMetaDataProvider;
