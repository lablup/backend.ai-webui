import { BAIAnonymousClientContext } from '../context';
import { BAIClient } from '../types';
import { useContext } from 'react';

const useBAIAnonymousClient = (apiEndpoint: string): BAIClient => {
  try {
    const baiAnonymousClient = useContext(BAIAnonymousClientContext);
    if (!baiAnonymousClient) {
      throw new Error(
        'useBAIAnonymousClient must be used within a BAIClientProvider',
      );
    }
    return baiAnonymousClient(apiEndpoint);
  } catch (error) {
    console.error('Error using BAI Anonymous Client:', error);
    throw error;
  }
};

export default useBAIAnonymousClient;
