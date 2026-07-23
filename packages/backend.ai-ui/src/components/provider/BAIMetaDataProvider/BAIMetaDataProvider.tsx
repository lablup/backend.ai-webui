import {
  BAIDeviceMetaDataContext,
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
  children?: ReactNode;
}

const BAIMetaDataProvider = ({
  deviceMetaData,
  imageMetaData,
  imagePath,
  children,
}: BAIMetaDataProviderProps) => {
  return (
    <BAIDeviceMetaDataContext.Provider value={deviceMetaData}>
      <BAIImageMetaDataContext.Provider value={imageMetaData}>
        <BAIImagePathContext.Provider value={imagePath}>
          {children}
        </BAIImagePathContext.Provider>
      </BAIImageMetaDataContext.Provider>
    </BAIDeviceMetaDataContext.Provider>
  );
};

export default BAIMetaDataProvider;
