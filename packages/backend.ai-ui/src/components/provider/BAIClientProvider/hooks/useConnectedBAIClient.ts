import { BAIClientContext } from '../context';
import { BAIClient } from '../types';
import { use, useContext } from 'react';

const useConnectedBAIClient = (): BAIClient => {
  try {
    const baiClientPromise = useContext(BAIClientContext);
    if (!baiClientPromise) {
      throw new Error('useBAIClient must be used within a BAIClientProvider');
    }
    const baiClient = use(baiClientPromise);
    return baiClient;
  } catch (error) {
    console.error('Error using BAI Client:', error);
    throw error;
  }
};

export default useConnectedBAIClient;
