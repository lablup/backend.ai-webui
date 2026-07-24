import useBAILogger from '../../../../hooks/useBAILogger';
import { BAIAnonymousClientContext } from '../context';
import { BAIClient } from '../types';
import { use } from 'react';

const useBAIAnonymousClient = (apiEndpoint: string): BAIClient => {
  const { logger } = useBAILogger();
  // `use` cannot be called inside try/catch, so read the context first.
  const baiAnonymousClient = use(BAIAnonymousClientContext);

  try {
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
