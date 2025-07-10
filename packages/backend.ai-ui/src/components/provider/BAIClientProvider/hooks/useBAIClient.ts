import BAIClientContext from '../context';
import { BAIClient } from '../types';
import { useContext } from 'react';

const useBAIClient = (): BAIClient => {
  try {
    const context = useContext(BAIClientContext);
    if (!context) {
      throw new Error('useBAIClient must be used within a BAIClientProvider');
    }
    return context;
  } catch (error) {
    console.error('Error using BAI Client:', error);
    throw error;
  }
};

export default useBAIClient;
