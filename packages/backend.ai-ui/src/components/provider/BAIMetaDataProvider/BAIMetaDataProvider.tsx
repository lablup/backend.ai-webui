import { BAIDeviceMetaDataContext, BAIImageMetaDataContext } from './context';
import type { DeviceMetaData, ImageMetaData } from './types';
import type { ReactNode } from 'react';

export interface BAIMetaDataProviderProps {
  deviceMetaData?: DeviceMetaData;
  imageMetaData?: ImageMetaData;
  children?: ReactNode;
}

const BAIMetaDataProvider = ({
  deviceMetaData,
  imageMetaData,
  children,
}: BAIMetaDataProviderProps) => {
  return (
    <BAIDeviceMetaDataContext.Provider value={deviceMetaData}>
      <BAIImageMetaDataContext.Provider value={imageMetaData}>
        {children}
      </BAIImageMetaDataContext.Provider>
    </BAIDeviceMetaDataContext.Provider>
  );
};

export default BAIMetaDataProvider;
