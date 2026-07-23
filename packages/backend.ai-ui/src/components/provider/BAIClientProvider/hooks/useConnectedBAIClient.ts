import { BAIClientContext } from '../context';
import { BAIClient } from '../types';
import { use } from 'react';

const useConnectedBAIClient = (): BAIClient => {
  const baiClientPromise = use(BAIClientContext);
  if (!baiClientPromise) {
    throw new Error('useBAIClient must be used within a BAIClientProvider');
  }
  const baiClient = use(baiClientPromise);
  return baiClient;
};

export default useConnectedBAIClient;
