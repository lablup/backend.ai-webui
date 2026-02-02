import { BAIDeviceMetaDataContext } from './context';
import { DeviceMetaData } from './types';
import type { ReactNode } from 'react';

export interface BAIMetaDataProviderProps {
  deviceMetaData?: DeviceMetaData;
  children?: ReactNode;
}

const BAIMetaDataProvider = ({
  deviceMetaData,
  children,
}: BAIMetaDataProviderProps) => {
  return (
    <BAIDeviceMetaDataContext.Provider value={deviceMetaData}>
      {children}
    </BAIDeviceMetaDataContext.Provider>
  );
};

export default BAIMetaDataProvider;
