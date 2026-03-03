import { useBAILogger } from '../../../../hooks';
import { BAIAnonymousClientContext } from '../context';
import { BAIClient } from '../types';
import { useContext } from 'react';

const useBAIAnonymousClient = (apiEndpoint: string): BAIClient => {
  const { logger } = useBAILogger();

  try {
    const baiAnonymousClient = useContext(BAIAnonymousClientContext);
    if (!baiAnonymousClient) {
      throw new Error(
        'useBAIAnonymousClient must be used within a BAIClientProvider',
      );
    }
    return baiAnonymousClient(apiEndpoint);
  } catch (error) {
    logger.error('Error using BAI Anonymous Client:', error);
    throw error;
  }
};

export default useBAIAnonymousClient;
