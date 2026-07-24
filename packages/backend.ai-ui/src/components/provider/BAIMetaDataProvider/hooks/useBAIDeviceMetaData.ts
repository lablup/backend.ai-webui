import useBAILogger from '../../../../hooks/useBAILogger';
import { BAIDeviceMetaDataContext } from '../context';
import { use } from 'react';

const useBAIDeviceMetaData = () => {
  const { logger } = useBAILogger();
  // `use` cannot be called inside try/catch, so read the context first.
  const context = use(BAIDeviceMetaDataContext);
  try {
    if (!context) {
      throw new Error(
        'useBAIDeviceMetaData must be used within a BAIMetaDataProvider',
      );
    }
    return context;
  } catch (error) {
    logger.error('Error using BAI Device MetaData:', error);
    throw error;
  }
};

export default useBAIDeviceMetaData;
