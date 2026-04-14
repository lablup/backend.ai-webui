import {
  BAIMetaDataContext,
  BAIMetaDataContextValue,
  BAIImageMetaDataContext,
  BAIImagePathContext,
} from './context';
import type { DeviceMetaData, ImageMetaData } from './types';
import type { ReactNode } from 'react';

export interface BAIMetaDataProviderProps {
  deviceMetaData?: DeviceMetaData;
  imageMetaData?: ImageMetaData;
  /**
   * Base path where the host app serves the icon files referenced by
   * `imageMetaData.imageInfo[].icon` (e.g. `resources/icons`). The package
   * never bundles or resolves app asset paths on its own.
   */
  imagePath?: string;
  resourceSlotsInRG?: DeviceMetaData;
  mergedResourceSlots?: DeviceMetaData;
  refresh?: () => void;
  isLoading?: boolean;
  children?: ReactNode;
}

const BAIMetaDataProvider = ({
  deviceMetaData,
  imageMetaData,
  imagePath,
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
        <BAIImagePathContext.Provider value={imagePath}>
          {children}
        </BAIImagePathContext.Provider>
      </BAIImageMetaDataContext.Provider>
    </BAIMetaDataContext.Provider>
  );
};

export default BAIMetaDataProvider;
