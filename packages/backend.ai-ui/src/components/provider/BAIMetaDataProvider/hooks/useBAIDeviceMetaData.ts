import { BAIDeviceMetaDataContext } from '../context';
import { useContext } from 'react';

const useBAIDeviceMetaData = () => {
  try {
    const context = useContext(BAIDeviceMetaDataContext);
    if (!context) {
      throw new Error(
        'useBAIDeviceMetaData must be used within a BAIMetaDataProvider',
      );
    }
    return context;
  } catch (error) {
    console.error('Error using BAI Device MetaData:', error);
    throw error;
  }
};

export default useBAIDeviceMetaData;
